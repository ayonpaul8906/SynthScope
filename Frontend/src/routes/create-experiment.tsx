import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Loader2, Sparkles, Settings, Users, Eye, Terminal, ShieldCheck } from "lucide-react";
import { industries, goals, personas } from "@/data/personas";
import { PremiumAvatar } from "@/lib/avatar";

export const Route = createFileRoute("/create-experiment")({
  component: CreateExperiment,
  head: () => ({
    meta: [
      { title: "Configuration Wizard — SynthScope" },
      { name: "description", content: "Configure your synthetic user research experiment." },
    ],
  }),
});

const logLines = [
  "Initializing SynthCore engine...",
  "Loading demographic weights for target audience...",
  "Structuring behavioral psychographics...",
  "Mapping neural networks to simulated technology stack...",
  "Synthesizing memory vectors and frustrations...",
  "Finalizing virtual panel consensus... Done!",
];

function CreateExperiment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeLogIndex, setActiveLogIndex] = useState(-1);
  const [form, setForm] = useState({
    productName: "Nimbus Notes",
    description: "A collaborative AI note-taking app for research teams.",
    audience: "Product designers, PMs, and researchers at fast-moving startups.",
    industry: "SaaS",
    goal: "Product validation",
    count: 6,
  });

  const previewPersonas = personas.slice(0, form.count);

  const startSynthesis = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    for (let i = 0; i < logLines.length; i++) {
      setActiveLogIndex(i);
      await new Promise((r) => setTimeout(r, 600));
    }
    navigate({ to: "/personas" });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 text-[#f2f2f3]">
      {/* Outer borders framing the wizard canvas */}
      <div className="border-l border-r border-white/[0.02] px-6 sm:px-12 md:px-16">
        
        {/* Editorial Header */}
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-white/[0.03] pb-8 md:flex-row md:items-end">
          <div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#7f8084] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
              SYNTHESIS WORKSPACE // CONFIG
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-none">
              Configure Panel. <span className="font-editor font-light text-[#7f8084]">Deploy simulation.</span>
            </h1>
          </div>
          <p className="text-[9px] font-mono text-[#7f8084] tracking-wider">
            SECURE ACCESS // NODE-QA-8
          </p>
        </div>

        {/* Two-Column Editor Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <form
              onSubmit={startSynthesis}
              className="premium-card rounded-lg border border-white/[0.04] p-6 bg-black/60 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-4 mb-6">
                <h2 className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#f2f2f3] font-mono">
                  <Settings className="h-3.5 w-3.5 text-[#7f8084]" /> Workspace Parameters
                </h2>
                <span className="text-[8px] font-mono text-[#7f8084]">V2.4-CFG</span>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Product Name">
                    <input
                      required
                      value={form.productName}
                      onChange={(e) => setForm({ ...form, productName: e.target.value })}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Industry">
                    <select
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className={inputCls}
                    >
                      {industries.map((i) => (
                        <option key={i} className="bg-black">
                          {i}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Product Description / Context">
                  <textarea
                    required
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={inputCls}
                    placeholder="Explain what your product does..."
                  />
                </Field>

                <Field label="Target Audience Demographics">
                  <textarea
                    required
                    rows={2}
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className={inputCls}
                    placeholder="E.g., PMs, developers, age 20-35..."
                  />
                </Field>

                <div className="border-t border-white/[0.03] pt-5 space-y-5">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7f8084] block mb-2.5">
                      Research Objective
                    </span>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {goals.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, goal: g })}
                          className={`rounded border text-[10px] font-bold font-mono tracking-wide py-2 px-3 text-left transition truncate ${
                            form.goal === g
                              ? "border-white/20 bg-white/5 text-white"
                              : "border-white/5 bg-white/[0.005] text-[#7f8084] hover:border-white/10 hover:text-white"
                          }`}
                        >
                          {g.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest mb-2">
                      <span className="text-[#7f8084]">Panel Capacity</span>
                      <span className="text-white">{form.count} Personas</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/[0.005] border border-white/5 rounded px-4 py-2.5">
                      <input
                        type="range"
                        min={3}
                        max={8}
                        value={form.count}
                        onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}
                        className="flex-1 accent-[#7f8084]"
                      />
                      <span className="text-xs font-mono font-bold text-white w-5 text-right">
                        {form.count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse justify-between gap-4 border-t border-white/[0.03] pt-5 sm:flex-row sm:items-center">
                <p className="text-[8px] font-mono uppercase tracking-wider text-[#7f8084]">
                  Deploy Latency: ~{Math.round(form.count * 0.7)}s // LATENCY-MIN
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded bg-white px-5 py-2.5 text-[10px] font-bold font-mono tracking-wider text-black transition hover:bg-zinc-200 disabled:opacity-50 w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> RUNNING SYNTHESIS...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> DEPLOY PANEL
                    </>
                  )}
                </button>
              </div>
            </form>

            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded border border-white/[0.04] bg-black/80 p-4 font-mono text-[9px] text-[#7f8084] shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 border-b border-white/[0.03] pb-2.5 mb-3 text-[9px] uppercase font-bold text-white">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Synthesis Process Log
                  </div>
                  <div className="space-y-1.5 leading-relaxed">
                    {logLines.slice(0, activeLogIndex + 1).map((line, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-[#7f8084]">&gt;</span>
                        <span className={idx === activeLogIndex ? "text-white font-bold" : ""}>
                          {line.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DNA Blueprint deck preview */}
          <div className="space-y-6">
            <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 mb-4">
                  <h3 className="flex items-center gap-2 text-[9px] font-bold font-mono uppercase tracking-widest text-[#f2f2f3]">
                    <Eye className="h-3.5 w-3.5 text-[#7f8084]" /> Panel DNA Blueprint
                  </h3>
                  <span className="text-[8px] font-mono text-[#7f8084]">
                    {form.industry.toUpperCase()} // {form.goal.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <AnimatePresence>
                    {previewPersonas.map((p, idx) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay: idx * 0.04 }}
                        className="flex items-center gap-3.5 rounded border border-white/5 bg-white/[0.005] p-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="h-8 w-8 shrink-0">
                          <PremiumAvatar name={p.name} className="h-8 w-8" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                          <p className="text-[9px] text-[#7f8084] truncate mt-0.5">
                            {p.occupation} · {p.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-mono font-bold text-[#7f8084] border border-white/5 px-2 py-0.5 rounded bg-white/[0.01]">
                            QUEUE-0{idx + 1}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-8 border-t border-white/[0.03] pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#7f8084]" />
                  <span className="text-[10px] font-mono text-[#7f8084]">
                    Deployed: <b className="text-white">{form.count} Nodes</b>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded">
                  <ShieldCheck className="h-3 w-3" /> GDPR-OK
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const inputCls =
  "mt-2 w-full rounded border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none transition placeholder:text-[#8f95a5] focus:border-white/20 focus:bg-white/[0.02] font-mono";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7f8084]">{label}</span>
      {children}
    </label>
  );
}
