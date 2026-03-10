import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI, { toFile } from "openai";
import multer from "multer";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const upload = multer({
  dest: "/tmp/uploads",
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/webm", "audio/wav", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/m4a", "audio/x-m4a"];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are accepted"));
    }
  },
});

async function convertToWav(inputPath: string): Promise<string> {
  const outputPath = inputPath + ".wav";
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i", inputPath, "-vn", "-f", "wav", "-ar", "16000", "-ac", "1",
      "-acodec", "pcm_s16le", "-y", outputPath,
    ]);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
    ffmpeg.on("error", reject);
  });
}

const SYSTEM_PROMPT = `You are Continuum Systems, an advanced welding intelligence assistant for Miller welding equipment.

Scope:
- Only answer questions about welding, fabrication, safety, WPS/procedure, troubleshooting, metallurgy, fit-up, consumables, parameters, weld defects, inspection, and relevant codes or standards.
- Specialize in Miller Continuum Systems Advanced MIG welding equipment and processes (Accu-Pulse, Versa-Pulse, RMD).
- If the message is not clearly about welding, respond with ONE short sentence redirecting to welding (example: "I can help with welding — what process and material are you working with?").
- Do NOT provide relationship, life, personal, creative writing, or general coaching advice.

Tone:
- Calm, confident, practical.
- Speak like an experienced journeyperson who knows both the correct code answer and the real-world field trick.
- No fluff. No motivational coaching. No off-topic commentary.

Format:
- Plain text only.
- No markdown.
- No headings.
- No bullet lists.
- No bold or special formatting.
- Short, clean paragraphs only.

How to answer:
- Start with the correct code-compliant guideline or standard practice.
- Then optionally add one short "Shop Tip" or "Field Insight" from experienced welders.
- Ask 1 clarifying question only if necessary.
- Prioritize safety and code-compliant best practice.
- Give step-by-step troubleshooting in the logical order a real welder would follow.
- Include realistic parameter ranges when relevant (amps, volts, wire feed speed, gas flow, cup size, stickout, travel angle, travel speed).
- If unsafe conditions are possible (fumes, confined space, energized equipment, hot work), warn clearly and early.

Length:
- Keep responses concise, practical, and jobsite-ready.`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  app.get("/api/conversations", async (_req, res) => {
    try {
      const convos = await storage.getAllConversations();
      res.json(convos);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const msgs = await storage.getMessagesByConversation(id);
      res.json({ ...conversation, messages: msgs });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const { title } = req.body;
      const conversation = await storage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Content is required" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      await storage.createMessage(conversationId, "user", content);

      const allMessages = await storage.getMessagesByConversation(conversationId);
      const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...allMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 8192,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }

      await storage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  app.get("/api/job-log", async (_req, res) => {
    try {
      const entries = await storage.getAllJobLogEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching job log:", error);
      res.status(500).json({ error: "Failed to fetch job log" });
    }
  });

  app.post("/api/job-log", async (req, res) => {
    try {
      const { title, notes } = req.body;
      if (!title || !notes) {
        return res.status(400).json({ error: "Title and notes are required" });
      }
      const entry = await storage.createJobLogEntry({ title, notes });
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating job log entry:", error);
      res.status(500).json({ error: "Failed to create entry" });
    }
  });

  app.delete("/api/job-log/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJobLogEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job log entry:", error);
      res.status(500).json({ error: "Failed to delete entry" });
    }
  });

  app.delete("/api/job-log", async (_req, res) => {
    try {
      await storage.clearJobLogEntries();
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing job log:", error);
      res.status(500).json({ error: "Failed to clear log" });
    }
  });

  app.post("/api/transcribe", upload.single("file"), async (req, res) => {
    let inputPath: string | null = null;
    let wavPath: string | null = null;

    try {
      const file = (req as any).file;
      if (!file?.path) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      inputPath = file.path;
      wavPath = await convertToWav(inputPath);

      const wavBuffer = fs.readFileSync(wavPath);
      const audioFile = await toFile(wavBuffer, "audio.wav");

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "gpt-4o-mini-transcribe",
      });

      res.json({ text: transcription.text || "" });
    } catch (error) {
      console.error("Transcribe error:", error);
      res.status(500).json({ error: "Transcription failed" });
    } finally {
      try {
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (wavPath && fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
      } catch {}
    }
  });

  return httpServer;
}
