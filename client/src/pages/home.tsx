import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { MessageCircle, BookOpen, Wrench, ClipboardList, Globe, Square, Mic } from "lucide-react";

const BRIDGE_API = "https://weldwise-backend-gold-production.up.railway.app";

const LANGUAGES = [
  { code: "en",    label: "English",    native: "English",    flag: "🇺🇸" },
  { code: "es",    label: "Spanish",    native: "Español",    flag: "🇲🇽" },
  { code: "fr",    label: "French",     native: "Français",   flag: "🇫🇷" },
  { code: "de",    label: "German",     native: "Deutsch",    flag: "🇩🇪" },
  { code: "pt",    label: "Portuguese", native: "Português",  flag: "🇧🇷" },
  { code: "zh",    label: "Chinese",    native: "中文",        flag: "🇨🇳" },
  { code: "ja",    label: "Japanese",   native: "日本語",      flag: "🇯🇵" },
  { code: "ko",    label: "Korean",     native: "한국어",      flag: "🇰🇷" },
  { code: "ar",    label: "Arabic",     native: "العربية",    flag: "🇸🇦" },
  { code: "hi",    label: "Hindi",      native: "हिंदी",       flag: "🇮🇳" },
  { code: "fil",   label: "Filipino",   native: "Filipino",   flag: "🇵🇭" },
  { code: "ar-LB", label: "Lebanese",   native: "عربي لبناني", flag: "🇱🇧" },
];

function getLang(code: string) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

function LangPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = getLang(value);

  return (
    <div className="flex-1 relative">
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-left"
        data-testid="button-lang-picker"
      >
        <span className="text-lg">{current.flag}</span>
        <span className="text-white text-sm font-semibold flex-1">{current.label}</span>
        <span className="text-white/40 text-xs">▼</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-white/12 overflow-hidden"
            style={{ backgroundColor: "#1A1A2E", maxHeight: "70vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-bold text-center py-4 text-sm tracking-wide border-b border-white/8">
              Select Language
            </p>
            <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { onChange(lang.code); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{ backgroundColor: lang.code === value ? "rgba(0,107,174,0.15)" : "transparent" }}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: lang.code === value ? "#006bae" : "rgba(255,255,255,0.9)" }}
                    >
                      {lang.label}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">{lang.native}</div>
                  </div>
                  {lang.code === value && <span className="text-[#006bae] text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MicButton({ isRecording, isProcessing, onStart, onStop, color }: {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <div
            className="absolute w-20 h-20 rounded-full border-2 animate-ping opacity-60"
            style={{ borderColor: color }}
          />
        )}
        <button
          onMouseDown={onStart}
          onMouseUp={onStop}
          onTouchStart={(e) => { e.preventDefault(); onStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onStop(); }}
          disabled={isProcessing}
          className="w-16 h-16 rounded-full flex items-center justify-center border border-white/15 transition-all select-none"
          style={{
            backgroundColor: isRecording ? color : "rgba(255,255,255,0.1)",
            opacity: isProcessing ? 0.5 : 1,
          }}
          data-testid="button-translator-mic"
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isRecording ? (
            <Square className="w-6 h-6 text-white fill-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
      <span
        className="text-xs font-medium"
        style={{ color: isRecording ? color : "rgba(255,255,255,0.25)" }}
      >
        {isProcessing ? "Translating..." : isRecording ? "Release to translate" : "Hold to speak"}
      </span>
    </div>
  );
}

