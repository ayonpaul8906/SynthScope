import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Send,
  MapPin,
  Target,
  AlertTriangle,
  Cpu,
  MessageSquare,
  Loader2,
  Sparkles,
  UserCheck,
  Briefcase,
  RotateCcw,  
  Wifi,
  WifiOff,
  Database,
  Zap,
} from "lucide-react";
import { personas as seedPersonas, type Persona as SeedPersona } from "@/data/personas";
import { PremiumAvatar } from "@/lib/avatar";
import { getAuthHeaders } from "@/lib/api-headers";

export const Route = createFileRoute("/interview")({
  component: InterviewPage,
  head: () => ({ meta: [{ title: "Interview Console — SynthScope" }] }),
});

type Msg = { 
  role: "user" | "ai"; 
  text: string; 
  source?: "db" | "llm" | "user" | "greeting";
};

type BackendPersona = {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  country: string;
  occupation: string;
  education?: string;
  annual_income?: string;
  budget?: string;
  persona_summary: string;
  lifestyle?: string;
  technology_usage?: string;
  digital_literacy?: string;
  brand_loyalty?: string;
  operating_system?: string;
  ecosystem?: string;
  quote?: string;
  goals?: string[];
  pain_points?: string[];
  frustrations?: string[];
  preferred_features?: string[];
  devices?: string[];
  favourite_apps?: string[];
  sentiment_archetype?: string;
};

// Normalized Persona for display and chat simulation
type UnifiedPersona = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  goals: string[];
  frustrations: string[];
  tech: string;
  income: string;
  quote: string;
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  sentimentLabel: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const THREADS_STORAGE_KEY = "synthscope.interview.threads";

const fallbackQuestions = [
  "Walk me through your daily work routine.",
  "What are your biggest frustrations with current tools in your industry?",
  "What specific features would convince you to adopt our solution?",
  "How do you evaluate pricing and ROI for new software?",
  "What tools and devices make up your everyday tech stack?",
];

function normalizeBackendPersona(p: BackendPersona): UnifiedPersona {
  const arch = p.sentiment_archetype?.toLowerCase() || "pragmatist";
  let sentiment: UnifiedPersona["sentiment"] = "neutral";
  let label = "Pragmatist";
  if (arch === "champion" || arch === "enthusiast") {
    sentiment = "positive";
    label = arch === "champion" ? "Champion" : "Enthusiast";
  } else if (arch === "critic") {
    sentiment = "negative";
    label = "Critic";
  } else if (arch === "mixed") {
    sentiment = "mixed";
    label = "Mixed";
  } else if (arch === "skeptic") {
    sentiment = "neutral";
    label = "Skeptic";
  }

  return {
    id: p.id,
    name: p.name || "Anonymous Persona",
    age: p.age || 28,
    occupation: p.occupation || "Professional",
    location: `${p.city || "Bengaluru"}, ${p.country || "India"}`,
    goals:
      p.goals && p.goals.length ? p.goals : ["Streamline efficiency", "Achieve seamless workflow"],
    frustrations:
      p.pain_points && p.pain_points.length
        ? p.pain_points
        : p.frustrations || ["Unintuitive UI", "Manual data friction"],
    tech: p.favourite_apps?.join(", ") || "Notion, Slack, Chrome",
    income: p.annual_income || p.budget || "₹12-18 LPA",
    quote: p.quote || "Simplicity and speed are what matter most in my workflow.",
    sentiment,
    sentimentLabel: label,
  };
}

function normalizeSeedPersona(p: SeedPersona): UnifiedPersona {
  return {
    id: p.id,
    name: p.name,
    age: p.age || 29,
    occupation: p.occupation,
    location: p.location || "Bengaluru, India",
    goals: p.goals,
    frustrations: p.frustrations,
    tech: p.tech,
    income: "₹15 LPA",
    quote: "Looking for intuitive solutions that don't complicate my process.",
    sentiment:
      p.sentiment === "positive" ? "positive" : p.sentiment === "negative" ? "negative" : "neutral",
    sentimentLabel: p.sentiment.toUpperCase(),
  };
}

