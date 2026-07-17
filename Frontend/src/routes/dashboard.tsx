import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, ThumbsUp, ThumbsDown, Gauge, Activity, ArrowRight, Lightbulb, Compass } from "lucide-react";
import { Bar, Doughnut, Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement,
  RadialLinearScale, Tooltip, Legend, Filler,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, RadialLinearScale, Tooltip, Legend, Filler);

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Insights Dashboard — SynthScope" }] }),
});

const chartText = "#7f8084";
const grid = "rgba(255,255,255,0.02)";
const commonOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { 
      labels: { 
        color: chartText, 
        font: { size: 9, family: "Inter", weight: "bold" } 
      } 
    } 
  },
  scales: {
    x: { ticks: { color: chartText, font: { size: 8 } }, grid: { color: grid } },
    y: { ticks: { color: chartText, font: { size: 8 } }, grid: { color: grid } },
  },
};

function Dashboard() {
  const stats = [
    { icon: Users, label: "Panel Agents", value: "128", change: "+12% growth", isPositive: true },
    { icon: ThumbsUp, label: "Consensus Score", value: "68%", change: "+4.2% lift", isPositive: true },
    { icon: ThumbsDown, label: "Panel Friction", value: "14%", change: "-1.8% drop", isPositive: true },
    { icon: Gauge, label: "Usability Score", value: "8.4 / 10", change: "+0.6 increase", isPositive: true },
    { icon: Activity, label: "Interaction Index", value: "92 / 100", change: "+7 score", isPositive: true },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 text-[#f2f2f3]">
      {/* Outer borders framing the dashboard canvas */}
      <div className="border-l border-r border-white/[0.02] px-6 sm:px-12 md:px-16">
        
        {/* Title Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/[0.03] pb-8 md:flex-row md:items-end">
          <div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#7f8084] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
              PANEL ANALYTICS // REPORT
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-none">
              Insights Dashboard. <span className="font-editor font-light text-[#7f8084]">Derived metrics.</span>
            </h1>
          </div>
          <Link 
            to="/report" 
            className="rounded bg-white px-4 py-2.5 text-[10px] font-bold font-mono tracking-wider text-black transition hover:bg-zinc-200"
          >
            VIEW FULL BRIEFING
          </Link>
        </div>

        {/* Stats Cards Ticker */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.03 }}
              className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-4 shadow-2xl backdrop-blur-xl text-left"
            >
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#7f8084] font-mono">{s.label}</span>
                <s.icon className="h-3.5 w-3.5 text-[#7f8084]" />
              </div>
              <div className="mt-3 text-lg font-bold font-mono text-white">{s.value}</div>
              <div className={`mt-1.5 text-[8px] font-mono font-bold ${s.isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {s.change.toUpperCase()}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3 text-left">
          <div className="lg:col-span-2 premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#7f8084] border-b border-white/[0.03] pb-2 mb-4 font-mono">Consensus Trajectory // LINE-INFERENCE</h3>
            <div className="h-60">
              <Line
                data={{
                  labels: ["W1","W2","W3","W4","W5","W6","W7","W8"],
                  datasets: [
                    { 
                      label: "Positive Alignment", 
                      data: [42, 48, 55, 60, 63, 66, 68, 70], 
                      borderColor: "rgba(255,255,255,0.7)", 
                      backgroundColor: "rgba(255,255,255,0.01)", 
                      fill: true, 
                      tension: 0.4 
                    },
                    { 
                      label: "Friction Index", 
                      data: [22, 20, 18, 16, 15, 15, 14, 12], 
                      borderColor: "rgba(255,255,255,0.15)", 
                      backgroundColor: "rgba(255,255,255,0.005)", 
                      fill: true, 
                      tension: 0.4 
                    },
                  ],
                }}
                options={commonOpts}
              />
            </div>
          </div>
          
          <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#7f8084] border-b border-white/[0.03] pb-2 mb-4 font-mono">Panel Distribution // SEGMENT-DNAS</h3>
            <div className="h-60">
              <Doughnut
                data={{
                  labels: ["PMs","Designers","Engineers","Growth","Execs"],
                  datasets: [{
                    data: [24, 18, 32, 14, 12],
                    backgroundColor: [
                      "rgba(255,255,255,0.8)",
                      "rgba(255,255,255,0.5)",
                      "rgba(255,255,255,0.3)",
                      "rgba(255,255,255,0.15)",
                      "rgba(255,255,255,0.05)"
                    ],
                    borderColor: "rgba(255,255,255,0.04)", 
                    borderWidth: 1.5,
                  }],
                }}
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: "bottom",
                      labels: { color: chartText, font: { size: 9, family: "Inter", weight: "bold" } } 
                    } 
                  } 
                }}
              />
            </div>
          </div>

          <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#7f8084] border-b border-white/[0.03] pb-2 mb-4 font-mono">Core Themes // BAR-ALIGNMENT</h3>
            <div className="h-60">
              <Bar
                data={{
                  labels: ["Onboard","Price","AI Qual","Speed","UI","Docs"],
                  datasets: [{
                    label: "Mentions", 
                    data: [42, 28, 55, 33, 38, 21],
                    backgroundColor: "rgba(255,255,255,0.2)", 
                    borderRadius: 2,
                  }],
                }}
                options={commonOpts}
              />
            </div>
          </div>

          <div className="lg:col-span-2 premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#7f8084] border-b border-white/[0.03] pb-2 mb-4 font-mono">Experience Radar // SPATIAL-FIT</h3>
            <div className="h-60">
              <Radar
                data={{
                  labels: ["Usefulness","Ease of use","Value","Trust","Delight","Support"],
                  datasets: [
                    { 
                      label: "Nimbus Notes", 
                      data: [8.4, 7.6, 6.9, 8.1, 8.8, 7.2], 
                      backgroundColor: "rgba(255,255,255,0.03)", 
                      borderColor: "rgba(255,255,255,0.6)", 
                      pointBackgroundColor: "rgba(255,255,255,0.8)",
                      pointBorderColor: "#fff"
                    },
                    { 
                      label: "Benchmark", 
                      data: [7.1, 7.4, 6.5, 7.0, 6.4, 7.5], 
                      backgroundColor: "rgba(255,255,255,0.01)", 
                      borderColor: "rgba(255,255,255,0.15)", 
                      pointBackgroundColor: "rgba(255,255,255,0.2)" 
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: chartText, font: { size: 9, family: "Inter", weight: "bold" } } } },
                  scales: { 
                    r: { 
                      angleLines: { color: grid }, 
                      grid: { color: grid }, 
                      pointLabels: { color: chartText, font: { size: 8 } }, 
                      ticks: { color: chartText, font: { size: 7 }, backdropColor: "transparent" } 
                    } 
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Sentiment & Actionable Insight splits */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2 text-left">
          <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#7f8084] border-b border-white/[0.03] pb-2 mb-4 font-mono">Consensus breakdowns // VECTORS</h3>
            <div className="mt-4 space-y-4">
              {[
                { label: "Positive Alignment", val: 68, color: "bg-white" },
                { label: "Neutral Position", val: 18, color: "bg-[#7f8084]" },
                { label: "Friction & Risk", val: 14, color: "bg-rose-500/80" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex justify-between text-[10px] font-mono">
                    <span className="text-[#7f8084]">{s.label.toUpperCase()}</span>
                    <span className="text-white font-bold">{s.val}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${s.val}%` }} 
                      transition={{ duration: 0.8 }} 
                      className={`h-full rounded-full ${s.color}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white border-b border-white/[0.03] pb-2 mb-4 font-mono">
              <Lightbulb className="h-3.5 w-3.5 text-[#7f8084]" /> Inference Audit Feed
            </h3>
            <ul className="mt-4 space-y-2.5 text-[10px] font-mono">
              {[
                { text: "Simplify onboarding step 2 — PMs showing 22% drop-off.", status: "CRITICAL" },
                { text: "Publish transparent SMB price tiers to mitigate buyer hesitation.", status: "REQUIRED" },
                { text: "Prioritize native integrations — Jira / Linear requested by 4 panel members.", status: "INFO" },
                { text: "Improve mobile editing — high friction noted by grad/freelance segments.", status: "INFO" }
              ].map((t, idx) => (
                <li key={idx} className="flex gap-2.5 items-start bg-white/[0.005] border border-white/5 rounded p-3">
                  <span className="text-[#7f8084] font-bold">AUDIT-0{idx + 1}</span>
                  <span className="flex-1 text-[#7f8084] leading-relaxed">{t.text.toUpperCase()}</span>
                  <span className={`text-[7px] font-bold border px-1.5 py-0.5 rounded ${
                    t.status === "CRITICAL" ? "border-rose-900/50 text-rose-400 bg-rose-950/20" :
                    t.status === "REQUIRED" ? "border-amber-900/50 text-amber-400 bg-amber-950/20" :
                    "border-white/5 text-[#7f8084]"
                  }`}>{t.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
