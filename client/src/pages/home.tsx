import { useLocation } from "wouter";
import { MessageCircle, BookOpen, Wrench, ClipboardList } from "lucide-react";

export default function HomePage() {
  const [, navigate] = useLocation();

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
            style={{ fontFamily: "var(--font-sans)" }}
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
          className="w-full bg-[#006bae] hover:bg-[#0078c4] active:scale-[0.99] transition-all rounded-full py-4 px-6 flex items-center justify-center gap-3 mb-8"
          data-testid="button-ask-expert"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-white text-base font-black tracking-wide">
            ASK YOUR EXPERT
          </span>
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
    </div>
  );
}
