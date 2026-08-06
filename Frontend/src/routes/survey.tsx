import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Download,
  X,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Loader2,
  Sparkles,
  Filter,
  Quote,
  Maximize2,
  MessageSquareQuote,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import { personas as seedPersonas } from "@/data/personas";
import { PremiumAvatar } from "@/lib/avatar";
import { getAuthHeaders } from "@/lib/api-headers";

export const Route = createFileRoute("/survey")({
  component: SurveyPage,
  head: () => ({ meta: [{ title: "SynthScope" }] }),
});

type BackendPersona = {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  country: string;
  occupation: string;
  persona_summary: string;
  quote: string;
};

type StoredQuestion = {
  id: string;
  product_name: string;
  industry: string;
  question_text: string;
  question_type: string;
  question_order: number;
};

type StoredPersonaSurveyResponse = {
  id: string;
  question_id: string;
  persona_id: string;
  response_text: string;
  sentiment: string;
  created_at: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function SurveyPage() {
  const [questions, setQuestions] = useState<StoredQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [dbPersonas, setDbPersonas] = useState<BackendPersona[]>([]);
  const [responsesMap, setResponsesMap] = useState<Record<string, StoredPersonaSurveyResponse[]>>({});
  // Track which question IDs are currently being polled for responses
  const [pendingResponseIds, setPendingResponseIds] = useState<Set<string>>(new Set());

  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [typingPersonaIds, setTypingPersonaIds] = useState<string[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [expandedResponse, setExpandedResponse] = useState<{ personaName: string; text: string; sentiment: string } | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * Pipeline-based data loading:
   * 1. Fetch personas and questions immediately — show page with no blocking
   * 2. If no questions exist, call /survey/run-pipeline to generate them + kick off responses in backend
   * 3. Start polling responses for each question independently
   */
  useEffect(() => {
    let active = true;

    const initData = async () => {
      setIsLoading(true);
      try {
        const headers = await getAuthHeaders();
        // Fetch personas
        const personaRes = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/personas`, { headers });
        let loadedPersonas: BackendPersona[] = [];
        if (personaRes.ok) {
          const data = await personaRes.json();
          if (Array.isArray(data) && data.length > 0) loadedPersonas = data;
        }
        if (active) setDbPersonas(loadedPersonas);

        // Fetch questions (fast)
        const questionsRes = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/survey/questions`, { headers });
        let loadedQuestions: StoredQuestion[] = [];
        if (questionsRes.ok) {
          const qData = await questionsRes.json();
          if (Array.isArray(qData) && qData.length > 0) loadedQuestions = qData;
        }

        // No questions yet — trigger pipeline (questions return fast, responses generated in BG)
        if (loadedQuestions.length === 0) {
          const pipelineRes = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/survey/run-pipeline`, {
            method: "POST",
            headers,
          });
          if (pipelineRes.ok) {
            const pData = await pipelineRes.json();
            if (Array.isArray(pData) && pData.length > 0) loadedQuestions = pData;
          }
        }

        if (active) {
          setQuestions(loadedQuestions);
          // Mark all questions as pending responses
          setPendingResponseIds(new Set(loadedQuestions.map((q) => q.id)));
        }
      } catch (err) {
        console.error("Error loading survey data:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void initData();

    return () => { active = false; };
  }, []);

  const activeQuestion = questions[activeQuestionIndex];

  /**
   * Per-question polling:
   * For each question without responses, poll every 3s (up to 20 attempts).
   * This lets responses appear as the backend generates them.
   */
  useEffect(() => {
    if (pendingResponseIds.size === 0) return;

    const pollers: ReturnType<typeof setInterval>[] = [];

    for (const questionId of pendingResponseIds) {
      // Skip if already loaded
      if (responsesMap[questionId] && responsesMap[questionId].length > 0) {
        setPendingResponseIds((prev) => { const next = new Set(prev); next.delete(questionId); return next; });
        continue;
      }

      let attempts = 0;
      const MAX_ATTEMPTS = 20;

      const poller = setInterval(async () => {
        attempts++;
        try {
          const headers = await getAuthHeaders();
          const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/survey/questions/${questionId}/responses`, { headers });
          if (res.ok) {
            const data: StoredPersonaSurveyResponse[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setResponsesMap((prev) => ({ ...prev, [questionId]: data }));
              setPendingResponseIds((prev) => { const next = new Set(prev); next.delete(questionId); return next; });
              clearInterval(poller);
              return;
            }
          }
        } catch (err) {
          console.error(`Polling error for question ${questionId}:`, err);
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(poller);
          setPendingResponseIds((prev) => { const next = new Set(prev); next.delete(questionId); return next; });
        }
      }, 3000);

      pollers.push(poller);
    }

    return () => { pollers.forEach(clearInterval); };
  }, [pendingResponseIds]);

  // Typing effect animation
  useEffect(() => {
    if (typingPersonaIds.length === 0) return;

    const timer = setTimeout(() => {
      setTypingPersonaIds((prev) => prev.slice(1));
    }, 150 + Math.random() * 100);

    return () => clearTimeout(timer);
  }, [typingPersonaIds]);

  // Handle adding custom question — backend derives product context from stored product brief
  const addQuestion = async () => {
    const qText = draft.trim();
    if (!qText || isAddingQuestion) return;

    setIsAddingQuestion(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/survey/questions/add-custom`, {
        method: "POST",
        headers,
        // Only send question text — backend uses the stored product brief for full context
        body: JSON.stringify({ question_text: qText }),
      });

      if (!res.ok) {
        throw new Error("Failed to add custom question.");
      }

      const payload: { question: StoredQuestion; responses: StoredPersonaSurveyResponse[] } = await res.json();

      setQuestions((prev) => [...prev, payload.question]);
      setResponsesMap((prev) => ({ ...prev, [payload.question.id]: payload.responses }));
      setDraft("");
      setActiveQuestionIndex(questions.length);

      const targetPersonaIds = dbPersonas.length > 0 ? dbPersonas.map((p) => p.id) : seedPersonas.map((p) => p.id);
      setTypingPersonaIds(targetPersonaIds);
    } catch (err) {
      console.error("Error adding question:", err);
    } finally {
      setIsAddingQuestion(false);
    }
  };

  // Compute sentiment statistics for active question
  const sentimentStats = useMemo(() => {
    if (!activeQuestion || !responsesMap[activeQuestion.id] || responsesMap[activeQuestion.id].length === 0) {
      return { pos: 65, neu: 20, neg: 15, posCount: 0, neuCount: 0, negCount: 0 };
    }
    const currentResponses = responsesMap[activeQuestion.id];
    const total = currentResponses.length;
    const posCount = currentResponses.filter((r) => r.sentiment?.toLowerCase() === "positive").length;
    const negCount = currentResponses.filter((r) => r.sentiment?.toLowerCase() === "negative").length;
    const neuCount = Math.max(0, total - posCount - negCount);

    const pos = Math.round((posCount / total) * 100);
    const neg = Math.round((negCount / total) * 100);
    const neu = Math.max(0, 100 - pos - neg);
    return { pos, neu, neg, posCount, neuCount, negCount };
  }, [activeQuestion, responsesMap]);

  // Display personas list (prefer database personas, fallback to seed personas)
  const displayPersonas = dbPersonas.length > 0 ? dbPersonas : seedPersonas;

  // Active responses array mapping for displayed personas
  const activeResponsesList = useMemo(() => {
    if (!activeQuestion || !responsesMap[activeQuestion.id]) return [];
    return responsesMap[activeQuestion.id];
  }, [activeQuestion, responsesMap]);

  // Filtered personas based on selected sentiment tab
  const filteredPersonas = useMemo(() => {
    if (sentimentFilter === "all") return displayPersonas;

    return displayPersonas.filter((p, idx) => {
      const respObj = activeResponsesList.find((r) => r.persona_id === p.id) || activeResponsesList[idx % activeResponsesList.length];
      const s = respObj?.sentiment?.toLowerCase() || "neutral";
      return s === sentimentFilter;
    });
  }, [displayPersonas, activeResponsesList, sentimentFilter]);

  const copyExportData = () => {
    if (!activeQuestion) return;
    const currentResponses = responsesMap[activeQuestion.id] || [];
    let summary = `QUESTION: ${activeQuestion.question_text}\n\n`;
    displayPersonas.forEach((p, idx) => {
      const resp = currentResponses.find((r) => r.persona_id === p.id) || currentResponses[idx % currentResponses.length];
      summary += `• ${p.name} (${p.occupation}): "${resp?.response_text || 'N/A'}"\n`;
    });
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 text-[#f2f2f3]">
      {/* Outer borders framing the survey canvas */}
      <div className="border-l border-r border-white/[0.03] px-4 sm:px-10 md:px-14">
        
        {/* Header Banner */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/[0.04] pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Survey Mode <span className="font-editor font-light text-[#7f8084]"></span>
            </h1>
            <p className="mt-2 text-xs text-[#7f8084] max-w-xl">
              Audit synthetic user responses across target cohorts in real-time. Deployed prompts generate persistent database insights.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={copyExportData}
              className="premium-card inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold font-mono tracking-wider text-white border border-white/10 hover:border-white/20 transition bg-black/40"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "COPIED TO CLIPBOARD" : "COPY BRIEF"}
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          
          {/* Left Column: Questions Directory & Prompt Deployer */}
          <aside className="space-y-5 text-left">
            
            {/* Questions Directory */}
            <div className="premium-card rounded-xl border border-white/[0.06] bg-black/60 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#7f8084] font-mono flex items-center gap-1.5">
                  <MessageSquareQuote className="h-3.5 w-3.5 text-[#7f8084]" /> QUESTION QUEUE
                </span>
                <span className="text-[9px] font-mono font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {questions.length} ACTIVE
                </span>
              </div>

              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                {questions.map((q, idx) => {
                  const isActive = activeQuestionIndex === idx;
                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={`group relative flex flex-col justify-between rounded-lg p-3 text-left transition cursor-pointer border ${
                        isActive
                          ? "bg-white/[0.06] border-white/20 text-white shadow-lg"
                          : "bg-white/[0.01] border-white/[0.02] text-[#7f8084] hover:border-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase text-white/50 bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                          Q-0{idx + 1}
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

                      <p className="mt-2 text-xs font-medium leading-snug line-clamp-2">
                        {q.question_text}
                      </p>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="text-[10px] text-[#7f8084] font-mono text-center py-8 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" /> LOADING QUEUE...
                  </div>
                )}

                {!isLoading && questions.length === 0 && (
                  <div className="text-[10px] text-[#7f8084] font-mono text-center py-8 border border-dashed border-white/5 rounded-lg">
                    NO QUESTIONS YET.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add Question Panel */}
            <div className="premium-card rounded-xl border border-white/[0.06] bg-black/60 p-4 shadow-2xl backdrop-blur-2xl">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#7f8084] block mb-2.5 font-mono flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-white" /> DEPLOY CUSTOM QUESTION
              </span>
              <p className="text-[10px] text-[#7f8084] mb-3 leading-relaxed">
                Add a short question. The platform will run survey inference across all personas in the database.
              </p>
              
              <div className="space-y-2.5">
                <textarea
                  disabled={isAddingQuestion}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addQuestion();
                    }
                  }}
                  rows={3}
                  placeholder="e.g., What is your biggest friction point with this pricing structure?"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-white outline-none focus:border-white/30 placeholder:text-[#7f8084] font-sans resize-none transition"
                />
                
                <button
                  disabled={isAddingQuestion || !draft.trim()}
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {isAddingQuestion ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> SYNTHESIZING RESPONSES...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> DEPLOY QUESTION
                    </>
                  )}
                </button>
              </div>
            </div>

          </aside>

          {/* Right Workspace: Responses & Sentiment HUD */}
          <section className="space-y-6 text-left">
            {activeQuestion ? (
              <>
                {/* Active Question Overview Header */}
                <div className="premium-card rounded-xl border border-white/[0.06] bg-black/60 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7f8084] bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          ACTIVE QUESTION Q-0{activeQuestionIndex + 1}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-white/60 uppercase">
                          {activeQuestion.question_type.replace("_", " ")}
                        </span>
                      </div>
                      
                      {/* Short concise question text display */}
                      <h2 className="text-lg sm:text-xl font-extrabold text-white mt-2 flex items-start gap-2.5 leading-snug">
                        <HelpCircle className="h-5 w-5 text-white/60 shrink-0 mt-0.5" />
                        <span>{activeQuestion.question_text}</span>
                      </h2>
                    </div>

                    {/* Executive Sentiment Distribution HUD */}
                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-lg shrink-0 font-mono text-[9px]">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>POSITIVE {sentimentStats.pos}%</span>
                      </div>
                      <div className="h-3 w-px bg-white/10" />
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>NEUTRAL {sentimentStats.neu}%</span>
                      </div>
                      <div className="h-3 w-px bg-white/10" />
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        <span>CRITICAL {sentimentStats.neg}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar & Filter Tabs */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                    {/* Sentiment Distribution Bar */}
                    <div className="w-full sm:w-1/2 flex h-1.5 rounded-full overflow-hidden bg-white/5 p-0.5 gap-0.5">
                      <div style={{ width: `${sentimentStats.pos}%` }} className="bg-emerald-400/80 rounded-l" />
                      <div style={{ width: `${sentimentStats.neu}%` }} className="bg-amber-400/60" />
                      <div style={{ width: `${sentimentStats.neg}%` }} className="bg-rose-400/80 rounded-r" />
                    </div>

                    {/* Sentiment Filter Tabs */}
                    <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
                      <span className="text-[#7f8084] mr-1 flex items-center gap-1">
                        <Filter className="h-3 w-3" /> FILTER:
                      </span>
                      {[
                        { id: "all", label: "ALL" },
                        { id: "positive", label: "POSITIVE" },
                        { id: "neutral", label: "NEUTRAL" },
                        { id: "negative", label: "CRITICAL" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSentimentFilter(tab.id as any)}
                          className={`px-2.5 py-1 rounded transition ${
                            sentimentFilter === tab.id
                              ? "bg-white text-black font-bold"
                              : "text-[#7f8084] hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid of Persona Responses — Polished Layout */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredPersonas.map((p, idx) => {
                    const isTyping = typingPersonaIds.includes(p.id);
                    const respObj = activeResponsesList.find((r) => r.persona_id === p.id) || activeResponsesList[idx % activeResponsesList.length];
                    const responseText = respObj?.response_text;
                    const sentimentVal = respObj?.sentiment?.toLowerCase() || "neutral";
                    const isPending = activeQuestion && pendingResponseIds.has(activeQuestion.id) && !responseText;

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.02 }}
                        className="premium-card rounded-xl border border-white/[0.06] bg-black/60 p-4.5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl group"
                      >
                        {/* Persona Info & Sentiment Tag Header — Only Name and Age */}
                        <div className="flex items-center justify-between gap-3 border-b border-white/[0.04] pb-2.5 mb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-7 w-7 shrink-0">
                              <PremiumAvatar name={p.name} className="h-7 w-7" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                              <p className="text-[9px] text-[#7f8084] font-mono truncate">
                                Age {p.age}
                              </p>
                            </div>
                          </div>

                          {/* Sentiment Tag Badge */}
                          <span
                            className={`text-[8px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border shrink-0 ${
                              sentimentVal === "positive"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : sentimentVal === "negative"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {responseText ? (sentimentVal === "negative" ? "critical" : sentimentVal) : "pending"}
                          </span>
                        </div>

                        {/* Response Text Body */}
                        <div className="flex-1 my-1.5">
                          <AnimatePresence mode="wait">
                            {isTyping || isPending ? (
                              <motion.div
                                key="typing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-2 py-2"
                              >
                                <div className="flex gap-2 items-center text-[10px] text-[#7f8084] font-mono tracking-wider mb-2">
                                  <Loader2 className="h-3 w-3 animate-spin text-white/40" />
                                  <span>SYNTHESIZING...</span>
                                </div>
                                <div className="h-2 rounded bg-white/[0.04] animate-pulse w-full" />
                                <div className="h-2 rounded bg-white/[0.03] animate-pulse w-4/5" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-2"
                              >
                                <p className="text-xs text-[#e4e4e7] leading-relaxed relative pl-3 border-l-2 border-white/15 break-words font-sans">
                                  "{responseText || "No response recorded."}"
                                </p>

                                {responseText && responseText.length > 250 && (
                                  <button
                                    onClick={() =>
                                      setExpandedResponse({
                                        personaName: p.name,
                                        text: responseText,
                                        sentiment: sentimentVal
                                      })
                                    }
                                    className="text-[9px] font-mono text-white/50 hover:text-white flex items-center gap-1 mt-1 transition"
                                  >
                                    <Maximize2 className="h-3 w-3" /> READ FULL STATEMENT
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Footer Meta */}
                        <div className="border-t border-white/[0.03] pt-2 mt-2 flex items-center justify-between text-[8px] font-mono text-[#7f8084]">
                          <span>COHORT RESPONSE</span>
                          <span className="text-white/40 font-bold">SYNTHSCOPE</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="premium-card rounded-xl border border-white/[0.06] bg-black/60 p-16 text-center shadow-2xl backdrop-blur-2xl">
                <span className="text-[10px] font-mono text-[#7f8084] tracking-widest block mb-3 uppercase">
                  NO ACTIVE SURVEY SPECIFICATION
                </span>
                <p className="text-xs text-[#7f8084]">
                  Deploy your prompt parameter in the left sidebar to generate responses across all personas.
                </p>
              </div>
            )}
          </section>

        </div>

      </div>

      {/* Expanded Modal for Long Responses */}
      <AnimatePresence>
        {expandedResponse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-xl rounded-xl border border-white/10 bg-zinc-950 p-6 shadow-2xl text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{expandedResponse.personaName}</h3>
                  <span className="text-[8px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white">
                    {expandedResponse.sentiment}
                  </span>
                </div>
                <button
                  onClick={() => setExpandedResponse(null)}
                  className="text-[#7f8084] hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <p className="text-xs text-[#e4e4e7] leading-relaxed italic border-l-2 border-white/20 pl-3">
                  "{expandedResponse.text}"
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setExpandedResponse(null)}
                  className="rounded bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200 transition"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
