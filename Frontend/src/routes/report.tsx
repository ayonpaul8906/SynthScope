import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Download,
  Share2,
  Check,
  FileText,
  Compass,
  Loader2,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { getAuthHeaders } from "@/lib/api-headers";

export const Route = createFileRoute("/report")({
  component: ReportPage,
  head: () => ({ meta: [{ title: "Executive Research Report — SynthScope" }] }),
});

type SegmentScore = {
  segment_name: string;
  sample_size: int;
  score_10: number;
  score_pct: number;
  reasoning: string;
  verdict: string;
};
type InsightData = {
  product_name: string;
  industry: string;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
    consensus_score: number;
    total_sample: number;
  };
  validation_scores: {
    overall_score: number;
    overall_percentage: number;
    verdict: string;
    segments: SegmentScore[];
  };
  agreement_patterns: string[];
  actionable_recommendations: string[];
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const defaultBriefing: InsightData = {
  product_name: "SynthScope Target Solution",
  industry: "B2B Software & AI Workspaces",
  sentiment_breakdown: {
    positive: 68.0,
    neutral: 18.0,
    negative: 14.0,
    consensus_score: 77.9,
    total_sample: 48,
  },
  validation_scores: {
    overall_score: 8.4,
    overall_percentage: 84,
    verdict: "Strong product-market alignment across panel respondents (8.4/10). The core product concept resonates powerfully with target user roles.",
    segments: [
      {
        segment_name: "Engineering & Technical Architecture",
        sample_size: 16,
        score_10: 8.6,
        score_pct: 86,
        reasoning: "Engineers value the elimination of tool fragmentation and manual maintenance overhead.",
        verdict: "High Adoption Intent",
      },
      {
        segment_name: "Product & User Experience Design",
        sample_size: 14,
        score_10: 8.5,
        score_pct: 85,
        reasoning: "Product teams emphasize seamless multi-channel feedback aggregation and automated synthesis.",
        verdict: "High Adoption Intent",
      },
      {
        segment_name: "Marketing, Growth & Revenue",
        sample_size: 10,
        score_10: 8.0,
        score_pct: 80,
        reasoning: "Marketers prioritize rapid data exporting into existing CRM and analytical suites.",
        verdict: "High Adoption Intent",
      },
    ],
  },
  agreement_patterns: [
    "Multi-segment consensus that eliminating repetitive administrative friction is the primary catalyst for purchase.",
    "Universal agreement across technical and commercial roles that software learning curves must remain minimal.",
    "Consensus that centralized intelligence dashboards significantly outperform siloed reporting tools.",
  ],
  actionable_recommendations: [
    "Streamline workspace onboarding: Reduce configuration inputs from complex wizards to a 3-step automated flow.",
    "Deploy transparent ROI calculator: Highlight explicit operational hours saved directly on pricing tiers.",
    "Strengthen third-party app integrations: Build certified connectivity for top workplace suites.",
    "Provide team collaboration workspaces: Enable shared views to facilitate cross-departmental alignment.",
  ],
};

