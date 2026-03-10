import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

type Procedure = {
  id: string;
  title: string;
  tags: string[];
  steps: string[];
};

const PROCEDURES: Procedure[] = [
  {
    id: "p1",
    title: "Miller Continuum Accu-Pulse® Setup",
    tags: ["Accu-Pulse", "Miller", "setup", "MIG"],
    steps: [
      "Select Accu-Pulse mode on your Miller Continuum power source.",
      "Choose wire diameter and material type on the control panel.",
      "Set base parameters using Miller's recommended settings for your material thickness.",
      "Adjust arc control for desired weld characteristics (smoother or more aggressive).",
      "Run test bead on scrap; fine-tune using Miller's digital controls for optimal performance.",
    ],
  },
  {
    id: "p2",
    title: "Miller Versa-Pulse™ for Thin Materials",
    tags: ["Versa-Pulse", "Miller", "thin gauge", "low heat"],
    steps: [
      "Select Versa-Pulse mode for materials 1/4 inch (6.35mm) and thinner.",
      "Confirm wire feed speed and voltage on Miller Continuum display.",
      "This process provides lowest heat input with minimal spatter.",
      "Ideal for gap filling and fast travel speeds on sheet metal.",
      "Adjust puddle control for optimal wet-out and appearance.",
    ],
  },
  {
    id: "p3",
    title: "Miller RMD® Process for Gap Handling",
    tags: ["RMD", "Miller", "gaps", "low heat"],
    steps: [
      "Select RMD mode on Miller Continuum for best gap handling capability.",
      "Use for joints with fit-up gaps or thin materials requiring low heat.",
      "Miller RMD provides controlled metal transfer with minimal heat input.",
      "Adjust wire feed speed per Miller's recommended parameters.",
      "Excellent for out-of-position welding with superior gap bridging.",
    ],
  },
  {
    id: "p4",
    title: "Continuum System Troubleshooting",
    tags: ["troubleshooting", "Miller", "diagnostics"],
    steps: [
      "Check Miller Continuum display for error codes or warnings.",
      "Verify gas flow using flowmeter (20-30 CFH typical for MIG).",
      "Inspect drive rolls and liner - Miller Tru-Feed technology requires clean path.",
      "Confirm contact tip size matches wire diameter being used.",
      "Use Miller's web interface to view detailed diagnostics and arc hours.",
    ],
  },
  {
    id: "p5",
    title: "Pre-Weld Safety Checklist",
    tags: ["safety", "PPE", "pre-weld"],
    steps: [
      "Inspect welding helmet and ensure auto-darkening shade is functional (shade 10-13 for MIG).",
      "Verify proper PPE: leather gloves, fire-resistant jacket, steel-toe boots, safety glasses.",
      "Check ventilation - ensure adequate airflow or use fume extraction hood.",
      "Inspect work area for fire hazards, flammable materials within 35 feet must be removed or shielded.",
      "Confirm ground clamp has clean, tight connection to workpiece.",
      "Verify fire extinguisher is accessible and charged.",
    ],
  },
  {
    id: "p6",
    title: "Gas Cylinder Safety & Setup",
    tags: ["gas", "safety", "setup", "argon", "CO2"],
    steps: [
      "Secure cylinder upright with chain or strap - never lay mixed gas cylinders on their side.",
      "Crack valve briefly before attaching regulator to clear debris.",
      "Attach regulator and set flow rate (20-25 CFH for most MIG applications).",
      "Check all connections for leaks using soapy water solution.",
      "Open cylinder valve fully, then back off 1/4 turn.",
      "When done welding, close cylinder valve first, then bleed lines and close regulator.",
    ],
  },
];

export default function ProceduresPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("p1");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PROCEDURES;
    return PROCEDURES.filter((p) => {
      const hay = `${p.title} ${p.tags.join(" ")} ${p.steps.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="page-procedures">
      <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-[#999] hover:text-white transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-bold text-lg" data-testid="text-page-title">
          Procedures
        </h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-4 pb-24">
        <p className="text-[#999] text-sm">
          Tap a procedure to expand steps. Use search to filter.
        </p>

        <div className="flex items-center gap-3 bg-[#111] border border-[#1f1f1f] rounded-2xl px-4 h-12">
          <Search className="w-4 h-4 text-[#555]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search procedures..."
            className="flex-1 bg-transparent text-white text-sm placeholder-[#555] focus:outline-none"
            data-testid="input-search-procedures"
          />
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#555] text-sm">No procedures match your search.</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((proc) => {
            const isOpen = openId === proc.id;
            return (
              <div
                key={proc.id}
                className="bg-[#111] border border-[#1f1f1f] rounded-2xl overflow-hidden"
                data-testid={`procedure-${proc.id}`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : proc.id)}
                  className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-[#1a1a1a] transition-colors"
                  data-testid={`button-toggle-${proc.id}`}
                >
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {proc.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {proc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#006bae]/15 text-[#006bae] border border-[#006bae]/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#555] flex-shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#555] flex-shrink-0 mt-1" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#1f1f1f]">
                    <div className="space-y-3 mt-3">
                      {proc.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#006bae] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-[10px] font-bold">{i + 1}</span>
                          </div>
                          <p className="text-[#ccc] text-sm leading-relaxed flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("/talk")}
                      className="mt-5 w-full bg-[#006bae] hover:bg-[#0078c4] rounded-full py-3.5 flex items-center justify-center gap-2 transition-colors"
                      data-testid={`button-ask-about-${proc.id}`}
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-bold">Ask Expert About This</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
