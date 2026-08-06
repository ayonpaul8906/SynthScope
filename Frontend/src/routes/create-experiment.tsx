import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, type FormEvent } from "react";
import {
  Loader2, Sparkles, Settings, Minus, Plus, Terminal, ChevronRight,
} from "lucide-react";
import { industries, goals } from "@/data/personas";
import { getAuthHeaders } from "@/lib/api-headers";

type GeneratedPersona = {
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
  hobbies: string[];
  daily_routine: string[];
  technology_usage: string;
  digital_literacy: string;
  fitness_level: string;
  goals: string[];
  motivations: string[];
  pain_points: string[];
  frustrations: string[];
  preferred_features: string[];
  budget: string;
  purchase_channel: string;
  purchase_frequency: string;
  brand_loyalty: string;
  devices: string[];
  operating_system: string;
  ecosystem: string;
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
  accessibility_needs?: string | null;
  environmental_awareness?: string | null;
  quote: string;
  sentiment_archetype?: string;
};

const GENERATED_PERSONAS_STORAGE_KEY = "synthscope.generated-personas";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const PERSONA_GENERATION_ENDPOINT = `${API_BASE_URL.replace(/\/$/, "")}/personas/generate`;

export const Route = createFileRoute("/create-experiment")({
  component: CreateExperiment,
  head: () => ({
    meta: [
      { title: "Simulator — SynthScope" },
      { name: "description", content: "Configure your synthetic user research experiment." },
    ],
  }),
});

const logLines = [
  "Initializing SynthCore engine...",
  "Running product analysis agent...",
  "Loading demographic weights for target audience...",
  "Structuring behavioral psychographics...",
  "Assigning sentiment archetypes across cohort...",
  "Running diversity audit on persona batch...",
  "Finalizing virtual panel — personas ready!",
];