function PersonPanel({ lang, setLang, transcript, translation, targetLang,
  isRecording, isProcessing, onStart, onStop, color, flipped, onClose }: {
  lang: string; setLang: (c: string) => void;
  transcript: string; translation: string; targetLang: string;
  isRecording: boolean; isProcessing: boolean;
  onStart: () => void; onStop: () => void;
  color: string; flipped: boolean; onClose: () => void;
}) {
  return (
    <div
      className="flex-1 flex flex-col px-5 py-3 gap-3"
      style={{ transform: flipped ? "rotate(180deg)" : "none" }}
    >
      <div className="flex items-center gap-3">
        <LangPicker value={lang} onChange={setLang} />
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-2xl text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: "#006bae" }}
          data-testid="button-translator-done"
        >
          Done
        </button>
      </div>

      <div
        className="flex-1 rounded-2xl p-4 border border-white/7 flex flex-col justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", minHeight: "100px" }}
      >
        {transcript ? (
          <>
            <p className="text-white/35 text-[10px] font-semibold tracking-widest mb-1">SAID</p>
            <p className="text-white/55 text-sm italic leading-relaxed">{transcript}</p>
            <div className="h-px my-3 rounded" style={{ backgroundColor: color }} />
            <p className="text-white/35 text-[10px] font-semibold tracking-widest mb-1">
              → {getLang(targetLang).flag} {getLang(targetLang).label}
            </p>
            <p className="text-white text-base font-bold leading-relaxed">{translation}</p>
          </>
        ) : (
          <p className="text-white/18 text-sm text-center italic">Hold mic to speak</p>
        )}
      </div>

      <MicButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        onStart={onStart}
        onStop={onStop}
        color={color}
      />
    </div>
  );
}

function TranslatorModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [langA, setLangA] = useState("en");
  const [langB, setLangB] = useState("es");
  const [aRecording, setARecording] = useState(false);
  const [aProcessing, setAProcessing] = useState(false);
  const [aTranscript, setATranscript] = useState("");
  const [aTranslation, setATranslation] = useState("");
  const [bRecording, setBRecording] = useState(false);
  const [bProcessing, setBProcessing] = useState(false);
  const [bTranscript, setBTranscript] = useState("");
  const [bTranslation, setBTranslation] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async (speaker: "A" | "B") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      recorder.start();
      speaker === "A" ? setARecording(true) : setBRecording(true);
    } catch {
      alert("Microphone access is required for translation.");
    }
  }, []);

  const stopAndTranslate = useCallback(async (speaker: "A" | "B") => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    const myLang = speaker === "A" ? langA : langB;
    const theirLang = speaker === "A" ? langB : langA;

    speaker === "A" ? setARecording(false) : setBRecording(false);
    speaker === "A" ? setAProcessing(true) : setBProcessing(true);

    recorder.stop();
    recorder.stream.getTracks().forEach((t) => t.stop());

    await new Promise<void>((res) => {
      recorder.onstop = () => res();
    });

    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("sourceLanguage", myLang);
      formData.append("targetLanguage", theirLang);
      formData.append("callerApp", "MillerContinuum");

      const response = await fetch(`${BRIDGE_API}/api/translate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Translation failed" }));
        throw new Error(err.error || "Translation failed");
      }

      const result = await response.json();

      if (speaker === "A") {
        setATranscript(result.transcript);
        setBTranslation(result.translation);
      } else {
        setBTranscript(result.transcript);
        setATranslation(result.translation);
      }

      if (result.audioBase64) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const byteChars = atob(result.audioBase64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const audioBlob = new Blob([byteArr], { type: "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong with translation.");
    } finally {
      speaker === "A" ? setAProcessing(false) : setBProcessing(false);
    }
  }, [langA, langB]);

  useEffect(() => {
    if (!visible) {
      setATranscript(""); setATranslation("");
      setBTranscript(""); setBTranslation("");
      setARecording(false); setBRecording(false);
      setAProcessing(false); setBProcessing(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "#0A0A0F" }}
      data-testid="modal-translator"
    >
      <PersonPanel
        lang={langB} setLang={setLangB}
        transcript={bTranscript} translation={bTranslation} targetLang={langA}
        isRecording={bRecording} isProcessing={bProcessing}
        onStart={() => startRecording("B")} onStop={() => stopAndTranslate("B")}
        color="#006bae" flipped={true} onClose={onClose}
      />

      <div className="flex items-center px-5 h-8">
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center mx-3 border border-white/10 text-base"
          style={{ backgroundColor: "#1A1A2E" }}
        >
          🌐
        </div>
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
      </div>

      <PersonPanel
        lang={langA} setLang={setLangA}
        transcript={aTranscript} translation={aTranslation} targetLang={langB}
        isRecording={aRecording} isProcessing={aProcessing}
        onStart={() => startRecording("A")} onStop={() => stopAndTranslate("A")}
        color="#4ECDC4" flipped={false} onClose={onClose}
      />
    </div>
  );
}

export default function HomePage() {
  const [, navigate] = useLocation();
  const [translatorVisible, setTranslatorVisible] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col" data-testid="page-home">
      <div className="flex-1 flex flex-col items-center px-5 pt-8 pb-24 max-w-lg mx-auto w-full">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/LOGOVALT.png"
            alt="VALT Logo"
            className="h-16 object-contain"
            data-testid="img-logo"
          />
          <span className="text-[#999] text-xs mt-1.5 tracking-wide">Powered by VALT</span>
        </div>

        <div className="w-full rounded-3xl overflow-hidden mb-6 shadow-2xl">
          <img
            src="/images/HEROIMAGE.jpg"
            alt="Miller Continuum Welder"
            className="w-full h-64 object-cover"
            data-testid="img-hero"
          />
        </div>

        <div className="text-center mb-6">
          <h1
            className="text-5xl font-black text-white tracking-[3px] mb-2"
            data-testid="text-title"
          >
            CONTINUUM™
          </h1>
          <p className="text-[#cfcfcf] text-lg" data-testid="text-subtitle">
            Advanced MIG Intelligence
          </p>
        </div>

        <button
          onClick={() => navigate("/talk")}
          className="w-full bg-[#006bae] hover:bg-[#0078c4] active:scale-[0.99] transition-all rounded-full py-4 px-6 flex items-center justify-center gap-3 mb-4"
          data-testid="button-ask-expert"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-white text-base font-black tracking-wide">
            ASK YOUR EXPERT
          </span>
        </button>

        <button
          onClick={() => setTranslatorVisible(true)}
          className="flex items-center justify-center gap-2 border border-[#006bae] rounded-full py-2.5 px-8 mb-8 bg-[#111] hover:bg-[#1a1a1a] active:scale-[0.98] transition-all"
          data-testid="button-translator"
        >
          <div className="w-5 h-5 rounded-full bg-[#006bae] flex items-center justify-center">
            <Globe className="w-3 h-3 text-white" />
          </div>
          <span className="text-[#006bae] text-sm font-bold tracking-wide">Translator</span>
        </button>

        <div className="w-full">
          <p className="text-[#666] text-xs uppercase tracking-widest mb-3 px-1">Quick Access</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/blueprints")}
              className="flex flex-col items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 hover:bg-[#222] transition-colors"
              data-testid="button-quick-blueprints"
            >
              <div className="w-10 h-10 rounded-xl bg-[#006bae]/15 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#006bae]" />
              </div>
              <span className="text-[#ccc] text-xs font-semibold">Reference</span>
            </button>
            <button
              onClick={() => navigate("/procedures")}
              className="flex flex-col items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 hover:bg-[#222] transition-colors"
              data-testid="button-quick-procedures"
            >
              <div className="w-10 h-10 rounded-xl bg-[#006bae]/15 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#006bae]" />
              </div>
              <span className="text-[#ccc] text-xs font-semibold">Procedures</span>
            </button>
            <button
              onClick={() => navigate("/job-log")}
              className="flex flex-col items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 hover:bg-[#222] transition-colors"
              data-testid="button-quick-joblog"
            >
              <div className="w-10 h-10 rounded-xl bg-[#006bae]/15 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#006bae]" />
              </div>
              <span className="text-[#ccc] text-xs font-semibold">Job Log</span>
            </button>
          </div>
        </div>
      </div>

      <TranslatorModal visible={translatorVisible} onClose={() => setTranslatorVisible(false)} />
    </div>
  );
}