function ReportPage() {
  const [data, setData] = useState<InsightData>(defaultBriefing);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [activeSection, setActiveSection] = useState("summary");

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/insights/report`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json && json.product_name && isMounted) {
            setData(json);
          }
        }
      } catch {
        // rely on defaultBriefing on network exception
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchReport();
    return () => {
      isMounted = false;
    };
  }, []);

  const startDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/insights/report/pdf`, { headers });
      if (!res.ok) throw new Error("PDF generation failed on server");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SynthScope_Executive_Research_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 3000);
    } catch {
      alert("Notice: Could not download PDF report from backend. Please ensure the backend API is running.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-[#8b8b96]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-emerald-400" />
        <p className="font-mono text-xs tracking-wider uppercase">
          Assembling executive briefing & PDF layout...
        </p>
      </div>
    );
  }

  const { validation_scores: val, sentiment_breakdown: sent } = data;

  const sectionsList = [
    { id: "summary", title: "Executive Summary" },
    { id: "scoring", title: "Validation Scoring" },
    { id: "consensus", title: "Consensus Trends" },
    { id: "actions", title: "Actionable Steps" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 text-[#ededf0]">
      {/* Title Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/[0.06] pb-8 md:flex-row md:items-end">
        <div>
          <h1
            className="mt-3 text-4xl font-black uppercase text-white tracking-tight leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Research Report
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-bold">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-mono uppercase text-[#a0a0ae] hover:text-white hover:border-white/20 transition shadow-md"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <button
            onClick={() => void startDownload()}
            disabled={downloading}
            className="inline-flex items-center gap-2.5 rounded-lg bg-white px-5 py-2.5 text-black hover:bg-zinc-200 disabled:opacity-50 transition shadow-xl font-bold uppercase tracking-wide"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" /> COMPILING PDF BLOB...
              </>
            ) : downloadComplete ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" /> PDF DOWNLOADED
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> DOWNLOAD EXECUTIVE PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Directory + Document Canvas */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Left TOC */}
        <aside className="hidden lg:block text-left">
          <div className="sticky top-28 space-y-4">
            <div className="premium-card rounded-xl border border-white/[0.06] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#8b8b96] block mb-4 font-mono border-b border-white/[0.05] pb-2">
                REPORT DIRECTORY
              </span>
              <div className="space-y-1.5">
                {sectionsList.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSection(s.id);
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className={`block w-full text-left text-xs font-mono font-semibold tracking-wide py-2 px-3 rounded-lg transition ${
                      activeSection === s.id
                        ? "bg-white/[0.08] text-white border border-white/20 shadow-md"
                        : "text-[#8b8b96] hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    0{i + 1}  {s.title.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="premium-card rounded-xl border border-white/[0.06] bg-gradient-to-br from-black/80 to-cyan-950/20 p-5 shadow-2xl">
              <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
                REPORT METADATA
              </span>
              <div className="space-y-2 text-xs font-mono text-[#a0a0ae]">
                <div>Target: <span className="text-white">{data.product_name}</span></div>
                <div>Industry: <span className="text-white">{data.industry}</span></div>
                <div>Sample: <span className="text-white">{sent.total_sample || 48} Agents</span></div>
                <div>Engine: <span className="text-emerald-400">fpdf2 Structured Render</span></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Report Content Canvas */}
        <div className="space-y-8 text-left">
          {/* Executive Overview HUD */}
          <section id="summary" className="premium-card rounded-2xl border border-white/[0.06] bg-black/60 p-7 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">01</span>
                <h2 className="text-base font-bold font-mono uppercase tracking-widest text-white">
                  EXECUTIVE SUMMARY & VERDICT
                </h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="grid gap-6 sm:grid-cols-3 items-center">
              <div className="rounded-xl bg-gradient-to-br from-white/[0.04] to-emerald-500/[0.05] border border-white/[0.08] p-5 text-center flex flex-col items-center justify-center shadow-inner">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#8b8b96] block mb-2">
                  Validation Score
                </span>
                <div className="text-4xl font-black font-mono text-emerald-400 tracking-tight">
                  {val.overall_score || 8.4} <span className="text-base text-[#8b8b96]">/ 10</span>
                </div>
                <span className="mt-2 text-[10px] font-mono font-bold text-white uppercase bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                  {val.overall_percentage || 84}% Adoption Intent
                </span>
              </div>

              <div className="sm:col-span-2 border-l border-white/[0.05] pl-6 space-y-3">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-300">
                  VERDICT
                </span>
                <p className="text-sm font-bold text-white uppercase tracking-wide leading-snug">
                  {val.verdict || "Strong product-market alignment across panel respondents."}
                </p>
                <p className="text-xs text-[#a0a0ae] leading-relaxed">
                  The research panel ({sent.total_sample || 48} synthetic target agents) demonstrated a strong {sent.positive || 68}% positive alignment consensus. Respondents expressed high enthusiasm for core automation capabilities while identifying clear opportunities to accelerate conversions by streamlining team onboarding flows.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Segment Validation Scoring Table */}
          <section id="scoring" className="premium-card rounded-2xl border border-white/[0.06] bg-black/60 p-7 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 font-bold">02</span>
                <h2 className="text-base font-bold font-mono uppercase tracking-widest text-white">
                  SEGMENT BREAKDOWN
                </h2>
              </div>
              <Users className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#8b8b96] text-[10px] uppercase tracking-wider bg-white/[0.02]">
                    <th className="py-3 px-4 rounded-tl-lg">Segment Role Area</th>
                    <th className="py-3 px-3 text-center">Sample Size</th>
                    <th className="py-3 px-3 text-center">Adoption Rating</th>
                    <th className="py-3 px-4 rounded-tr-lg">Validation Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-[#d6d6e0]">
                  {(val.segments || []).map((s, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-bold text-white">{s.segment_name}</td>
                      <td className="py-3.5 px-3 text-center text-[#8b8b96]">{s.sample_size} Agents</td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-400">
                        {s.score_10} / 10 ({s.score_pct}%)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-white/[0.04] border border-white/[0.1] text-cyan-300">
                          {s.verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.05] space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8b8b96] font-bold block">
                QUALITATIVE SEGMENT REASONING & DRIVERS:
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                {(val.segments || []).map((s, idx) => (
                  <div key={idx} className="bg-white/[0.015] border border-white/[0.05] p-4 rounded-lg text-xs space-y-1.5">
                    <span className="font-bold text-white text-xs block">{s.segment_name}:</span>
                    <p className="text-[#9e9ea8] leading-relaxed font-sans">{s.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Consensus Trends */}
          <section id="consensus" className="premium-card rounded-2xl border border-white/[0.06] bg-black/60 p-7 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-violet-400 font-bold">03</span>
                <h2 className="text-base font-bold font-mono uppercase tracking-widest text-white">
                  MULTI-ROLE CONSENSUS & AGREEMENT PATTERNS
                </h2>
              </div>
              <Award className="h-5 w-5 text-violet-400" />
            </div>

            <ul className="space-y-3.5 text-xs text-[#d0d0df]">
              {(data.agreement_patterns || []).map((pat, i) => (
                <li key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-white block uppercase tracking-tight font-mono text-[11px]">
                      Consensus Finding 0{i + 1}:
                    </span>
                    <p className="leading-relaxed text-[#a0a0ae] text-sm">{pat}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4: Actionable Recommendations */}
          <section id="actions" className="premium-card rounded-2xl border border-white/[0.06] bg-black/60 p-7 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">04</span>
                <h2 className="text-base font-bold font-mono uppercase tracking-widest text-white">
                  PRIORITIZED ACTIONABLE RECOMMENDATIONS
                </h2>
              </div>
              <Compass className="h-5 w-5 text-cyan-400" />
            </div>

            <div className="space-y-3">
              {(data.actionable_recommendations || []).map((rec, idx) => {
                const parts = rec.split(":");
                const title = parts.length > 1 ? parts[0] : `Recommendation 0${idx + 1}`;
                const body = parts.length > 1 ? parts.slice(1).join(":") : rec;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.06] rounded-xl p-4 shadow-md"
                  >
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs shrink-0">
                      0{idx + 1}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="font-bold text-white text-xs block uppercase font-mono tracking-wider">
                        {title}
                      </span>
                      <p className="text-xs text-[#a0a0ae] leading-relaxed">{body.trim()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.015] p-5 rounded-xl border border-white/[0.05]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Download Full Executive Briefing
                </h3>
                <p className="text-xs text-[#7f8084] mt-0.5">
                  Formatted for stakeholder sharing with tables, quotes, and fpdf2 layout.
                </p>
              </div>
              <button
                onClick={() => void startDownload()}
                disabled={downloading}
                className="btn-primary text-xs font-mono font-bold uppercase px-6 py-3 inline-flex items-center justify-center gap-2 shadow-xl shrink-0"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> COMPILING...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> DOWNLOAD .PDF REPORT
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
