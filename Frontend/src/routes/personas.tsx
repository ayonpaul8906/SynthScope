import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MapPin, Sparkles, MessageSquare, ClipboardList, ArrowRight, X, Compass, Layers, ShieldCheck, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { personas, type Persona } from "@/data/personas";
import { PremiumAvatar } from "@/lib/avatar";

export const Route = createFileRoute("/personas")({
  component: PersonasPage,
  head: () => ({ meta: [{ title: "Synthetic Panel — SynthScope" }] }),
});

function PersonasPage() {
  const [q, setQ] = useState("");
  const [sentiment, setSentiment] = useState<"all" | Persona["sentiment"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      personas.filter((p) => {
        const matchQ =
          !q ||
          [p.name, p.occupation, p.location, ...p.interests]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase());
        const matchS = sentiment === "all" || p.sentiment === sentiment;
        return matchQ && matchS;
      }),
    [q, sentiment],
  );

  const selectedPersona = personas.find((p) => p.id === selectedId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 relative text-[#f2f2f3]">
      <div className="border-l border-r border-white/[0.02] px-6 sm:px-12 md:px-16">
        
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-white/[0.03] pb-6 md:flex-row md:items-end">
          <div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#7f8084] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
              PANEL COHORTS // DATA-V2
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-none">
              Virtual Panel. <span className="font-editor font-light text-[#7f8084]">Active cohorts.</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
            <div className="premium-card flex items-center gap-2 rounded px-3 py-1.5 border border-white/5">
              <Search className="h-3.5 w-3.5 text-[#7f8084]" />
              <input
                placeholder="SEARCH COHORTS..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-36 bg-transparent text-[10px] outline-none placeholder:text-[#7f8084] text-white font-mono uppercase"
              />
            </div>
            <div className="premium-card flex items-center gap-2 rounded px-3 py-1.5 border border-white/5">
              <Filter className="h-3.5 w-3.5 text-[#7f8084]" />
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as typeof sentiment)}
                className="bg-transparent text-[10px] outline-none text-[#7f8084] font-bold font-mono uppercase"
              >
                <option value="all" className="bg-black">All Sentiments</option>
                <option value="positive" className="bg-black">Positive Alignment</option>
                <option value="neutral" className="bg-black">Neutral Stance</option>
                <option value="negative" className="bg-black">Critical Friction</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              onClick={() => setSelectedId(p.id)}
              className="premium-card group relative overflow-hidden rounded border border-white/5 p-4.5 cursor-pointer hover:border-white/20 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0">
                  <PremiumAvatar name={p.name} className="h-9 w-9" />
                </div>
                <div className="min-w-0 text-left">
                  <h3 className="font-bold text-white text-xs truncate group-hover:text-[#7f8084] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[9px] text-[#7f8084] truncate mt-0.5 font-mono">
                    {p.age} YRS // {p.occupation.toUpperCase()}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[8px] text-[#7f8084] font-mono">
                    <MapPin className="h-2.5 w-2.5" />
                    {p.location.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Status and Action indicators */}
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.03] pt-3">
                <span
                  className={`text-[8px] uppercase tracking-widest font-bold font-mono px-2 py-0.5 rounded border ${
                    p.sentiment === "positive"
                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                      : p.sentiment === "negative"
                        ? "border-rose-500/20 bg-rose-500/5 text-rose-400"
                        : "border-amber-500/20 bg-amber-500/5 text-amber-400"
                  }`}
                >
                  {p.sentiment}
                </span>
                <span className="text-[9px] text-white font-mono font-bold transition-transform group-hover:translate-x-0.5 flex items-center gap-1">
                  VIEW DOSSIER <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Action Drawer Bar */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 border-t border-white/[0.03] pt-8">
          <Link
            to="/survey"
            className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.005] px-4 py-2.5 text-[10px] font-bold font-mono text-[#7f8084] hover:text-white transition"
          >
            <ClipboardList className="h-4 w-4" /> RUN SURVEYS
          </Link>
          <Link
            to="/interview"
            className="flex items-center gap-2 rounded bg-white px-5 py-2.5 text-[10px] font-bold font-mono text-black hover:bg-zinc-200 transition"
          >
            <MessageSquare className="h-4 w-4" /> INTERVIEW CONSOLE <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>

      {/* Slide-out Dossier Drawer */}
      <AnimatePresence>
        {selectedId && selectedPersona && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-white/[0.04] bg-[#030304] p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between text-left"
            >
              <div>
                {/* Header controls */}
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-4 mb-5">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold font-mono uppercase tracking-widest text-[#7f8084]">
                    <Layers className="h-3.5 w-3.5" /> Researcher Dossier
                  </span>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-white/5 bg-white/5 text-[#8f95a5] hover:text-white transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Profile dossier info */}
                <div className="space-y-6 overflow-y-auto max-h-[72vh] pr-1 no-scrollbar">
                  {/* Persona Identity card */}
                  <div className="flex items-center gap-4 bg-white/[0.005] border border-white/5 p-4 rounded">
                    <div className="h-12 w-12 shrink-0">
                      <PremiumAvatar name={selectedPersona.name} className="h-12 w-12" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white leading-none">{selectedPersona.name}</h2>
                      <p className="text-[10px] text-[#7f8084] mt-1 font-mono uppercase">
                        {selectedPersona.age} YRS // {selectedPersona.occupation.toUpperCase()}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[9px] text-[#7f8084] font-mono">
                        <MapPin className="h-3 w-3" />
                        {selectedPersona.location.toUpperCase()}
                      </div>
                    </div>
                    <span className="ml-auto text-[8px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded">
                      VERIFIED
                    </span>
                  </div>

                  {/* Psychographic metrics */}
                  <div className="space-y-3.5">
                    <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7f8084] flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5" /> Psychographic Vectors
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MetricBar
                        label="AI Trust Factor"
                        value={78 + (selectedPersona.name.length % 3) * 8}
                      />
                      <MetricBar
                        label="Tech Sophistication"
                        value={
                          selectedPersona.tech.includes("Expert")
                            ? 95
                            : selectedPersona.tech.includes("Advanced")
                              ? 82
                              : 64
                        }
                      />
                      <MetricBar
                        label="Adopter Speed"
                        value={selectedPersona.personality.includes("Curious") ? 92 : 68}
                      />
                      <MetricBar
                        label="Price Sensitivity"
                        value={
                          selectedPersona.frustrations.some(
                            (f) =>
                              f.toLowerCase().includes("pricing") ||
                              f.toLowerCase().includes("expensive"),
                          )
                            ? 88
                            : 45
                        }
                      />
                    </div>
                  </div>

                  {/* Goals & Frustrations split grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7f8084] flex items-center gap-1">
                        <Heart className="h-3 w-3 text-emerald-400" /> Core Desires
                      </h4>
                      <ul className="space-y-1.5 text-[10px] text-[#8f95a5] list-disc list-inside bg-white/[0.005] border border-white/5 p-3 rounded leading-normal">
                        {selectedPersona.goals.map((g) => (
                          <li key={g} className="leading-relaxed">
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7f8084] flex items-center gap-1">
                        <X className="h-3 w-3 text-rose-400" /> Core Obstacles
                      </h4>
                      <ul className="space-y-1.5 text-[10px] text-[#8f95a5] list-disc list-inside bg-white/[0.005] border border-white/5 p-3 rounded leading-normal">
                        {selectedPersona.frustrations.map((g) => (
                          <li key={g} className="leading-relaxed">
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tech stack & interests */}
                  <div className="space-y-3.5">
                    <div>
                      <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7f8084] mb-2">
                        Technology footprint
                      </h4>
                      <div className="bg-white/[0.005] border border-white/5 p-3 rounded text-[10px] text-[#f2f2f3] font-mono">
                        {selectedPersona.tech.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7f8084] mb-2">
                        Interests & Affiliations
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPersona.interests.map((i) => (
                          <span
                            key={i}
                            className="rounded border border-white/5 bg-white/[0.01] px-2 py-0.5 text-[9px] text-[#7f8084] font-mono"
                          >
                            {i.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action drawer footer */}
              <div className="border-t border-white/[0.03] pt-4 flex gap-3">
                <Link
                  to="/interview"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-white py-3 text-[10px] font-bold font-mono tracking-wider text-black hover:bg-zinc-200 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> DIALOGUE SESSION
                </Link>
                <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold text-[#7f8084] bg-white/5 border border-white/5 px-3 rounded">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#7f8084]" /> GDPR SECURE
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/[0.005] border border-white/5 p-3 rounded">
      <div className="flex justify-between text-[8px] text-[#7f8084] uppercase font-bold font-mono">
        <span>{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-2">
        <div
          className="h-full bg-white"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
