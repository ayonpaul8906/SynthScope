import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Send, MapPin, Target, AlertTriangle, Cpu, MessageSquare, ShieldCheck, Heart } from "lucide-react";
import { personas, type Persona } from "@/data/personas";
import { PremiumAvatar } from "@/lib/avatar";

export const Route = createFileRoute("/interview")({
  component: InterviewPage,
  head: () => ({ meta: [{ title: "Interview Console — SynthScope" }] }),
});

type Msg = { role: "user" | "ai"; text: string };

const suggested = [
  "Walk me through your last research task.",
  "What frustrates you about current tooling?",
  "What would make you pay for SynthScope tomorrow?",
  "Describe your ideal team configuration.",
];

const canned = (p: Persona) => [
  `Honestly, as a ${p.occupation.toLowerCase()}, my biggest day-to-day issue is ${p.frustrations[0].toLowerCase()}.`,
  `I'd love a platform that helps me ${p.goals[0].toLowerCase()} without adding friction to my workflow.`,
  `I really value desaturated, high-performance layouts. Fine polish matters to me.`,
  `Coming from ${p.location.split(",")[0]}, I'd share this with my team on ${p.tech.split("—")[0].trim()}.`,
];

function InterviewPage() {
  const [activeId, setActiveId] = useState(personas[0].id);
  const [threads, setThreads] = useState<Record<string, Msg[]>>(() =>
    Object.fromEntries(
      personas.map((p) => [
        p.id,
        [
          {
            role: "ai",
            text: `Hi, I'm ${p.name}. Ask me anything about my daily workflow and challenges.`,
          },
        ],
      ]),
    ),
  );
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const active = personas.find((p) => p.id === activeId)!;
  const messages = threads[activeId];
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setDraft("");
    setThreads((prev) => ({ ...prev, [activeId]: [...prev[activeId], { role: "user", text: t }] }));
    setTyping(true);
    const options = canned(active);
    const reply = options[Math.floor(Math.random() * options.length)];
    setTimeout(
      () => {
        setThreads((prev) => ({
          ...prev,
          [activeId]: [...prev[activeId], { role: "ai", text: reply }],
        }));
        setTyping(false);
      },
      900 + Math.random() * 600,
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:px-8 text-[#f2f2f3]">
      {/* Outer borders framing the interview canvas */}
      <div className="border-l border-r border-white/[0.02] px-6 sm:px-12 md:px-16">
        
        {/* Header Info */}
        <div className="mb-8 flex items-center justify-between border-b border-white/[0.03] pb-4 pt-4">
          <div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#7f8084] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
              DIALOGUE CONSOLE // SIMULATOR
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-none">
              Interview Mode. <span className="font-editor font-light text-[#7f8084]">Agent dialogue.</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded">
            <ShieldCheck className="h-3.5 w-3.5" /> SECURE DEPLOYMENT
          </div>
        </div>

        {/* Three Column Console Layout */}
        <div className="grid gap-6 lg:grid-cols-[230px_1fr_250px] text-left">
          
          {/* Column 1: Persona Nav List */}
          <aside className="premium-card h-[72vh] overflow-y-auto rounded-lg border border-white/[0.04] bg-black/60 p-3 shadow-2xl backdrop-blur-xl no-scrollbar">
            <span className="text-[8px] font-bold uppercase tracking-wider text-[#7f8084] block px-2 mb-3 font-mono">
              SYNTHETIC ROSTER
            </span>
            <div className="space-y-1">
              {personas.map((p) => {
                const isActive = p.id === activeId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveId(p.id)}
                    className={`flex w-full items-center gap-3 rounded px-2.5 py-2 text-left transition ${
                      isActive ? "bg-white/5 text-white" : "hover:bg-white/[0.02] text-[#7f8084]"
                    }`}
                  >
                    <div className="h-8 w-8 shrink-0">
                      <PremiumAvatar name={p.name} className="h-8 w-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold text-white leading-tight">{p.name}</div>
                      <div className="truncate text-[9px] text-[#7f8084] mt-0.5 font-mono uppercase">{p.occupation}</div>
                    </div>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Column 2: Dialogue Workspace */}
          <section className="premium-card flex h-[72vh] flex-col overflow-hidden rounded-lg border border-white/[0.04] bg-black/60 shadow-2xl backdrop-blur-xl">
            {/* Chat Header */}
            <header className="flex items-center gap-3 border-b border-white/[0.03] p-4 bg-white/[0.005]">
              <div className="h-9 w-9">
                <PremiumAvatar name={active.name} className="h-9 w-9" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs leading-none">{active.name}</div>
                <div className="text-[9px] text-[#7f8084] mt-1 font-mono uppercase">
                  {active.occupation} · {active.location}
                </div>
              </div>
              <span className="ml-auto text-[8px] font-mono font-bold uppercase tracking-wider text-[#7f8084] border border-white/5 bg-white/5 px-2.5 py-1 rounded">
                SIMULATION ACTIVE
              </span>
            </header>

            {/* Messages Box */}
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4.5 no-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded border px-3.5 py-2 text-xs leading-relaxed ${
                        m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                      }`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {typing && (
                <div className="flex justify-start">
                  <div className="chat-bubble-ai flex items-center gap-1.5 rounded px-3.5 py-2.5 text-[8px] font-mono text-[#7f8084]">
                    <span className="h-1 w-1 rounded-full bg-[#7f8084] animate-pulse" />
                    <span>SYNTHESIZING REPLY...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Suggested Prompts & Input */}
            <div className="border-t border-white/[0.03] p-4 bg-white/[0.005]">
              <div className="mb-3.5 flex flex-wrap gap-1.5">
                {suggested.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded border border-white/5 bg-white/[0.01] px-2.5 py-1.5 text-[9px] text-[#7f8084] hover:border-white/10 hover:text-white transition font-mono uppercase"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded border border-white/5 bg-white/[0.01] p-1.5">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(draft)}
                  placeholder={`PROMPT ${active.name.split(" ")[0].toUpperCase()}...`}
                  className="flex-1 bg-transparent px-3 py-2 text-xs outline-none placeholder:text-[#7f8084] text-white font-mono uppercase"
                />
                <button
                  onClick={() => send(draft)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded bg-white text-black hover:bg-zinc-200 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Column 3: Mini Dossier HUD */}
          <aside className="premium-card h-[72vh] overflow-y-auto rounded-lg border border-white/[0.04] bg-black/60 p-4 shadow-2xl backdrop-blur-xl no-scrollbar flex flex-col justify-between">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-white block border-b border-white/[0.03] pb-2 mb-4 font-mono">
                CONTEXT BLUEPRINT
              </span>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#7f8084] font-mono">
                    Location Vector
                  </span>
                  <p className="text-[10px] text-white mt-1 font-semibold">{active.location}</p>
                </div>

                <div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#7f8084] font-mono">
                    Goals
                  </span>
                  <ul className="list-inside list-disc mt-1 text-[10px] text-[#7f8084] space-y-1 leading-normal">
                    {active.goals.map((g) => (
                      <li key={g} className="leading-relaxed">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#7f8084] font-mono">
                    Frustrations
                  </span>
                  <ul className="list-inside list-disc mt-1 text-[10px] text-[#7f8084] space-y-1 leading-normal">
                    {active.frustrations.map((f) => (
                      <li key={f} className="leading-relaxed">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#7f8084] font-mono">
                    Workspace Stack
                  </span>
                  <p className="text-[10px] text-[#7f8084] mt-1.5 leading-normal capitalize font-mono text-[9px]">
                    {active.tech}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.03] pt-4">
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#7f8084] font-mono">
                Alignment Sentiment
              </span>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-white bg-white/[0.01] border border-white/5 p-2 rounded">
                <span className="capitalize font-mono text-[9px]">{active.sentiment} VOTE</span>
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    active.sentiment === "positive"
                      ? "bg-emerald-400"
                      : active.sentiment === "negative"
                        ? "bg-rose-400"
                        : "bg-amber-400"
                  }`}
                />
              </div>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}
