import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Plus, Download, X, ThumbsUp, ThumbsDown, ClipboardList, HelpCircle } from "lucide-react";
import { personas } from "@/data/personas";
import { PremiumAvatar } from "@/lib/avatar";

export const Route = createFileRoute("/survey")({
  component: SurveyPage,
  head: () => ({ meta: [{ title: "Survey Lab — SynthScope" }] }),
});

const sampleResponses: Record<string, string[]> = {
  "What is your first reaction to this product?": [
    "I would use this weekly — it fits my workflow.",
    "Interesting, but pricing needs to be clearer.",
    "Onboarding felt overwhelming; I bounced twice.",
    "Loved it. Sharing with my team today.",
    "Nice concept, but I want mobile support.",
    "Not for me — I already use a competitor.",
    "The AI suggestions are surprisingly relevant.",
    "Feels premium and thoughtfully designed.",
  ],
  "How likely are you to recommend it to a colleague?": [
    "Quite likely. It saves a lot of time.",
    "Maybe if they address the pricing model.",
    "Unlikely right now. Too much onboarding friction.",
    "10/10. Definitely recommending it.",
    "7/10. Needs some mobile polish first.",
    "Hard pass. Already set up on competitors.",
    "Highly likely, the recommendations are great.",
    "Definitely, the UI polish is outstanding.",
  ],
  "What is your primary friction point with similar tools?": [
    "Getting team adoption and high onboarding drop-offs.",
    "Steep pricing tiers that don't scale with usage.",
    "Lack of integrations with Figma and Linear.",
    "Terrible customer service when issues pop up.",
    "Slow load speeds and heavy web wrappers.",
    "Clunky UI that feels built in 2012.",
    "Lack of automated insight grouping.",
    "Poor support for mobile collaboration.",
  ],
};

