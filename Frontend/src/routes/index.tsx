import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Sparkles, Terminal, Activity, HelpCircle, User } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const initialPersonas = [
  {
    name: "Aarav Mehta",
    role: "Product Manager",
    location: "Bengaluru, IN",
    tech: "Jira, Notion, Linear",
    motivation: 82,
    sensitivity: 45,
    adopterSpeed: 70,
    quote:
      "If we could validate specifications in minutes instead of weeks, shipping speed doubles.",
  },
  {
    name: "Elena Rossi",
    role: "Design Director",
    location: "Milan, IT",
    tech: "Figma, Framer, Rive",
    motivation: 92,
    sensitivity: 30,
    adopterSpeed: 88,
    quote: "Concept testing and layout feedback across desaturated segments unblocks product debt.",
  },
  {
    name: "Yuki Tanaka",
    role: "Indie Developer",
    location: "Tokyo, JP",
    tech: "VS Code, Vercel, Stripe",
    motivation: 74,
    sensitivity: 80,
    adopterSpeed: 60,
    quote:
      "Agencies cost thousands. Standard automated surveys on virtual panels save startup runway.",
  },
];

// Consensus clusters for the SVG Graph Tab
const consensusNodes = [
  {
    id: 1,
    cx: 30,
    cy: 40,
    r: 6,
    val: 84,
    name: "Marcus V.",
    role: "Growth PM",
    text: "Onboarding flow is too long.",
  },
  {
    id: 2,
    cx: 50,
    cy: 25,
    r: 8,
    val: 92,
    name: "Priya S.",
    role: "Lead Designer",
    text: "Figma plugin is a game changer.",
  },
  {
    id: 3,
    cx: 70,
    cy: 60,
    r: 5,
    val: 78,
    name: "Yuki T.",
    role: "Developer",
    text: "Documentation is very clean.",
  },
  {
    id: 4,
    cx: 45,
    cy: 75,
    r: 7,
    val: 86,
    name: "Sophia L.",
    role: "SaaS Founder",
    text: "Needs standard tier pricing.",
  },
  {
    id: 5,
    cx: 20,
    cy: 65,
    r: 6,
    val: 81,
    name: "Arnaud D.",
    role: "Enterprise Arch",
    text: "Ask for SOC2 documentation.",
  },
];

