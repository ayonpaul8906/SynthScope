import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MapPin, MessageSquare, ClipboardList, ArrowRight, X, Compass, Heart, Loader2, ChevronRight, Briefcase, GraduationCap, IndianRupee } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { PremiumAvatar } from "@/lib/avatar";
import { getAuthHeaders } from "@/lib/api-headers";

export const Route = createFileRoute("/personas")({
  component: PersonasPage,
  head: () => ({ meta: [{ title: "Virtual Panel — SynthScope" }] }),
});

type BackendPersona = {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  country: string;
  occupation: string;
  education: string;
  annual_income: string;
  marital_status: string;
  persona_summary: string;
  lifestyle: string;
  technology_usage: string;
  digital_literacy: string;
  fitness_level: string;
  budget: string;
  purchase_channel: string;
  purchase_frequency: string;
  brand_loyalty: string;
  operating_system: string;
  ecosystem: string;
  accessibility_needs?: string | null;
  environmental_awareness?: string | null;
  quote: string;
  hobbies: string[];
  daily_routine: string[];
  goals: string[];
  motivations: string[];
  pain_points: string[];
  frustrations: string[];
  preferred_features: string[];
  devices: string[];
  favourite_apps: string[];
  personality: {
    traits: string[];
    communication_style: string;
    decision_making: string;
    description: string;
  };
  buying_behaviour: {
    price_sensitivity: string;
    decision_factor: string;
    purchase_trigger: string;
    description: string;
  };
  sentiment_archetype?: string;
};

type SentimentKey = "all" | "positive" | "neutral" | "negative" | "skeptic" | "mixed";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const PERSONAS_ENDPOINT = `${API_BASE_URL.replace(/\/$/, "")}/personas`;

// Maps sentiment_archetype to a normalized display sentiment
const ARCHETYPE_MAP: Record<string, { label: string; tone: "positive" | "neutral" | "negative" | "mixed" }> = {
  champion:   { label: "Champion",   tone: "positive" },
  enthusiast: { label: "Enthusiast", tone: "positive" },
  pragmatist: { label: "Pragmatist", tone: "neutral" },
  skeptic:    { label: "Skeptic",    tone: "neutral" },
  critic:     { label: "Critic",     tone: "negative" },
  mixed:      { label: "Mixed",      tone: "mixed" },
};

