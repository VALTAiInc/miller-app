import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Send, Mic, MicOff, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import type { Conversation, Message } from "@shared/schema";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function TalkPage() {
  const [, navigate] = useLocation();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I'm Continuum Systems, your Miller welding intelligence assistant. I specialize in Continuum Advanced MIG processes including Accu-Pulse, Versa-Pulse, and RMD. What are you working on today?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", { title: "New Chat" });
      return res.json();
    },
    onSuccess: (data: Conversation) => {
      setActiveConversationId(data.id);
      setChatMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "I'm Continuum Systems, your Miller welding intelligence assistant. I specialize in Continuum Advanced MIG processes including Accu-Pulse, Versa-Pulse, and RMD. What are you working on today?",
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const loadConversation = async (id: number) => {
    setActiveConversationId(id);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setChatMessages(
          data.messages.map((m: Message) => ({
            id: String(m.id),
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        );
      } else {
        setChatMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              "I'm Continuum Systems, your Miller welding intelligence assistant. What are you working on today?",
          },
        ]);
      }
    } catch {
      console.error("Failed to load conversation");
    }
  };

  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      setActiveConversationId(null);
      setChatMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "I'm Continuum Systems, your Miller welding intelligence assistant. What are you working on today?",
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    let conversationId = activeConversationId;
    if (!conversationId) {
      const res = await apiRequest("POST", "/api/conversations", {
        title: text.slice(0, 50),
      });
      const conv: Conversation = await res.json();
      conversationId = conv.id;
      setActiveConversationId(conv.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsStreaming(true);

    const assistantId = `assistant-${Date.now()}`;
    setChatMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.content) {
              setChatMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + event.content }
                    : m
                )
              );
            }
            if (event.done) break;
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) {
          setInputText("Transcribing...");
          try {
            const formData = new FormData();
            formData.append("file", blob, "recording.webm");
            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.text) {
              setInputText("");
              sendMessage(data.text);
            } else {
              setInputText("");
            }
          } catch {
            setInputText("");
          }
        }
      };

      recorder.start(100);
      setIsRecording(true);
    } catch {
      console.error("Mic permission denied");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col" data-testid="page-talk">
      <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-[#999] hover:text-white transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg" data-testid="text-page-title">
            Continuum Expert
          </h1>
          <p className="text-[#666] text-xs">Miller Welding Intelligence</p>
        </div>
        <button
          onClick={() => createConversation.mutate()}
          className="text-[#006bae] hover:text-[#0078c4] transition-colors p-2"
          data-testid="button-new-chat"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {conversations && conversations.length > 0 && (
        <div className="bg-[#0d0d0d] border-b border-[#1a1a1a] px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
          {conversations.slice(0, 10).map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeConversationId === c.id
                  ? "bg-[#006bae] text-white"
                  : "bg-[#1a1a1a] text-[#999] hover:bg-[#222]"
              }`}
              data-testid={`button-conversation-${c.id}`}
            >
              <span className="max-w-[120px] truncate">{c.title}</span>
              {activeConversationId === c.id && (
                <Trash2
                  className="w-3 h-3 ml-1 opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation.mutate(c.id);
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`message-${msg.role}-${msg.id}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[#006bae] text-white rounded-br-md"
                  : "bg-[#1a1a1a] text-[#e6e6e6] border border-[#2a2a2a] rounded-bl-md"
              }`}
            >
              {msg.content === "" && isStreaming ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#006bae]" />
                  <span className="text-[#999] text-sm">Thinking...</span>
                </div>
              ) : (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border-t border-[#1a1a1a] px-4 py-3 pb-6">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <button
            onClick={toggleRecording}
            disabled={isStreaming}
            className={`p-3 rounded-full transition-all ${
              isRecording
                ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse"
                : "bg-[#1a1a1a] text-[#999] hover:text-white hover:bg-[#222]"
            } disabled:opacity-40`}
            data-testid="button-mic"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Recording..." : "Ask about welding..."}
              disabled={isStreaming || isRecording}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-5 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#006bae] disabled:opacity-40 transition-colors"
              data-testid="input-message"
            />
          </div>

          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isStreaming || isRecording}
            className="p-3 rounded-full bg-[#006bae] text-white hover:bg-[#0078c4] disabled:opacity-30 disabled:hover:bg-[#006bae] transition-all"
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