// Offline / API-failure fallback so the persona always answers in character.
function getFallbackReply(p: UnifiedPersona, promptText: string): string {
  const qLower = promptText.toLowerCase();
  const goal = p.goals[0] || "save time and work cleanly";
  const frust = p.frustrations[0] || "dealing with slow, fragmented interfaces";

  if (
    qLower.includes("routine") ||
    qLower.includes("daily") ||
    qLower.includes("walk me through")
  ) {
    return `As a ${p.occupation} based in ${p.location.split(",")[0]}, most of my day revolves around avoiding friction and staying focused. I rely heavily on apps like ${p.tech} to manage my priorities.`;
  }
  if (
    qLower.includes("frustrat") ||
    qLower.includes("problem") ||
    qLower.includes("challenge") ||
    qLower.includes("pain")
  ) {
    return `Without a doubt, my biggest headache is ${frust.toLowerCase()}. Too many software solutions sound great on paper but create extra administrative effort when you actually deploy them.`;
  }
  if (
    qLower.includes("price") ||
    qLower.includes("cost") ||
    qLower.includes("pay") ||
    qLower.includes("budget")
  ) {
    return `My compensation level (${p.income}) gives me decent purchasing autonomy, but I need clear ROI. If a tool tangibly saves me an hour a day and eliminates manual rework, I'm completely willing to advocate for buying it.`;
  }
  return `That's a really interesting point! From my perspective as a ${p.occupation}, my main priority is to ${goal.toLowerCase()}. If a platform solves that natively, I'm all in.`;
}

