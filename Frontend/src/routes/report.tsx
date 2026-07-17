import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Download, Share2, Check, FileText, Compass, Loader2 } from "lucide-react";
import { personas } from "@/data/personas";

export const Route = createFileRoute("/report")({
  component: ReportPage,
  head: () => ({ meta: [{ title: "Research Report — SynthScope" }] }),
});

const sections = [
  {
    id: "summary",
    title: "Executive Summary",
    body: "Across 128 synthetic personas, Nimbus Notes scored 8.4/10 on product fit, with strongest signal from research-heavy teams. Sentiment skews positive (68%), with clear opportunities in onboarding clarity and pricing transparency.",
  },
  {
    id: "overview",
    title: "Persona Overview",
    body: "The panel spans PMs, designers, researchers, indie founders, and enterprise architects across 4 continents. Behavioral diversity was engineered to surface edge cases early.",
  },
  {
    id: "survey",
    title: "Survey Results",
    body: "Top-rated features: AI suggestions (+38% delight), collaboration (+22%), search (+18%). Most-flagged concern: onboarding drop-off between steps 2 and 3.",
  },
  {
    id: "interviews",
    title: "Interview Highlights",
    body: "Recurring quote: 'This would save me an hour a day if pricing were clearer.' Enterprise personas asked for SOC 2 evidence. Indie personas asked for a lifetime plan.",
  },
  {
    id: "behavior",
    title: "Behavior Analysis",
    body: "Session simulations show peak engagement in Days 3–7. Personas who complete the guided tour convert to weekly usage at 2.4× the baseline.",
  },
];

function ReportPage() {
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [activeSection, setActiveSection] = useState("summary");

  const startDownload = async () => {
    if (downloading || downloadComplete) return;
    setDownloading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setDownloading(false);
    setDownloadComplete(true);
    setTimeout(() => setDownloadComplete(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 text-[#f2f2f3]">
      {/* Outer borders framing the report canvas */}
      <div className="border-l border-r border-white/[0.02] px-6 sm:px-12 md:px-16">
        
        {/* Title Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/[0.03] pb-8 md:flex-row md:items-end">
          <div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#7f8084] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
              SYNTHESIS BRIEFING // EXECUTIVE INSIGHTS
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-none">
              Research Report. <span className="font-editor font-light text-[#7f8084]">Product validation.</span>
            </h1>
          </div>

          <div className="flex gap-2 text-xs font-mono font-bold">
            <button className="premium-card inline-flex items-center gap-2 rounded px-4 py-2 border border-white/5 text-[#7f8084] hover:text-white transition">
              <Share2 className="h-3.5 w-3.5" /> SHARE BRIEFING
            </button>

            <button
              onClick={startDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded bg-white px-4 py-2 text-black hover:bg-zinc-200 disabled:opacity-50 transition"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> COMPILING...
                </>
              ) : downloadComplete ? (
                <>
                  <Check className="h-3.5 w-3.5" /> PDF COMPILED
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" /> DOWNLOAD EXECUTIVE PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Grid: TOC + Content */}
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Left Side: Directory TOC */}
          <aside className="hidden lg:block text-left">
            <div className="sticky top-28 space-y-4">
              <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-4 shadow-2xl backdrop-blur-xl">
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#7f8084] block mb-3 font-mono">REPORT DIRECTORY</span>
                <div className="space-y-1">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSection(s.id);
                        document
                          .getElementById(s.id)
                          ?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className={`block w-full text-left text-[10px] font-bold font-mono tracking-wide py-1.5 px-2.5 rounded transition ${
                        activeSection === s.id
                          ? "bg-white/5 text-white"
                          : "text-[#7f8084] hover:text-white"
                      }`}
                    >
                      {s.title.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Side: Report Contents */}
          <div className="space-y-6 text-left">
            {/* Executive Overview HUD */}
            <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-6 shadow-2xl backdrop-blur-xl">
              <div className="grid gap-6 sm:grid-cols-3 items-center">
                <ScoreRing label="Overall Validation" value={84} />

                <div className="sm:col-span-2 border-l border-white/[0.03] pl-6">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-white">
                    VERDICT // METRICS
                  </span>
                  <p className="mt-2 text-sm font-bold text-white uppercase tracking-tight">
                    Strong product-market alignment — proceed to beta.
                  </p>
                  <p className="mt-2 text-xs text-[#7f8084] leading-relaxed">
                    The core product concept resonates strongly with target user roles. Address friction around team onboarding flows and publish transparent subscription tiers to boost conversions by an estimated 18–24%.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Briefs */}
            <div className="space-y-5">
              {sections.map((s, idx) => (
                <motion.div
                  key={s.id}
                  id={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35 }}
                  onViewportEnter={() => setActiveSection(s.id)}
                >
                  <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-white/[0.03] pb-2 mb-3">
                      <span className="font-mono text-[9px] text-[#7f8084] font-bold">
                        0{idx + 1} // SECTION
                      </span>
                      <h2 className="text-[10px] font-bold font-mono uppercase tracking-widest text-white">
                        {s.title}
                      </h2>
                    </div>
                    <p className="text-xs leading-relaxed text-[#7f8084]">{s.body}</p>
                  </div>
                </motion.div>
              ))}

              {/* Recommendations Panel */}
              <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 border-b border-white/[0.03] pb-2 mb-3">
                  <Compass className="h-4 w-4 text-[#7f8084]" />
                  <h2 className="text-[10px] font-bold font-mono uppercase tracking-widest text-white">
                    Actionable Steps
                  </h2>
                </div>

                <ul className="mt-3.5 space-y-2.5 text-xs text-[#7f8084] font-mono">
                  {[
                    "Onboarding audit: Reduce workspace configuration inputs from 6 fields to 3.",
                    "Pricing transparency: Define distinct Free, Team, and Enterprise pricing slabs.",
                    "Deliver mobile companion: Finalize responsive styling within next sprint cycle.",
                    "Enterprise validation: Create SOC 2 audit readiness landing page.",
                  ].map((r, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 bg-white/[0.005] border border-white/5 rounded p-3"
                    >
                      <span className="text-[#7f8084] font-bold">REC-0{idx + 1}</span>
                      <span className="flex-1 leading-relaxed text-[#7f8084]">{r.toUpperCase()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ScoreRing({ label, value }: { label: string; value: number }) {
  const r = 40,
    c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="6"
            fill="none"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            stroke="url(#silverGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * value) / 100 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
          <defs>
            <linearGradient id="silverGradient" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#52525b" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 grid place-items-center">
          <span className="text-lg font-bold font-mono text-white">{value}</span>
        </div>
      </div>

      <div className="text-left">
        <div className="text-[8px] font-mono uppercase font-bold tracking-widest text-[#7f8084]">{label}</div>
        <div className="text-[10px] font-mono font-bold text-white mt-0.5">HIGH-FIT</div>
      </div>
    </div>
  );
}