function SurveyPage() {
  const [questions, setQuestions] = useState<string[]>([
    "What is your first reaction to this product?",
    "How likely are you to recommend it to a colleague?",
  ]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [typingPersonaIds, setTypingPersonaIds] = useState<string[]>([]);

  const addQuestion = () => {
    const q = draft.trim();
    if (!q) return;

    const updatedQuestions = [...questions, q];
    setQuestions(updatedQuestions);
    setDraft("");

    const newIndex = updatedQuestions.length - 1;
    setActiveQuestionIndex(newIndex);
    setTypingPersonaIds(personas.map((p) => p.id));
  };

  useEffect(() => {
    if (typingPersonaIds.length === 0) return;

    const timer = setTimeout(
      () => {
        setTypingPersonaIds((prev) => prev.slice(1));
      },
      250 + Math.random() * 200,
    );

    return () => clearTimeout(timer);
  }, [typingPersonaIds]);

  const activeQuestion = questions[activeQuestionIndex];

  const getResponsesForQuestion = (q: string) => {
    return (
      sampleResponses[q] || [
        "This would simplify my workflow considerably.",
        "The value proposition is solid.",
        "I'd need to consult my team first.",
        "Looks promising, but needs more documentation.",
        "Very neat design.",
        "I'm neutral on this feature.",
        "Highly valuable data extraction.",
        "Saves a lot of manual auditing.",
      ]
    );
  };

  const activeResponses = activeQuestion ? getResponsesForQuestion(activeQuestion) : [];

  const sentimentStats = useMemo(() => {
    const hash = activeQuestionIndex % 3;
    if (hash === 0) return { pos: 68, neu: 18, neg: 14 };
    if (hash === 1) return { pos: 55, neu: 30, neg: 15 };
    return { pos: 42, neu: 38, neg: 20 };
  }, [activeQuestionIndex]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 text-[#f2f2f3]">
      {/* Outer borders framing the survey canvas */}
      <div className="border-l border-r border-white/[0.02] px-6 sm:px-12 md:px-16">
        
        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-white/[0.03] pb-8 md:flex-row md:items-end">
          <div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#7f8084] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
              SURVEY LAB // AUTOMATED INFERENCE
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-none">
              Survey Mode. <span className="font-editor font-light text-[#7f8084]">Simulated consensus.</span>
            </h1>
          </div>
          
          <button className="premium-card inline-flex items-center gap-2 rounded px-4 py-2 text-[10px] font-bold font-mono tracking-wider text-white border border-white/5 hover:text-[#7f8084] transition">
            <Download className="h-3.5 w-3.5" /> EXPORT REPORT
          </button>
        </div>

        {/* Two-Column Workspace Grid */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left Sidebar: Questions directory */}
          <aside className="space-y-4 text-left">
            <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-4 shadow-2xl backdrop-blur-xl">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#7f8084] block mb-3 font-mono">QUESTIONS LIST</span>

              <div className="space-y-1 max-h-[45vh] overflow-y-auto pr-1 no-scrollbar">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`group relative flex items-center justify-between rounded px-2.5 py-2 text-left text-[11px] transition cursor-pointer ${
                      activeQuestionIndex === idx
                        ? "bg-white/5 text-white"
                        : "text-[#7f8084] hover:text-white"
                    }`}
                    onClick={() => setActiveQuestionIndex(idx)}
                  >
                    <span className="truncate pr-4 flex items-center gap-1.5">
                      <span className="font-bold font-mono text-[#7f8084]">Q-0{idx + 1}</span> {q}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = questions.filter((_, i) => i !== idx);
                        setQuestions(updated);
                        if (activeQuestionIndex >= updated.length) {
                          setActiveQuestionIndex(Math.max(0, updated.length - 1));
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[#7f8084] hover:text-rose-400 p-0.5 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="text-[10px] text-[#7f8084] font-mono text-center py-6">
                    EMPTY QUEUE.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add Question Tool */}
            <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-4 shadow-2xl backdrop-blur-xl">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#7f8084] block mb-2.5 font-mono">DEPLOY PROMPT</span>
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                  placeholder="PROMPT PANEL..."
                  className="flex-1 rounded border border-white/5 bg-white/[0.01] px-3 py-2 text-[10px] text-white outline-none focus:border-white/20 placeholder:text-[#7f8084] font-mono uppercase"
                />
                <button
                  onClick={addQuestion}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white text-black hover:bg-zinc-200 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* Right Workspace: Responses HUD */}
          <section className="space-y-5 text-left">
            {activeQuestion ? (
              <>
                {/* Question Analytics Header */}
                <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#7f8084]">
                      AUDITING COHORT INDEX
                    </span>
                    <h2 className="text-xs font-bold text-white mt-1.5 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#7f8084] shrink-0" /> {activeQuestion}
                    </h2>
                  </div>

                  {/* Micro Sentiment Alignment Stat */}
                  <div className="flex gap-5 border-l border-white/[0.03] pl-5 shrink-0 font-mono text-[9px]">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-3.5 w-3.5 text-[#7f8084]" />
                      <div>
                        <div className="text-white font-bold">{sentimentStats.pos}%</div>
                        <div className="text-[7px] uppercase tracking-wider text-[#7f8084]">POSITIVE</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-3.5 w-3.5 text-[#7f8084]" />
                      <div>
                        <div className="text-white font-bold">{sentimentStats.neg}%</div>
                        <div className="text-[7px] uppercase tracking-wider text-[#7f8084]">NEGATIVE</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid of responses */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {personas.map((p, idx) => {
                    const isTyping = typingPersonaIds.includes(p.id);
                    const responseText = activeResponses[idx % activeResponses.length];

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.02 }}
                        className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-4.5 flex flex-col justify-between h-[135px] hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 border-b border-white/[0.03] pb-2.5 mb-2.5">
                          <div className="h-7 w-7">
                            <PremiumAvatar name={p.name} className="h-7 w-7" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                            <p className="text-[8px] text-[#7f8084] font-mono uppercase truncate mt-0.5">{p.occupation}</p>
                          </div>
                        </div>

                        {/* Content block: simulated typing or final quote */}
                        <div className="flex-1 flex items-center">
                          <AnimatePresence mode="wait">
                            {isTyping ? (
                              <motion.div
                                key="typing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-1.5 items-center text-[8px] text-[#7f8084] font-mono tracking-wider"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-[#7f8084] animate-pulse" />
                                <span>PROCESSING VECTOR...</span>
                              </motion.div>
                            ) : (
                              <motion.p
                                key="text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[11px] italic text-[#7f8084] leading-relaxed line-clamp-3"
                              >
                                "{responseText}"
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="premium-card rounded-lg border border-white/[0.04] bg-black/60 p-16 text-center shadow-2xl backdrop-blur-xl">
                <span className="text-[9px] font-mono text-[#7f8084] tracking-widest block mb-4 uppercase">NO ACTIVE SPECIFICATIONS</span>
                <p className="text-xs text-[#7f8084]">
                  Deploy your prompt parameter in the left sidebar to parse replies.
                </p>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