function loadStoredThreads(): Record<string, Msg[]> | null {
  try {
    const raw = sessionStorage.getItem(THREADS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, Msg[]>;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // ignore corrupted storage
  }
  return null;
}

function buildGreeting(p: UnifiedPersona): Msg {
  return {
    role: "ai",
    text: `Hello! I am ${p.name}, a ${p.age}-year-old ${p.occupation} from ${p.location}. Ask me anything for your user research — I'll answer as myself.`,
    source: "greeting",
  };
}

function InterviewPage() {
  const [personas, setPersonas] = useState<UnifiedPersona[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});
  const [questions, setQuestions] = useState<string[]>(fallbackQuestions);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  // Fetch personas and persisted DB conversation history scoped to user_id
  useEffect(() => {
    let isMounted = true;
    const fetchPersonasAndConversations = async () => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/personas`, { headers });
        let list: UnifiedPersona[] = [];
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            list = data.map(normalizeBackendPersona);
          }
        }
        if (list.length === 0) {
          list = seedPersonas.map(normalizeSeedPersona);
        }

        // Fetch persisted conversation history from database
        let dbThreads: Record<string, Msg[]> = {};
        try {
          const convRes = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/interview/conversations`, { headers });
          if (convRes.ok) {
            const convData = await convRes.json();
            if (convData?.threads && typeof convData.threads === "object") {
              Object.keys(convData.threads).forEach((pId) => {
                const msgs = convData.threads[pId];
                if (Array.isArray(msgs) && msgs.length > 0) {
                  dbThreads[pId] = msgs.map((m: any) => ({
                    role: m.role === "user" ? "user" : "ai",
                    text: m.text,
                    source: m.source || (m.role === "user" ? "user" : "llm"),
                  }));
                }
              });
            }
          }
        } catch {
          // ignore conversation fetch errors, fallback to storage
        }

        if (isMounted) {
          const storedThreads = loadStoredThreads();
          const initialThreads: Record<string, Msg[]> = {};
          list.forEach((p) => {
            if (dbThreads[p.id]?.length) {
              initialThreads[p.id] = dbThreads[p.id];
            } else if (storedThreads?.[p.id]?.length) {
              initialThreads[p.id] = storedThreads[p.id];
            } else {
              initialThreads[p.id] = [buildGreeting(p)];
            }
          });
          setPersonas(list);
          setActiveId(list[0].id);
          setThreads(initialThreads);
        }
      } catch (e) {
        if (isMounted) {
          const fallback = seedPersonas.map(normalizeSeedPersona);
          const initialThreads: Record<string, Msg[]> = {};
          fallback.forEach((p) => {
            initialThreads[p.id] = [buildGreeting(p)];
          });
          setPersonas(fallback);
          setActiveId(fallback[0].id);
          setThreads(initialThreads);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchPersonasAndConversations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically fetch hardcoded basic probing questions personalized to the active persona and product brief
  useEffect(() => {
    let isMounted = true;
    const fetchPersonalizedQuestions = async () => {
      if (!activeId) return;
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/interview/questions?persona_id=${activeId}`, { headers });
        if (res.ok) {
          const data = (await res.json()) as Array<{ id: string; key: string; question: string; category: string }>;
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setQuestions(data.map((q) => q.question));
            return;
          }
        }
      } catch {
        // ignore errors
      }
      if (isMounted) setQuestions(fallbackQuestions);
    };
    void fetchPersonalizedQuestions();
    return () => {
      isMounted = false;
    };
  }, [activeId]);

  // Persist conversation memory in sessionStorage as an instantaneous local cache
  useEffect(() => {
    if (Object.keys(threads).length > 0) {
      try {
        sessionStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
      } catch {
        // ignore quota errors
      }
    }
  }, [threads]);

  const active = personas.find((p) => p.id === activeId);
  const messages = useMemo(
    () => (activeId && threads[activeId] ? threads[activeId] : []),
    [activeId, threads],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback(
    async (text: string) => {
      if (!active || !activeId) return;
      const t = text.trim();
      if (!t || typing) return;
      setDraft("");
      const prior = threads[activeId] ?? [];
      const withUser: Msg[] = [...prior, { role: "user", text: t, source: "user" }];
      setThreads((prev) => ({ ...prev, [activeId]: withUser }));
      setTyping(true);

      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/interview/chat`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            persona_id: activeId,
            message: t,
            history: prior.map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              text: m.text,
            })),
          }),
        });
        if (!res.ok) throw new Error("Interview request failed");
        const data = (await res.json()) as { reply: string; source?: "db" | "llm" };
        const reply = data.reply?.trim() || getFallbackReply(active, t);
        const source = data.source || "llm";
        setThreads((prev) => ({
          ...prev,
          [activeId]: [...withUser, { role: "ai", text: reply, source }],
        }));
        setOnline(true);
      } catch {
        setOnline(false);
        const reply = getFallbackReply(active, t);
        setThreads((prev) => ({
          ...prev,
          [activeId]: [...withUser, { role: "ai", text: reply, source: "db" }],
        }));
      } finally {
        setTyping(false);
      }
    },
    [active, activeId, threads, typing],
  );

  const resetConversation = useCallback(async () => {
    if (!active || !activeId) return;
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE_URL.replace(/\/$/, "")}/interview/history/${activeId}`, {
        method: "DELETE",
        headers,
      });
    } catch {
      // ignore server cleanup error
    }
    setThreads((prev) => ({ ...prev, [activeId]: [buildGreeting(active)] }));
  }, [active, activeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-[#6b6b78]">
        <Loader2 className="h-7 w-7 animate-spin mb-4 text-white/80" />
        <p className="font-mono text-xs tracking-wider uppercase">
          Loading live synthetic panel...
        </p>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2
          className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          NO PERSONAS FOUND
        </h2>
        <p className="text-sm text-[#6b6b78] mb-6">
          Deploy a synthetic panel in the Simulator first to start conducting live interviews.
        </p>
        <Link
          to="/create-experiment"
          className="btn-primary text-xs inline-flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" /> Go to Simulator
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 text-[#ededf0]">
      {/* Header Info */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.05] pb-6 gap-4">
        <div>
          <h1
            className="text-4xl font-bold uppercase text-white leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Interview Console
            <span className="text-[#6b6b78] ml-3 font-light text-3xl"></span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/survey"
            className="btn-ghost text-[10px] uppercase font-mono tracking-widest px-3.5 py-2"
          >
            View Survey Lab
          </Link>
          <div
            className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border ${online ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}
          >
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? "DB PERSISTENCE ACTIVE" : "OFFLINE FALLBACK"}
          </div>
        </div>
      </div>

      {/* Three Column Console Layout */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr_290px] text-left">
        {/* Column 1: Persona Nav List */}
        <aside className="premium-card h-[85vh] overflow-y-auto rounded-xl border border-white/[0.05] p-3 shadow-xl flex flex-col no-scrollbar">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#6b6b78] px-2.5 py-1 mb-2 block border-b border-white/[0.04]">
            SELECT AGENT ROSTER
          </span>
          <div className="space-y-1 flex-1 overflow-y-auto pr-1 no-scrollbar">
            {personas.map((p) => {
              const isActive = p.id === activeId;
              const turnCount = threads[p.id]?.filter((m) => m.role === "user").length ?? 0;
              const badgeCls =
                p.sentiment === "positive"
                  ? "text-emerald-400 border-emerald-500/30"
                  : p.sentiment === "negative"
                    ? "text-rose-400 border-rose-500/30"
                    : p.sentiment === "mixed"
                      ? "text-violet-400 border-violet-500/30"
                      : "text-amber-400 border-amber-500/30";
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-white/[0.07] text-white border border-white/10"
                      : "hover:bg-white/[0.03] text-[#8b8b96] border border-transparent"
                  }`}
                >
                  <PremiumAvatar name={p.name} className="h-8 w-8 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-white leading-tight">
                      {p.name}
                    </div>
                    <div className="truncate text-[10px] text-[#6b6b78] mt-0.5 font-mono">
                      {p.occupation}
                    </div>
                  </div>
                  {turnCount > 0 && (
                    <span className="text-[8px] font-mono text-[#6b6b78]">{turnCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Column 2: Dialogue Workspace */}
        <section className="premium-card flex h-[85vh] flex-col overflow-hidden rounded-xl border border-white/[0.05] shadow-xl">
          {/* Chat Header */}
          <header className="flex items-center gap-3 border-b border-white/[0.05] p-4 bg-white/[0.01]">
            <PremiumAvatar name={active.name} className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white text-sm leading-none flex items-center gap-2">
                {active.name}
                <span className="text-[10px] font-mono text-[#6b6b78]">({active.age}y)</span>
              </div>
              <div className="text-[10px] text-[#6b6b78] mt-1 font-mono flex items-center gap-1.5 truncate">
                <MapPin className="h-2.5 w-2.5" /> {active.location} · {active.occupation}
              </div>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#6b6b78] px-2.5 py-1 rounded border border-white/[0.06] bg-white/[0.02]">
              INTERACTIVE SESSION
            </span>
            <button
              onClick={() => void resetConversation()}
              title="Reset conversation memory in DB and console"
              className="h-8 w-8 rounded-lg border border-white/[0.06] flex items-center justify-center text-[#6b6b78] hover:text-white hover:border-white/20 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </header>

          {/* Messages Box */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 no-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-xl border px-4 py-3 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-white/[0.08] border-white/20 text-white font-medium shadow-md"
                        : "bg-black/40 border-white/[0.08] text-[#d6d6de] shadow-md"
                    }`}
                  >
                    {m.role === "ai" && (
                      <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/[0.04]">
                        <span className="text-[9px] font-mono text-[#d6a07e] uppercase tracking-wider font-semibold">
                          {active.name}
                        </span>
                      </div>
                    )}
                    <p className="text-[13px] text-[#ededf0] whitespace-pre-wrap">{m.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {typing && (
              <div className="flex justify-start">
                <div className="bg-black/40 border border-white/[0.06] flex items-center gap-2.5 rounded-xl px-4 py-3 text-[10px] font-mono text-[#8b8b96] shadow-md animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span>{active.name.split(" ")[0]} IS EVALUATING MEMORY & SYNTHESIZING REPLY...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggested Prompts & Input */}
          <div className="border-t border-white/[0.05] p-3 bg-white/[0.01]">
            <div className="mb-2.5 flex flex-nowrap overflow-x-auto gap-2 pb-1 no-scrollbar">
              {questions.map((q) => (
                <button
                  key={q}
                  onClick={() => void send(q)}
                  disabled={typing}
                  className="shrink-0 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[9px] font-mono text-[#a0a0ae] hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-cyan-500/[0.05] hover:shadow-[0_0_12px_rgba(34,211,238,0.15)] transition whitespace-nowrap disabled:opacity-40"
                  title={q}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-black/60 p-1.5 focus-within:border-white/30 transition shadow-inner">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !typing && void send(draft)}
                placeholder={`Ask ${active.name.split(" ")[0]} any question...`}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white outline-none placeholder:text-[#6b6b78] font-sans"
              />
              <button
                onClick={() => void send(draft)}
                disabled={!draft.trim() || typing}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-black hover:bg-zinc-200 transition disabled:opacity-30 shadow-md"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Column 3: Dossier Blueprint HUD */}
        <aside className="premium-card h-[85vh] overflow-y-auto rounded-xl border border-white/[0.05] p-5 shadow-xl flex flex-col justify-between no-scrollbar space-y-6">
          <div className="space-y-5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#6b6b78] block border-b border-white/[0.04] pb-2">
              AGENT DOSSIER BLUEPRINT
            </span>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> Professional Status
                </span>
                <p className="text-xs font-semibold text-white mt-1">{active.occupation}</p>
                <p className="text-[10px] font-mono text-[#8b8b96] mt-0.5">
                  Est. Income: {active.income}
                </p>
              </div>

              <div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] flex items-center gap-1">
                  <Target className="h-3 w-3 text-emerald-400" /> Primary Objectives
                </span>
                <ul className="mt-1.5 space-y-1">
                  {active.goals.slice(0, 3).map((g) => (
                    <li key={g} className="text-[11px] text-[#c0c0cc] leading-snug flex gap-1.5">
                      <span className="text-emerald-400 shrink-0">›</span> {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-rose-400" /> Key Frustrations
                </span>
                <ul className="mt-1.5 space-y-1">
                  {active.frustrations.slice(0, 3).map((f) => (
                    <li key={f} className="text-[11px] text-[#c0c0cc] leading-snug flex gap-1.5">
                      <span className="text-rose-400 shrink-0">›</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> Tech Stack & Apps
                </span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {active.tech.split(", ").map((t) => (
                    <span
                      key={t}
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[#8b8b96]"
                    >
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {active.quote && (
                <div className="border-l-2 border-white/10 pl-3 pt-1">
                  <p className="text-[10px] text-[#8b8b96] italic leading-relaxed">
                    "{active.quote.replace(/^[":\s]+|[":\s]+$/g, "")}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-4 shrink-0 space-y-3">
            <div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#6b6b78] block mb-2">
                Behavioral Sentiment Archetype
              </span>
              <div className="flex items-center justify-between text-xs font-bold text-white bg-white/[0.02] border border-white/[0.06] px-3 py-2 rounded-lg">
                <span className="uppercase font-mono text-[10px]">{active.sentimentLabel}</span>
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    active.sentiment === "positive"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      : active.sentiment === "negative"
                        ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]"
                        : active.sentiment === "mixed"
                          ? "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                          : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                  }`}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
