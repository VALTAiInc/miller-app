import { useLocation } from "wouter";
import { ArrowLeft, BarChart3, Wrench, FileText, ChevronRight } from "lucide-react";

const PARAMETER_CHARTS = [
  {
    id: "mig-steel",
    title: "MIG Steel Parameters",
    description: "Wire feed speed, voltage, and amperage for carbon steel",
    rows: [
      { thickness: "24 ga (0.024\")", wire: "0.023\"", wfs: "120-150 ipm", volts: "15-16V", amps: "30-50A", gas: "75/25 Ar/CO2" },
      { thickness: "20 ga (0.036\")", wire: "0.023\"", wfs: "150-200 ipm", volts: "16-17V", amps: "40-70A", gas: "75/25 Ar/CO2" },
      { thickness: "18 ga (0.048\")", wire: "0.030\"", wfs: "180-250 ipm", volts: "17-18V", amps: "60-90A", gas: "75/25 Ar/CO2" },
      { thickness: "16 ga (0.060\")", wire: "0.030\"", wfs: "250-350 ipm", volts: "18-19V", amps: "80-110A", gas: "75/25 Ar/CO2" },
      { thickness: "14 ga (0.075\")", wire: "0.035\"", wfs: "300-400 ipm", volts: "19-21V", amps: "110-140A", gas: "75/25 Ar/CO2" },
      { thickness: "3/16\" (0.188\")", wire: "0.035\"", wfs: "350-500 ipm", volts: "21-24V", amps: "140-190A", gas: "75/25 Ar/CO2" },
      { thickness: "1/4\" (0.250\")", wire: "0.045\"", wfs: "250-400 ipm", volts: "24-28V", amps: "180-250A", gas: "75/25 Ar/CO2" },
    ],
  },
  {
    id: "mig-aluminum",
    title: "MIG Aluminum Parameters",
    description: "Settings for aluminum alloys (4043/5356 wire)",
    rows: [
      { thickness: "1/16\" (0.063\")", wire: "0.030\" 4043", wfs: "300-400 ipm", volts: "16-18V", amps: "70-100A", gas: "100% Argon" },
      { thickness: "3/32\" (0.094\")", wire: "0.030\" 4043", wfs: "350-450 ipm", volts: "18-20V", amps: "90-120A", gas: "100% Argon" },
      { thickness: "1/8\" (0.125\")", wire: "0.035\" 4043", wfs: "300-450 ipm", volts: "20-22V", amps: "110-150A", gas: "100% Argon" },
      { thickness: "3/16\" (0.188\")", wire: "0.035\" 5356", wfs: "350-500 ipm", volts: "22-25V", amps: "150-200A", gas: "100% Argon" },
      { thickness: "1/4\" (0.250\")", wire: "3/64\" 5356", wfs: "250-400 ipm", volts: "25-28V", amps: "200-275A", gas: "100% Argon" },
    ],
  },
  {
    id: "mig-stainless",
    title: "MIG Stainless Parameters",
    description: "Settings for 300-series stainless steel (308L wire)",
    rows: [
      { thickness: "20 ga (0.036\")", wire: "0.023\" 308L", wfs: "150-200 ipm", volts: "16-17V", amps: "40-65A", gas: "90/7.5/2.5 He/Ar/CO2" },
      { thickness: "18 ga (0.048\")", wire: "0.030\" 308L", wfs: "180-250 ipm", volts: "17-18V", amps: "55-85A", gas: "98/2 Ar/CO2" },
      { thickness: "16 ga (0.060\")", wire: "0.030\" 308L", wfs: "250-320 ipm", volts: "18-19V", amps: "75-100A", gas: "98/2 Ar/CO2" },
      { thickness: "14 ga (0.075\")", wire: "0.035\" 308L", wfs: "280-380 ipm", volts: "19-21V", amps: "100-135A", gas: "98/2 Ar/CO2" },
      { thickness: "3/16\" (0.188\")", wire: "0.035\" 308L", wfs: "350-450 ipm", volts: "22-25V", amps: "135-180A", gas: "98/2 Ar/CO2" },
    ],
  },
];