function CreateExperiment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeLogIndex, setActiveLogIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    productName: "",
    description: "",
    audience: "",
    industry: "Technology & SaaS",
    goal: "Validate product-market fit",
    count: 6,
  });

  const setCount = (n: number) => {
    setForm((f) => ({ ...f, count: Math.max(3, Math.min(20, n)) }));
  };

  const startSynthesis = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const authHeaders = await getAuthHeaders();
    const requestPromise = fetch(PERSONA_GENERATION_ENDPOINT, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        product_name: form.productName,
        industry: form.industry,
        product_description: form.description,
        target_audience: form.audience,
        research_objective: form.goal,
        persona_count: form.count,
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail ?? "Failed to generate personas.");
      }
      return (await response.json()) as GeneratedPersona[];
    });

    // Run log animation while request is in flight
    for (let i = 0; i < logLines.length; i++) {
      setActiveLogIndex(i);
      await new Promise((r) => setTimeout(r, 700));
    }

    try {
      const generatedPersonas = await requestPromise;
      sessionStorage.setItem(GENERATED_PERSONAS_STORAGE_KEY, JSON.stringify(generatedPersonas));
      window.location.href = "/personas";
    } catch (requestError) {
      setLoading(false);
      setActiveLogIndex(-1);
      setError(requestError instanceof Error ? requestError.message : "Failed to generate personas.");
    }
  };

  return (
    <div className="min-h-screen text-[#ededf0]" style={{ paddingBottom: "4rem" }}>
      {/* Page Header */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-8 sm:px-10">
        <div className="flex items-end justify-between border-b border-white/[0.05] pb-7">
          <div>
            <h1
              className="text-5xl font-bold uppercase text-white leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Simulator
              <span className="text-[#6b6b78] ml-3 font-light text-4xl">Deploy panel.</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main landscape workspace */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <form onSubmit={startSynthesis}>
          {/* ── LANDSCAPE GRID: 3 columns ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ═══ COL 1: Product Identity ═══ */}
            <div className="premium-card rounded-xl border border-white/[0.05] p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-white/[0.04] pb-4">
                <Settings className="h-3.5 w-3.5 text-[#6b6b78]" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#6b6b78]">
                  Product Identity
                </span>
              </div>

              <Field label="Product Name">
                <input
                  required
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Nimbus Notes"
                />
              </Field>

              <Field label="Industry">
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className={inputCls}
                >
                  {industries.map((i) => (
                    <option key={i} className="bg-[#0c0c0f]">
                      {i}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Product Description">
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputCls}
                  placeholder="What does your product do? Who is it for? What problem does it solve?"
                />
              </Field>
            </div>

            {/* ═══ COL 2: Research Config ═══ */}
            <div className="premium-card rounded-xl border border-white/[0.05] p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-white/[0.04] pb-4">
                <Sparkles className="h-3.5 w-3.5 text-[#6b6b78]" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#6b6b78]">
                  Research Configuration
                </span>
              </div>

              <Field label="Target Audience">
                <textarea
                  required
                  rows={3}
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className={inputCls}
                  placeholder="E.g., Product Managers and designers at Indian B2B SaaS startups, age 24-38..."
                />
              </Field>

              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#6b6b78] block mb-3">
                  Research Objective
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {goals.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, goal: g })}
                      className={`rounded-md border text-[9px] font-mono tracking-wide py-2 px-2.5 text-left transition leading-tight ${
                        form.goal === g
                          ? "border-white/20 bg-white/[0.06] text-white"
                          : "border-white/[0.05] bg-white/[0.01] text-[#6b6b78] hover:border-white/10 hover:text-white"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ COL 3: Panel Capacity + Deploy ═══ */}
            <div className="flex flex-col gap-5">
              {/* Persona count card */}
              <div className="premium-card rounded-xl border border-white/[0.05] p-6">
                <div className="flex items-center gap-2 border-b border-white/[0.04] pb-4 mb-5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#6b6b78]">
                    Panel Capacity
                  </span>
                </div>

                {/* Big number display */}
                <div className="text-center py-4">
                  <div
                    className="text-[80px] font-bold leading-none text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {form.count}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#6b6b78] mt-1">
                    Personas
                  </div>
                </div>

                {/* +/- controls */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setCount(form.count - 1)}
                    disabled={form.count <= 3}
                    className="h-10 w-10 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-white hover:bg-white/[0.07] transition disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  {/* Direct number input */}
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={form.count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-16 text-center bg-transparent border border-white/[0.07] rounded-lg py-2 text-sm font-mono text-white outline-none focus:border-white/20"
                  />

                  <button
                    type="button"
                    onClick={() => setCount(form.count + 1)}
                    disabled={form.count >= 20}
                    className="h-10 w-10 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-white hover:bg-white/[0.07] transition disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Range labels */}
                <div className="flex justify-between text-[8px] font-mono text-[#6b6b78] mt-4 px-1">
                  <span>3 MIN</span>
                  <span>20 MAX</span>
                </div>

                {/* Visual dots indicator */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-5">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        i < form.count ? "bg-white/60" : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Summary + Deploy */}
              <div className="premium-card rounded-xl border border-white/[0.05] p-6 flex-1">
                <div className="space-y-3 mb-6">
                  <SummaryRow label="Product" value={form.productName || "—"} />
                  <SummaryRow label="Industry" value={form.industry} />
                  <SummaryRow label="Objective" value={form.goal} />
                  <SummaryRow label="Panel size" value={`${form.count} agents`} />
                  <SummaryRow label="Est. time" value={`~${Math.round(form.count * 0.8)}s`} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center text-[11px] py-3.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Deploy Panel
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </>
                  )}
                </button>

                {error && (
                  <p className="mt-3 text-[10px] font-mono text-rose-400 leading-relaxed">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Synthesis process log */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 rounded-xl border border-white/[0.05] bg-black/60 p-5 font-mono text-[9px] backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3 mb-4 text-[9px] uppercase font-bold text-white">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  SynthCore Process Log
                  <span className="ml-auto text-[#6b6b78]">{form.count} AGENTS QUEUED</span>
                </div>
                <div className="space-y-2 leading-relaxed">
                  {logLines.slice(0, activeLogIndex + 1).map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`h-1 w-1 rounded-full shrink-0 ${idx === activeLogIndex ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                      <span className={idx === activeLogIndex ? "text-white" : "text-[#6b6b78]"}>
                        {line.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-mono uppercase tracking-wider text-[#6b6b78]">{label}</span>
      <span className="text-[9px] font-mono text-white truncate max-w-[55%] text-right">{value}</span>
    </div>
  );
}

const inputCls =
  "mt-2 w-full rounded-lg border border-white/[0.05] bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none transition placeholder:text-[#6b6b78] focus:border-white/20 focus:bg-white/[0.03] font-mono";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#6b6b78]">{label}</span>
      {children}
    </label>
  );
}
