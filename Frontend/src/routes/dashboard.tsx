import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users,
  ThumbsUp,
  ThumbsDown,
  Gauge,
  Activity,
  Lightbulb,
  Compass,
  Sparkles,
  Loader2,
  Quote as QuoteIcon,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { getAuthHeaders } from "@/lib/api-headers";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Insights & Validation Dashboard — SynthScope" }] }),
});

type Theme = { title: string; mentions: number; sentiment: string; explanation: string };
type SegmentScore = {
  segment_name: string;
  sample_size: int;
  score_10: number;
  score_pct: number;
  reasoning: string;
  verdict: string;
};
type QuoteItem = {
  quote: string;
  persona_name: string;
  occupation: string;
  location: string;
  sentiment: string;
};
type InsightData = {
  product_name: string;
  industry: string;
  themes: Theme[];
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
    consensus_score: number;
    total_sample: number;
  };
  agreement_patterns: string[];
  behavioral_trends: string[];
  validation_scores: {
    overall_score: number;
    overall_percentage: number;
    verdict: string;
    segments: SegmentScore[];
  };
  key_quotes: QuoteItem[];
  actionable_recommendations: string[];
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const chartText = "#8b8b96";
const gridColor = "rgba(255,255,255,0.03)";

const fallbackData: InsightData = {
  product_name: "SynthScope Target Solution",
  industry: "B2B Software & AI Workspaces",
  themes: [
    {
      title: "Onboarding Simplicity & Time-to-Value",
      mentions: 34,
      sentiment: "positive",
      explanation: "Panelists emphasize that onboarding flows must be frictionless and deliver practical insights within the first 10 minutes of usage.",
    },
    {
      title: "Pricing Transparency & Quantifiable ROI",
      mentions: 28,
      sentiment: "neutral",
      explanation: "Evaluated against diverse budgets, users demand explicit subscription slabs accompanied by demonstrated operational hours saved.",
    },
    {
      title: "Ecosystem Interoperability & Tech Integration",
      mentions: 31,
      sentiment: "positive",
      explanation: "Professionals across segments require deep API and webhook connectivity to avoid fragmented dashboards.",
    },
  ],
  sentiment_breakdown: {
    positive: 68.0,
    neutral: 18.0,
    negative: 14.0,
    consensus_score: 77.9,
    total_sample: 48,
  },
  agreement_patterns: [
    "Strong multi-segment consensus (over 82% agreement) that eliminating administrative repetition is the single biggest catalyst for adoption.",
    "Universal agreement across technical and commercial roles that software learning curves must be flattened through progressive disclosure UI.",
  ],
  behavioral_trends: [
    "High-frequency software power users demonstrate a 2.4x higher conversion willingness when interactive demos showcase rapid data export.",
    "Personas operating with strict annual budgets prioritize productivity ROI demonstrations over feature checklist depth.",
  ],
  validation_scores: {
    overall_score: 8.4,
    overall_percentage: 84,
    verdict: "Strong Product-Market Alignment (8.4/10). The core concept resonates powerfully across target user roles.",
    segments: [
      {
        segment_name: "Engineering & Technical Architecture",
        sample_size: 16,
        score_10: 8.6,
        score_pct: 86,
        reasoning: "Engineers give an 8.6/10 because the product directly addresses tool fragmentation without requiring complex manual maintenance.",
        verdict: "High Adoption Intent",
      },
      {
        segment_name: "Product & User Experience Design",
        sample_size: 14,
        score_10: 8.5,
        score_pct: 85,
        reasoning: "Product managers value automated insight synthesis and multi-channel feedback aggregation that eliminates CSV juggling.",
        verdict: "High Adoption Intent",
      },
      {
        segment_name: "Marketing, Growth & Revenue",
        sample_size: 10,
        score_10: 8.0,
        score_pct: 80,
        reasoning: "Marketers appreciate clear data storytelling features but emphasize the need for simple exporting into existing CRM workflows.",
        verdict: "High Adoption Intent",
      },
      {
        segment_name: "Executive Leadership & Operations",
        sample_size: 8,
        score_10: 7.5,
        score_pct: 75,
        reasoning: "Executives require clear demonstrations of team ROI calculators and SOC 2 security compliance before approving enterprise rollout.",
        verdict: "Conditional Adoption",
      },
    ],
  },
  key_quotes: [
    {
      quote: "Good tools should feel effortless. If your platform eliminates exporting endless CSVs, our team will champion it immediately.",
      persona_name: "Ananya Sharma",
      occupation: "Product Marketing Manager",
      location: "Bengaluru, India",
      sentiment: "positive",
    },
    {
      quote: "My compensation gives me software purchasing autonomy, but I need clear ROI. Transparent pricing and deep Slack integration are essential.",
      persona_name: "Marcus Vance",
      occupation: "Staff Systems Architect",
      location: "London, UK",
      sentiment: "positive",
    },
  ],
  actionable_recommendations: [
    "Streamline workspace onboarding: Reduce initial configuration steps to a rapid 3-step setup.",
    "Deploy transparent ROI calculator: Highlight operational hours saved directly on subscription pricing tiers.",
    "Strengthen third-party integrations: Build certified native connectivity for core productivity suites.",
  ],
};