function getSentimentStyle(tone: string) {
  switch (tone) {
    case "positive":  return { badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" };
    case "negative":  return { badge: "text-rose-400 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-400" };
    case "mixed":     return { badge: "text-violet-400 bg-violet-500/10 border-violet-500/20", dot: "bg-violet-400" };
    default:          return { badge: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" };
  }
}

// Deterministic fallback sentiment based on persona id + index
const FALLBACK_ARCHETYPES = ["champion", "pragmatist", "critic", "enthusiast", "skeptic", "mixed"];
function getFallbackArchetype(persona: BackendPersona, idx: number): string {
  const hash = persona.id
    ? persona.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : 0;
  return FALLBACK_ARCHETYPES[(idx + (hash % 3)) % FALLBACK_ARCHETYPES.length];
}

function PersonasPage() {
  const [q, setQ] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backendPersonas, setBackendPersonas] = useState<BackendPersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRunningSurvey, setIsRunningSurvey] = useState(false);

  const handleRunSurvey = async () => {
    setIsRunningSurvey(true);
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE_URL.replace(/\/$/, "")}/survey/run-pipeline`, { method: "POST", headers });
      window.location.href = "/survey";
    } catch {
      window.location.href = "/survey";
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(PERSONAS_ENDPOINT, { headers });
        if (!res.ok) throw new Error("Failed to load personas.");
        const data = (await res.json()) as BackendPersona[];
        if (active) setBackendPersonas(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : "Failed to load personas.");
          setBackendPersonas([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  // Enrich each persona with a determined sentiment_archetype
  const enrichedPersonas = useMemo(() =>
    backendPersonas.map((p, idx) => ({
      ...p,
      _archetype: p.sentiment_archetype || getFallbackArchetype(p, idx),
    })),
    [backendPersonas]
  );

  const visiblePersonas = useMemo(() => {
    return enrichedPersonas.filter((p) => {
      const arch = ARCHETYPE_MAP[p._archetype] ?? { label: p._archetype, tone: "neutral" as const };
      const matchQ = !q || [p.name, p.occupation, p.city, p.country, p.persona_summary]
        .join(" ").toLowerCase().includes(q.toLowerCase());
      const matchS = sentimentFilter === "all" || arch.tone === sentimentFilter || p._archetype === sentimentFilter;
      return matchQ && matchS;
    });
  }, [enrichedPersonas, q, sentimentFilter]);

  const selectedPersona = enrichedPersonas.find((p) => p.id === selectedId);

  // Stats counts
  const sentimentCounts = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
    enrichedPersonas.forEach((p) => {
      const tone = ARCHETYPE_MAP[p._archetype]?.tone ?? "neutral";
      counts[tone] = (counts[tone] || 0) + 1;
    });
    return counts;
  }, [enrichedPersonas]);

  return (
    <div className="min-h-screen text-[#ededf0]">

      {/* Page Header */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-6 sm:px-10">
        <div className="border-b border-white/[0.05] pb-7 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1
              className="text-5xl font-bold uppercase text-white leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Panel
              <span className="text-[#6b6b78] ml-3 font-light text-4xl">
                {backendPersonas.length} agents
              </span>
            </h1>
          </div>

          {/* Sentiment Distribution badges */}
          {!isLoading && backendPersonas.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[9px] font-mono">
              {(["positive", "neutral", "negative", "mixed"] as const).map((tone) => {
                const style = getSentimentStyle(tone);
                return (
                  <div key={tone} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${style.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {sentimentCounts[tone]} {tone}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {!isLoading && backendPersonas.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 sm:px-10 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 premium-card border border-white/[0.05] rounded-lg px-3.5 py-2">
              <Search className="h-3.5 w-3.5 text-[#6b6b78]" />
              <input
                placeholder="Search personas..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="bg-transparent text-[10px] outline-none placeholder:text-[#6b6b78] text-white font-mono w-40"
              />
            </div>
            <div className="flex items-center gap-2 premium-card border border-white/[0.05] rounded-lg px-3.5 py-2">
              <Filter className="h-3.5 w-3.5 text-[#6b6b78]" />
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as SentimentKey)}
                className="bg-transparent text-[10px] outline-none text-[#6b6b78] font-mono"
              >
                <option value="all" className="bg-[#0c0c0f]">All Sentiments</option>
                <option value="positive" className="bg-[#0c0c0f]">Positive</option>
                <option value="neutral" className="bg-[#0c0c0f]">Neutral</option>
                <option value="negative" className="bg-[#0c0c0f]">Negative</option>
                <option value="mixed" className="bg-[#0c0c0f]">Mixed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Persona Grid */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#6b6b78]">
            <Loader2 className="h-6 w-6 animate-spin mb-3" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Loading panel...</span>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center">
            <p className="text-[10px] font-mono uppercase tracking-wider text-rose-400">{loadError}</p>
          </div>
        ) : visiblePersonas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-14 w-14 rounded-xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-center mb-5">
              <MessageSquare className="h-6 w-6 text-[#6b6b78]" />
            </div>
            <p className="text-sm font-bold text-white mb-2">No personas found</p>
            <p className="text-[11px] text-[#6b6b78] mb-6">Run the Simulator first to generate your research panel.</p>
            <Link to="/create-experiment" className="btn-primary text-[11px]">
              Open Simulator <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visiblePersonas.map((p, i) => {
              const archEntry = ARCHETYPE_MAP[p._archetype] ?? { label: p._archetype, tone: "neutral" as const };
              const style = getSentimentStyle(archEntry.tone);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => setSelectedId(p.id)}
                  className="premium-card group rounded-xl border border-white/[0.05] p-4 cursor-pointer hover:border-white/[0.12] transition-all hover:bg-white/[0.015]"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <PremiumAvatar name={p.name} className="h-9 w-9 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-white truncate">{p.name}</h3>
                      <p className="text-[9px] text-[#6b6b78] font-mono mt-0.5 truncate">
                        {p.age} · {p.occupation.split(" ").slice(0, 3).join(" ")}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-[9px] text-[#6b6b78] font-mono mb-3">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.city}, {p.country}</span>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5">
                    <span className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}>
                      {archEntry.label}
                    </span>
                    <ArrowRight className="h-3 w-3 text-[#6b6b78] group-hover:text-white transition-colors group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Action bar */}
        {!isLoading && backendPersonas.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3 border-t border-white/[0.04] pt-8 justify-center">
            <button
              disabled={isRunningSurvey}
              onClick={handleRunSurvey}
              className="btn-primary text-[11px] disabled:opacity-50"
            >
              {isRunningSurvey ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Running survey...</>
              ) : (
                <><ClipboardList className="h-4 w-4" /> Run Survey</>
              )}
            </button>
            <Link
              to="/interview"
              className="btn-ghost text-[11px]"
            >
              <MessageSquare className="h-4 w-4" /> Interview Console
            </Link>
          </div>
        )}
      </div>

      {/* ═══════════ SLIDE-OUT DOSSIER ═══════════ */}
      <AnimatePresence>
        {selectedId && selectedPersona && (() => {
          const archEntry = ARCHETYPE_MAP[selectedPersona._archetype] ?? { label: selectedPersona._archetype, tone: "neutral" as const };
          const style = getSentimentStyle(archEntry.tone);
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 250 }}
                className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-white/[0.05] bg-[#0a0a0d] flex flex-col shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-4 shrink-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#6b6b78]">
                    Researcher Dossier
                  </span>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="h-8 w-8 rounded-lg border border-white/[0.06] flex items-center justify-center text-[#6b6b78] hover:text-white hover:border-white/20 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {/* Identity card */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                    <PremiumAvatar name={selectedPersona.name} className="h-12 w-12 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-bold text-white">{selectedPersona.name}</h2>
                      <p className="text-[10px] text-[#6b6b78] font-mono mt-0.5 truncate">
                        {selectedPersona.occupation}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-[#6b6b78] font-mono">
                        <MapPin className="h-2.5 w-2.5" />
                        {selectedPersona.city}, {selectedPersona.country}
                      </div>
                    </div>
                    <span className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}>
                      {archEntry.label}
                    </span>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: GraduationCap, label: "Age", val: `${selectedPersona.age}` },
                      { icon: Briefcase, label: "Income", val: selectedPersona.annual_income },
                      { icon: IndianRupee, label: "Budget", val: selectedPersona.budget },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="rounded-lg border border-white/[0.05] bg-white/[0.01] p-3 text-center">
                        <Icon className="h-3.5 w-3.5 text-[#6b6b78] mx-auto mb-1.5" />
                        <div className="text-[8px] font-mono text-[#6b6b78] uppercase tracking-wider">{label}</div>
                        <div className="text-[10px] font-semibold text-white mt-0.5 truncate">{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.01] p-4">
                    <h4 className="text-[9px] font-mono uppercase tracking-widest text-[#6b6b78] mb-2">Summary</h4>
                    <p className="text-[11px] text-[#c0c0cc] leading-relaxed">{selectedPersona.persona_summary}</p>
                  </div>

                  {/* Quote */}
                  {selectedPersona.quote && (
                    <div className="border-l-2 border-white/10 pl-4">
                      <p className="text-[11px] text-[#8b8b96] italic leading-relaxed">"{selectedPersona.quote}"</p>
                    </div>
                  )}

                  {/* Psychographic metrics */}
                  <div>
                    <h3 className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-[#6b6b78] mb-3">
                      <Compass className="h-3.5 w-3.5" /> Psychographic Profile
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: "Tech Proficiency", val: selectedPersona.technology_usage },
                        { label: "Digital Literacy", val: selectedPersona.digital_literacy },
                        { label: "Purchase Frequency", val: selectedPersona.purchase_frequency },
                        { label: "Brand Loyalty", val: selectedPersona.brand_loyalty },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-[#6b6b78] uppercase tracking-wider text-[8px]">{label}</span>
                          <span className="font-mono text-white">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Goals & Pain Points */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] flex items-center gap-1 mb-2">
                        <Heart className="h-3 w-3 text-emerald-400" /> Goals
                      </h4>
                      <ul className="space-y-1">
                        {(selectedPersona.goals || []).slice(0, 3).map((g) => (
                          <li key={g} className="text-[10px] text-[#c0c0cc] leading-snug flex gap-1.5">
                            <span className="text-emerald-400 shrink-0 mt-0.5">›</span>
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] flex items-center gap-1 mb-2">
                        <X className="h-3 w-3 text-rose-400" /> Pain Points
                      </h4>
                      <ul className="space-y-1">
                        {(selectedPersona.pain_points || []).slice(0, 3).map((p) => (
                          <li key={p} className="text-[10px] text-[#c0c0cc] leading-snug flex gap-1.5">
                            <span className="text-rose-400 shrink-0 mt-0.5">›</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Personality traits */}
                  {selectedPersona.personality?.traits?.length > 0 && (
                    <div>
                      <h4 className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] mb-2">Personality Traits</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPersona.personality.traits.map((t) => (
                          <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-[#c0c0cc]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apps */}
                  {selectedPersona.favourite_apps?.length > 0 && (
                    <div>
                      <h4 className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] mb-2">Favourite Apps</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPersona.favourite_apps.slice(0, 8).map((a) => (
                          <span key={a} className="text-[9px] font-mono px-2 py-0.5 rounded-md border border-white/[0.05] bg-white/[0.01] text-[#6b6b78]">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="border-t border-white/[0.05] p-4 flex gap-3 shrink-0">
                  <Link
                    to="/interview"
                    className="flex-1 btn-primary text-[10px] justify-center py-2.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Interview
                  </Link>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="btn-ghost text-[10px] py-2.5 px-4"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