function Landing() {
  const [activeTab, setActiveTab] = useState<"emulator" | "matrix" | "consensus">("emulator");
  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState(0);
  const [personaState, setPersonaState] = useState(initialPersonas);
  const [selectedNode, setSelectedNode] = useState<(typeof consensusNodes)[0] | null>(null);

  // Dynamic slider handler
  const handleSliderChange = (
    key: "motivation" | "sensitivity" | "adopterSpeed",
    value: number,
  ) => {
    setPersonaState((prev) => {
      const updated = [...prev];
      updated[selectedPersonaIdx] = {
        ...updated[selectedPersonaIdx],
        [key]: value,
      };
      return updated;
    });
  };

  const currentPersona = personaState[selectedPersonaIdx];

  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 sm:px-12 text-[#f2f2f3]">
      {/* Outer alignment borders framing the landing canvas */}
      <div className="border-l border-r border-white/[0.02] px-6 sm:px-12 md:px-16">
        {/* Editorial Header */}
        <section className="text-center py-16 sm:py-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#7f8084] flex items-center justify-center gap-2 font-mono"
          >
            <span className="h-1 w-1  rounded-full bg-white/40 animate-pulse" />
            SYNTHETIC SIMULATION PLATFORM 
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[0.92] text-white"
          >
            EMULATE PANELS.
            <br />
            <span className="font-editor font-light text-[#7f8084]">Validate specifications.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-xl mx-auto text-xs leading-relaxed text-[#7f8084] sm:text-sm font-medium"
          >
            Deploy targeted panels of high-fidelity synthetic personas to simulate user interviews,
            run automated surveys, and validate product specifications — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex justify-center gap-4 text-xs font-semibold"
          >
            <Link
              to="/create-experiment"
              className="rounded-md bg-white px-5 py-3 text-[11px] font-bold text-black hover:bg-zinc-200 transition-colors"
            >
              Configure Panel
            </Link>
            <Link
              to="/dashboard"
              className="rounded-md border border-white/5 bg-white/[0.02] px-5 py-3 text-[11px] font-bold hover:bg-white/[0.04] transition"
            >
              Live Demo
            </Link>
          </motion.div>
        </section>

        {/* Multi-Tab Workspace Playground */}
        <section className="pb-24 max-w-5xl mx-auto">
          <div className="premium-card rounded-lg overflow-hidden border border-white/[0.04] bg-black/60 shadow-2xl backdrop-blur-xl">
            {/* OS Window Frame Header */}
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 pt-3 px-4 bg-white/[0.005]">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/10" />
                <span className="h-2 w-2 rounded-full bg-white/10" />
                <span className="h-2 w-2 rounded-full bg-white/10" />
              </div>

              {/* Interactive Tabs */}
              <div className="flex gap-2">
                {[
                  { id: "emulator", label: "[01] EMULATOR" },
                  { id: "matrix", label: "[02] VECTOR MATRIX" },
                  { id: "consensus", label: "[03] CONSENSUS GRAPH" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`rounded px-3 py-1.5 text-[9px] font-bold font-mono tracking-wider transition ${
                      activeTab === t.id
                        ? "bg-white/5 text-white border border-white/5"
                        : "text-[#7f8084] hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="w-12 hidden md:block" />
            </div>

            {/* Tab Contents Viewport */}
            <div className="h-[390px] bg-black/10 text-left relative overflow-hidden select-none">
              {/* TAB 01: EMULATOR (Interactive persona profiles & parameters) */}
              {activeTab === "emulator" && (
                <div className="grid grid-cols-[200px_1fr] h-full">
                  {/* Left directory */}
                  <aside className="border-r border-white/[0.03] p-4 space-y-4">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#7f8084] block font-mono">
                      PANEL DIRECTORY
                    </span>
                    <div className="space-y-1">
                      {personaState.map((p, idx) => (
                        <button
                          key={p.name}
                          onClick={() => setSelectedPersonaIdx(idx)}
                          className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-[10px] text-left transition ${
                            selectedPersonaIdx === idx
                              ? "bg-white/5 text-white"
                              : "text-[#7f8084] hover:text-[#f2f2f3]"
                          }`}
                        >
                          <span>{p.name}</span>
                          {selectedPersonaIdx === idx && (
                            <span className="h-1 w-1 rounded-full bg-[#7f8084]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </aside>

                  {/* Right work area */}
                  <div className="grid grid-cols-[1fr_200px] h-full">
                    {/* Parameter inputs */}
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                          SPECIFICATION MODELER
                        </span>
                        <span className="text-[9px] text-[#7f8084] font-mono">YUKI-NODE-7</span>
                      </div>

                      <div className="space-y-3.5 mt-2">
                        <div>
                          <div className="flex justify-between text-[9px] text-[#7f8084] uppercase font-mono tracking-wider">
                            <span>Motivation Index</span>
                            <span className="text-white font-bold">
                              {currentPersona.motivation}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={currentPersona.motivation}
                            onChange={(e) =>
                              handleSliderChange("motivation", parseInt(e.target.value))
                            }
                            className="mt-2 w-full accent-[#7f8084] h-1 rounded-full bg-white/5 appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] text-[#7f8084] uppercase font-mono tracking-wider">
                            <span>Price Sensitivity</span>
                            <span className="text-white font-bold">
                              {currentPersona.sensitivity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={currentPersona.sensitivity}
                            onChange={(e) =>
                              handleSliderChange("sensitivity", parseInt(e.target.value))
                            }
                            className="mt-2 w-full accent-[#7f8084] h-1 rounded-full bg-white/5 appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] text-[#7f8084] uppercase font-mono tracking-wider">
                            <span>Early Adopter Speed</span>
                            <span className="text-white font-bold">
                              {currentPersona.adopterSpeed}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={currentPersona.adopterSpeed}
                            onChange={(e) =>
                              handleSliderChange("adopterSpeed", parseInt(e.target.value))
                            }
                            className="mt-2 w-full accent-[#7f8084] h-1 rounded-full bg-white/5 appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Dynamic Quote output */}
                      <div className="mt-4 p-3 bg-white/[0.01] border border-white/5 rounded-md">
                        <span className="text-[8px] font-mono font-bold text-[#7f8084] block">
                          SIMULATED QUOTE
                        </span>
                        <p className="text-[10px] italic text-[#f2f2f3] mt-1.5 leading-relaxed">
                          "{currentPersona.quote}"
                        </p>
                      </div>
                    </div>

                    {/* Meta Dossier */}
                    <aside className="border-l border-white/[0.03] p-4 bg-white/[0.005] space-y-4">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-white block border-b border-white/[0.03] pb-1.5 font-mono">
                        DOSSIER FILE
                      </span>
                      <div className="space-y-3.5 text-[10px]">
                        <div>
                          <span className="text-[8px] text-[#7f8084] block font-mono uppercase">
                            Segment
                          </span>
                          <p className="text-white mt-0.5 font-semibold">{currentPersona.role}</p>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#7f8084] block font-mono uppercase">
                            Hotspot Node
                          </span>
                          <p className="text-white mt-0.5">{currentPersona.location}</p>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#7f8084] block font-mono uppercase">
                            Stack Config
                          </span>
                          <p className="text-[#7f8084] mt-0.5 font-mono text-[9px]">
                            {currentPersona.tech}
                          </p>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              )}

              {/* TAB 02: VECTOR MATRIX (Simulated prompt vector maps & compiler logs) */}
              {activeTab === "matrix" && (
                <div className="grid grid-cols-[260px_1fr] h-full p-4 gap-4">
                  {/* Logs box */}
                  <div className="border border-white/5 bg-black/40 rounded p-3.5 font-mono text-[9px] text-[#7f8084] space-y-2 overflow-y-auto leading-normal no-scrollbar">
                    <div className="flex items-center gap-1.5 text-white font-bold mb-2">
                      <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                      <span>SYNTHESIS LOGGER</span>
                    </div>
                    <div>&gt; INITIALIZING VECTOR ENGINE... [OK]</div>
                    <div>&gt; SEEDING ATTRIBUTE GRIDS FOR {personaState.length} NODES</div>
                    <div>&gt; VECTOR MAPPING SECS INITIATED</div>
                    <div>&gt; DEPLOYING SIMULATOR THREADS [SUCCESS]</div>
                    <div>&gt; ANALYZING DIALECT STACKS...</div>
                    <div className="text-white">&gt; STABILITY INDEX: 99.8%</div>
                  </div>

                  {/* Flow Graph */}
                  <div className="border border-white/5 bg-white/[0.005] rounded p-4 flex flex-col justify-between relative">
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider font-mono">
                        VECTOR INFERENCE LINKS
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">ONLINE</span>
                    </div>

                    {/* visual node boxes with lines connecting them */}
                    <div className="flex justify-between items-center py-10 relative">
                      <div className="border border-white/10 bg-white/[0.02] p-2 rounded text-center text-[10px] z-10 w-24">
                        <span className="text-[#7f8084] block text-[8px] font-mono">
                          PROMPT INPUT
                        </span>
                        <span className="text-white font-bold font-mono">ONBOARD-QA</span>
                      </div>

                      <div className="absolute top-1/2 left-24 right-24 h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 -translate-y-1/2 z-0" />

                      <div className="space-y-2 z-10">
                        {["PM Segment", "Design Segment", "Engineering Segment"].map((seg, idx) => (
                          <div
                            key={seg}
                            className="border border-white/5 bg-black/40 px-3 py-1.5 rounded flex items-center gap-2 text-[10px] w-36"
                          >
                            <Activity className="h-3 w-3 text-emerald-400" />
                            <span className="text-white font-mono text-[9px]">{seg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 03: CONSENSUS GRAPH (Interactive SVG scatter cluster) */}
              {activeTab === "consensus" && (
                <div className="grid grid-cols-[1fr_220px] h-full p-4 gap-4">
                  {/* SVG Canvas */}
                  <div className="border border-white/5 bg-white/[0.005] rounded p-4 flex flex-col justify-between relative">
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider font-mono">
                        ALIGNMENT MATRIX
                      </span>
                      <span className="text-[9px] text-[#7f8084] font-mono">
                        CLICK NODES TO INTERACT
                      </span>
                    </div>

                    <div className="flex-1 relative grid place-items-center">
                      <svg width="100%" height="200" className="opacity-90">
                        {/* Grids lines */}
                        <line x1="10%" y1="0" x2="10%" y2="100%" stroke="rgba(255,255,255,0.02)" />
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.02)" />
                        <line x1="90%" y1="0" x2="90%" y2="100%" stroke="rgba(255,255,255,0.02)" />
                        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="rgba(255,255,255,0.02)" />
                        <line x1="0" y1="70%" x2="100%" y2="70%" stroke="rgba(255,255,255,0.02)" />

                        {consensusNodes.map((node) => (
                          <circle
                            key={node.id}
                            cx={`${node.cx}%`}
                            cy={`${node.cy}%`}
                            r={node.r}
                            fill={
                              selectedNode?.id === node.id ? "#ffffff" : "rgba(255,255,255,0.2)"
                            }
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1.5"
                            className="cursor-pointer transition-all hover:scale-125 hover:fill-white"
                            onClick={() => setSelectedNode(node)}
                          />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Detail Panel */}
                  <div className="border border-white/5 bg-white/[0.005] rounded p-4 flex flex-col justify-between">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white block border-b border-white/[0.03] pb-1.5 font-mono">
                      SELECTION HUD
                    </span>

                    <div className="flex-1 flex flex-col justify-center text-[10px] space-y-3">
                      {selectedNode ? (
                        <>
                          <div>
                            <span className="text-[8px] text-[#7f8084] block font-mono">
                              NAME / ROLE
                            </span>
                            <p className="text-white font-bold">{selectedNode.name}</p>
                            <p className="text-[#7f8084]">{selectedNode.role}</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-[#7f8084] block font-mono">
                              INFERENCE VOTE
                            </span>
                            <p className="text-white">{selectedNode.text}</p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-[#7f8084] italic py-8 text-[9px]">
                          Click a cluster node dot to parse alignment.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Corporate Social Proof */}
        <section className="py-16 border-t border-white/[0.03] text-center max-w-4xl mx-auto">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7f8084] font-mono">
            TRUSTED BY DESIGN AND PRODUCT ENGINEERING DIVISIONS
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-10 items-center justify-items-center opacity-30 tracking-widest text-[11px] font-bold font-display uppercase">
            <span>Acme Corp</span>
            <span>Linear</span>
            <span>Vercel</span>
            <span>Stripe</span>
            <span>Clerk</span>
          </div>
        </section>

        {/* Horizontal Methodology Blueprint Blocks */}
        <section className="py-24 border-t border-white/[0.03] space-y-16 max-w-4xl mx-auto">
          <div className="mb-16">
            <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#7f8084] font-mono">
              METHODOLOGY MATRIX
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-3 font-display">
              Deep user validation parameters.
            </h3>
          </div>

          {/* Pillar 01 */}
          <div className="grid md:grid-cols-[100px_1fr_300px] gap-8 items-start pb-12 border-b border-white/[0.03]">
            <div className="text-[10px] font-bold font-mono text-[#7f8084]">01 / DEFINE</div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Structured Demographics
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#7f8084]">
                Map exact targets by professional domain, workspace stack configurations, technical
                competency indices, and demographic distribution files.
              </p>
            </div>
            <div className="premium-card rounded p-3.5 text-[10px] space-y-2 select-none text-left">
              <div className="flex justify-between text-[#7f8084] text-[8px] uppercase font-mono">
                <span>Technical Index</span>
                <span className="text-white font-bold">85%</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-white" style={{ width: "85%" }} />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="rounded border border-white/5 px-1.5 py-0.5 text-[8px] text-[#7f8084] font-mono">
                  SOFTWARE
                </span>
                <span className="rounded border border-white/5 bg-white/5 px-1.5 py-0.5 text-[8px] text-white font-mono">
                  SAAS
                </span>
              </div>
            </div>
          </div>

          {/* Pillar 02 */}
          <div className="grid md:grid-cols-[100px_1fr_300px] gap-8 items-start pb-12 border-b border-white/[0.03]">
            <div className="text-[10px] font-bold font-mono text-[#7f8084]">02 / SIMULATE</div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Organic Inference
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#7f8084]">
                Simulate 1:1 chat dialogue cascades and consensus matrices. Persona agents evaluate
                parameters against custom memories to yield authentic responses.
              </p>
            </div>
            <div className="space-y-2 select-none text-left">
              <div className="rounded border border-white/5 bg-white/[0.01] p-2.5 text-[9px] text-[#7f8084] max-w-[85%] font-mono">
                Q: What is the main design barrier?
              </div>
              <div className="rounded bg-white/[0.04] border border-white/5 p-2.5 text-[9px] text-white ml-auto max-w-[85%] font-mono">
                A: Figma sync configurations are too slow.
              </div>
            </div>
          </div>

          {/* Pillar 03 */}
          <div className="grid md:grid-cols-[100px_1fr_300px] gap-8 items-start pb-12">
            <div className="text-[10px] font-bold font-mono text-[#7f8084]">03 / SYNTHESIZE</div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Consensus Groupings
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#7f8084]">
                Compile key quotes, segment sentiment clusters, and output structured validation
                reports detailing usability outcomes.
              </p>
            </div>
            <div className="premium-card rounded p-3.5 select-none text-left flex items-center justify-between">
              <div>
                <span className="text-[8px] uppercase tracking-widest text-[#7f8084] block font-mono">
                  Alignment Score
                </span>
                <span className="text-sm font-bold text-white mt-1 block font-mono">8.4 / 10</span>
              </div>
              <div className="flex gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </section>

        {/* Minimalist CTA Panel */}
        <section className="py-24 border-t border-white/[0.03] text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-display uppercase">
            VALIDATE CONVICTION. INSTANTLY.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-[#7f8084] font-medium">
            Deploy virtual research panels in under 60 seconds. Eliminate sample recruiting delay.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/create-experiment"
              className="rounded-md bg-white px-5 py-3 text-[11px] font-bold text-black hover:bg-zinc-200 transition-colors"
            >
              Configure Panel
            </Link>
            <Link
              to="/dashboard"
              className="rounded-md border border-white/5 bg-white/[0.01] px-5 py-3 text-[11px] font-bold hover:bg-white/[0.03] transition-colors"
            >
              View Live Panel
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