const TROUBLESHOOTING_GUIDES = [
  {
    id: "porosity",
    title: "Porosity",
    symptoms: "Visible gas pockets in weld bead or exposed after grinding",
    checks: [
      "Verify gas flow rate (20-30 CFH typical)",
      "Check gas hose for leaks or kinks",
      "Inspect nozzle for spatter blockage",
      "Confirm correct gas type for material",
      "Reduce travel speed if wind/draft present",
      "Ensure base metal is clean and dry",
    ],
  },
  {
    id: "spatter",
    title: "Excessive Spatter",
    symptoms: "Large or frequent spatter balls on base metal and nozzle",
    checks: [
      "Verify voltage is not too high or too low",
      "Check wire feed speed alignment with voltage",
      "Inspect contact tip for wear (correct size?)",
      "Confirm proper stickout (3/8\" to 1/2\" typical)",
      "Consider switching to Accu-Pulse mode for cleaner arc",
      "Clean nozzle and apply anti-spatter compound",
    ],
  },
  {
    id: "undercut",
    title: "Undercut",
    symptoms: "Groove melted into base metal alongside weld toe",
    checks: [
      "Reduce travel speed to allow proper fill",
      "Lower voltage if arc is too wide",
      "Adjust work angle (tilt toward undercut side)",
      "Consider weave technique with pause at toes",
      "Use Versa-Pulse for lower heat input on thinner material",
    ],
  },
  {
    id: "wire-feed",
    title: "Erratic Wire Feed",
    symptoms: "Wire stutters, birdnests, or stops feeding mid-weld",
    checks: [
      "Inspect drive rolls for correct size and tension",
      "Check liner for debris or kinks (replace if over 500hrs)",
      "Verify contact tip is correct size and not worn",
      "Confirm wire spool spins freely (no drag)",
      "Check for proper wire alignment through gun",
      "Miller Tru-Feed technology requires clean wire path",
    ],
  },
];

export default function BlueprintsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0a]" data-testid="page-blueprints">
      <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-[#999] hover:text-white transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-bold text-lg" data-testid="text-page-title">
          Manual & Reference
        </h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8 pb-24">
        <div>
          <p className="text-[#999] text-sm mb-1">
            Quick reference charts, parameter guides, and documentation
          </p>
        </div>

        <section>
          <h2 className="text-[#666] text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Parameter Charts
          </h2>
          <div className="space-y-4">
            {PARAMETER_CHARTS.map((chart) => (
              <div
                key={chart.id}
                className="bg-[#111] border border-[#1f1f1f] rounded-2xl overflow-hidden"
                data-testid={`chart-${chart.id}`}
              >
                <div className="px-4 py-3 border-b border-[#1f1f1f]">
                  <h3 className="text-white font-bold text-base">{chart.title}</h3>
                  <p className="text-[#777] text-xs mt-0.5">{chart.description}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[#666] border-b border-[#1a1a1a]">
                        <th className="text-left px-3 py-2 font-semibold">Thickness</th>
                        <th className="text-left px-3 py-2 font-semibold">Wire</th>
                        <th className="text-left px-3 py-2 font-semibold">WFS</th>
                        <th className="text-left px-3 py-2 font-semibold">Volts</th>
                        <th className="text-left px-3 py-2 font-semibold">Amps</th>
                        <th className="text-left px-3 py-2 font-semibold">Gas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chart.rows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-[#1a1a1a] last:border-b-0 hover:bg-[#1a1a1a] transition-colors"
                        >
                          <td className="px-3 py-2 text-[#ccc] font-medium whitespace-nowrap">
                            {row.thickness}
                          </td>
                          <td className="px-3 py-2 text-[#999] whitespace-nowrap">{row.wire}</td>
                          <td className="px-3 py-2 text-[#006bae] font-semibold whitespace-nowrap">
                            {row.wfs}
                          </td>
                          <td className="px-3 py-2 text-[#999] whitespace-nowrap">{row.volts}</td>
                          <td className="px-3 py-2 text-[#999] whitespace-nowrap">{row.amps}</td>
                          <td className="px-3 py-2 text-[#777] whitespace-nowrap">{row.gas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[#666] text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" />
            Troubleshooting Guides
          </h2>
          <div className="space-y-3">
            {TROUBLESHOOTING_GUIDES.map((guide) => (
              <details
                key={guide.id}
                className="bg-[#111] border border-[#1f1f1f] rounded-2xl overflow-hidden group"
                data-testid={`guide-${guide.id}`}
              >
                <summary className="px-4 py-3.5 cursor-pointer flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors list-none">
                  <ChevronRight className="w-4 h-4 text-[#555] transition-transform group-open:rotate-90 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base">{guide.title}</h3>
                    <p className="text-[#777] text-xs mt-0.5">{guide.symptoms}</p>
                  </div>
                </summary>
                <div className="px-4 pb-4 pt-1">
                  <div className="space-y-2.5">
                    {guide.checks.map((check, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#006bae]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#006bae] text-[10px] font-bold">{i + 1}</span>
                        </div>
                        <p className="text-[#ccc] text-sm leading-relaxed">{check}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[#666] text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Documentation
          </h2>
          <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl overflow-hidden">
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#006bae]/10 border border-[#1f1f1f] flex flex-col items-center justify-center gap-1">
                <div className="w-6 h-0.5 rounded bg-[#006bae]/40" />
                <div className="w-6 h-0.5 rounded bg-[#006bae]/40" />
                <div className="w-6 h-0.5 rounded bg-[#006bae]/40" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-base">Miller Operations Manual</h3>
                <p className="text-[#777] text-xs mt-0.5">Full Continuum system documentation</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#555]" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