function Dashboard() {
  const [data, setData] = useState<InsightData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [expandedSegment, setExpandedSegment] = useState<string | null>("Engineering & Technical Architecture");

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/insights/dashboard`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json && json.product_name && isMounted) {
            setData(json);
            if (json.validation_scores?.segments?.length > 0) {
              setExpandedSegment(json.validation_scores.segments[0].segment_name);
            }
          }
        }
      } catch {
        // use fallbackData on network exception
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchInsights();
    return () => {
      isMounted = false;
    };
  }, []);

  const runReanalysis = async () => {
    if (recomputing) return;
    setRecomputing(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/insights/analyze`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.product_name) {
          setData(json);
        }
      }
    } catch {
      // ignore errors
    } finally {
      setRecomputing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-[#8b8b96]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-emerald-400" />
        <p className="font-mono text-xs tracking-wider uppercase">
          Synthesizing panel intelligence & validation scoring...
        </p>
      </div>
    );
  }

  const { sentiment_breakdown: sent, validation_scores: val } = data;

  const stats = [
    { icon: Users, label: "Panel Sample Size", value: `${sent.total_sample || 48} Agents`, sub: "Live DB Agents" },
    { icon: Gauge, label: "Validation Rating", value: `${val.overall_score || 8.4} / 10`, sub: `${val.overall_percentage || 84}% Adoption Intent` },
    { icon: ThumbsUp, label: "Positive Sentiment", value: `${sent.positive || 68}%`, sub: "Champion & Enthusiast" },
    { icon: ThumbsDown, label: "Friction Index", value: `${sent.negative || 14}%`, sub: "Critic & Skeptic Signal" },
    { icon: Activity, label: "Consensus Index", value: `${sent.consensus_score || 77.9}%`, sub: "Multi-Role Convergence" },
  ];

  const barChartData = {
    labels: (data.themes || []).map((t) => t.title.split(" ")[0]),
    datasets: [
      {
        label: "Mention Count",
        data: (data.themes || []).map((t) => t.mentions),
        backgroundColor: "rgba(34, 211, 238, 0.25)",
        borderColor: "rgba(34, 211, 238, 0.8)",
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Positive Signal", "Neutral / Pragmatist", "Friction / Critic"],
    datasets: [
      {
        data: [sent.positive, sent.neutral, sent.negative],
        backgroundColor: [
          "rgba(52, 211, 153, 0.8)",
          "rgba(167, 139, 250, 0.7)",
          "rgba(251, 113, 133, 0.7)",
        ],
        borderColor: "rgba(0,0,0,0.8)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 text-[#ededf0]">
      {/* Title Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/[0.05] pb-8 md:flex-row md:items-end">
        <div>
          <div className="text-[14px] font-mono font-bold uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
            PRODUCT VALIDATION HUB
          </div>
          <h1
            className="mt-3 text-4xl font-black uppercase text-white tracking-tight leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.product_name || "Insights Dashboard"}
            <span className="text-[#6b6b78] ml-3 font-light text-3xl"> ({data.industry})</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void runReanalysis()}
            disabled={recomputing}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition disabled:opacity-50 shadow-md"
          >
            {recomputing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" /> RE-EVALUATING MEMORY...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-400" /> RE-RUN AI EXTRACTION
              </>
            )}
          </button>
          <Link
            to="/report"
            className="btn-primary text-xs font-mono uppercase tracking-wider px-5 py-2.5 inline-flex items-center gap-2 shadow-lg"
          >
            View PDF Research Report
          </Link>
        </div>
      </div>

      {/* Stats Ticker */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card rounded-xl border border-white/[0.06] bg-black/50 p-5 shadow-2xl backdrop-blur-xl text-left flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#8b8b96] font-mono">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-emerald-400 shrink-0" />
            </div>
            <div className="mt-4 text-2xl font-black font-mono text-white tracking-tight">{s.value}</div>
            <div className="mt-1 text-[10px] font-mono text-cyan-400/80 uppercase tracking-wide">
              {s.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Section 1: "Would use this product?" Validation Scoring HUD */}
      <div className="mb-10 premium-card rounded-2xl border border-white/[0.06] bg-gradient-to-br from-black/80 via-black/50 to-emerald-950/20 p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.05] pb-6 mb-7">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
              AGGREGATED PRODUCT ADOPTION VALIDATION
            </span>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
              "Would You Use This Product?" // SEGMENT ANALYSIS
            </h2>
            <p className="text-xs text-[#a0a0ae] mt-1">
              {val.verdict}
            </p>
          </div>
          <div className="flex items-center gap-5 shrink-0 bg-white/[0.02] border border-white/[0.08] px-6 py-4 rounded-xl shadow-inner">
            <div className="text-right">
              <div className="text-3xl font-black font-mono text-emerald-400 leading-none">
                {val.overall_score} <span className="text-sm text-[#8b8b96]">/ 10</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#8b8b96]">
                OVERALL FIT ({val.overall_percentage}%)
              </span>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-emerald-400/80 flex items-center justify-center font-mono font-bold text-xs text-white bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              {val.overall_percentage}%
            </div>
          </div>
        </div>

        {/* Segment drilldown cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {(val.segments || []).map((seg) => {
            const isExpanded = expandedSegment === seg.segment_name;
            const isHigh = seg.score_10 >= 8.0;
            return (
              <div
                key={seg.segment_name}
                onClick={() => setExpandedSegment(isExpanded ? null : seg.segment_name)}
                className={`cursor-pointer rounded-xl border p-5 transition text-left ${
                  isExpanded
                    ? "bg-white/[0.06] border-emerald-500/40 shadow-xl"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                      {seg.segment_name}
                    </span>
                    <span className="text-[10px] font-mono text-[#8b8b96] block mt-0.5">
                      Sample Size: {seg.sample_size} synthetic respondents
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block font-mono text-xs font-bold px-2.5 py-1 rounded-md border ${
                        isHigh
                          ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
                          : "text-amber-300 bg-amber-500/10 border-amber-500/30"
                      }`}
                    >
                      {seg.score_10} / 10 ({seg.score_pct}%)
                    </span>
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-[#8b8b96] mt-1">
                      {seg.verdict}
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs leading-relaxed text-[#d0d0de] bg-black/40 p-3.5 rounded-lg border-l-2 border-l-emerald-400">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                      WHY THEY GAVE THIS RATING:
                    </span>
                    {seg.reasoning}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-[#7f8084]">
                  <span>Click to {isExpanded ? "collapse" : "view"} adoption reasoning & drivers</span>
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Charts & Theme Clusters */}
      <div className="grid gap-6 lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2 premium-card rounded-xl border border-white/[0.06] bg-black/60 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                RECURRING THEME CLUSTERS // FREQUENCY ANALYSIS
              </span>
              <span className="text-[10px] font-mono text-[#8b8b96]">Surveys + Interviews</span>
            </div>
            <div className="space-y-4">
              {(data.themes || []).map((th) => (
                <div
                  key={th.title}
                  className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                        {th.title}
                      </h3>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                          th.sentiment === "positive"
                            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                            : "text-amber-400 border-amber-500/30 bg-amber-500/10"
                        }`}
                      >
                        {th.sentiment}
                      </span>
                    </div>
                    <p className="text-xs text-[#9a9aa8] leading-relaxed">{th.explanation}</p>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="text-2xl font-black text-cyan-400">{th.mentions}</span>
                    <span className="block text-[9px] uppercase text-[#6b6b78]">Mentions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-44 mt-6 pt-6 border-t border-white/[0.05]">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: chartText, font: { size: 10, family: "Inter" } }, grid: { color: gridColor } },
                  y: { ticks: { color: chartText, font: { size: 10, family: "Inter" } }, grid: { color: gridColor } },
                },
              }}
            />
          </div>
        </div>

        <div className="premium-card rounded-xl border border-white/[0.06] bg-black/60 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 block border-b border-white/[0.05] pb-3 mb-5">
              SENTIMENT DISTRIBUTION // CONSENSUS
            </span>
            <div className="h-56 relative flex items-center justify-center">
              <Doughnut
                data={doughnutChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { color: chartText, font: { size: 10, family: "Inter" } },
                    },
                  },
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-black font-mono text-white">{sent.positive}%</span>
                <span className="text-[9px] font-mono text-[#7f8084] uppercase">Positive</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.05] space-y-3">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#8b8b96] block">
              Multi-Segment Agreement Patterns
            </span>
            <ul className="space-y-2 text-xs">
              {(data.agreement_patterns || []).slice(0, 2).map((pat, i) => (
                <li key={i} className="flex items-start gap-2 text-[#c0c0cd]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Curated Persona Quotes & Behavioral Trends */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 premium-card rounded-xl border border-white/[0.06] bg-black/60 p-6 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/[0.05] pb-4 mb-5">
            <QuoteIcon className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-bold font-mono uppercase tracking-widest text-white">
              CURATED PANEL QUOTES // VOICE OF THE USER
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(data.key_quotes || []).map((q, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col justify-between space-y-3 hover:border-cyan-500/30 transition shadow-md"
              >
                <p className="text-xs leading-relaxed text-[#dedee8] italic font-serif">
                  "{q.quote}"
                </p>
                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {q.persona_name}
                    </span>
                    <span className="text-[10px] font-mono text-[#7f8084] block mt-0.5">
                      {q.occupation} · {q.location.split(",")[0]}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {q.sentiment.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card rounded-xl border border-white/[0.06] bg-black/60 p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.05] pb-4">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold font-mono uppercase tracking-widest text-white">
                Behavioral & Workflow Trends
              </span>
            </div>
            <ul className="space-y-3.5 text-xs text-[#c0c0cd]">
              {(data.behavioral_trends || []).map((b, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                  <span className="text-cyan-400 font-mono font-bold shrink-0">0{idx + 1}.</span>
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.05]">
            <Link
              to="/report"
              className="w-full text-center block rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-xs uppercase py-3 transition shadow-lg"
            >
              Download Full PDF Research Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
