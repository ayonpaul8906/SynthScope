import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { 
  ArrowRight, Users, MessageSquare, Zap, FileText, 
  Play, Star, BarChart3, LineChart, Target, FileDown, 
  ShieldCheck, ArrowRightCircle, Sparkles, Building2, Briefcase, Network
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [{ title: "SynthScope — Premium Synthetic User Research" }],
  }),
});

// Animations
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const fadeRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function Landing() {
  return (
    <div className="text-[#f4f4f5] overflow-hidden selection:bg-[#d6a07e] selection:text-[#09090b]">
      {/* ═══════════════════════════════════════
          HERO SECTION (PREMIUM SHOWCASE)
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[95vh] flex items-center justify-center px-6 lg:px-14 overflow-hidden bg-[#0a0a0c]">
        {/* Ambient warm lighting behind the scene */}
        <div 
          className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] pointer-events-none rounded-full blur-3xl opacity-60" 
          style={{ 
            background: 'radial-gradient(circle at center, rgba(222, 184, 150, 0.18) 0%, rgba(160, 100, 60, 0.06) 45%, transparent 75%)' 
          }} 
        />

        {/* Architectural vertical fluted lines on far right (matching reference background) */}
        <div className="absolute top-0 right-0 w-96 h-full hidden xl:flex justify-end opacity-20 pointer-events-none select-none overflow-hidden">
          {Array.from({ length: 16 }).map((_, idx) => (
            <div 
              key={idx} 
              className="w-6 h-full border-l border-white/[0.04] bg-gradient-to-r from-white/[0.01] to-transparent" 
            />
          ))}
        </div>

        <div className="max-w-[1440px] w-full mx-auto grid lg:grid-cols-[1fr_1.25fr] gap-12 lg:gap-8 items-center relative z-10">
          
          {/* LEFT: Editorial Copy & Controls */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left max-w-[620px] z-10 pt-2"
          >
            {/* Editorial Headline */}
            <motion.h1 
              variants={fadeUp} 
              className="text-[clamp(3.2rem,5.3vw,5.6rem)] leading-[1.04] font-normal text-[#fafafc] mb-7 tracking-normal"
              style={{ fontFamily: "var(--font-display)", fontStyle: "normal" }}
            >
              Understand users.<br />
              Build what <span style={{ fontFamily: "var(--font-display)" }} className="text-[#deb896] italic font-normal drop-shadow-[0_0_30px_rgba(222,184,150,0.35)]">matters.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={fadeUp} 
              className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed mb-6 max-w-lg font-light tracking-normal"
            >
              Generate realistic synthetic personas, run surveys or interviews, and uncover powerful insights without the cost and complexity of real user research.
            </motion.p>

            {/* Premium CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5 mb-16 w-full">
              <Link 
                to="/signup" 
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#e5c4a5] via-[#deb896] to-[#cc986b] text-[#140e09] font-bold text-[15px] shadow-[0_4px_30px_rgba(222,184,150,0.28)] hover:shadow-[0_8px_45px_rgba(222,184,150,0.45)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 font-semibold tracking-wide text-[#120d08]">Start Your First Experiment</span>
                <span className="relative z-10 text-[#120d08] group-hover:translate-x-1.5 transition-transform duration-300 font-bold text-base">➔</span>
                <div className="absolute inset-0 bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <button className="group inline-flex items-center gap-4 px-6 py-3.5 rounded-xl border border-white/15 bg-[#141419]/85 hover:bg-[#1c1c24] text-[#e4e4e8] font-medium text-[15px] hover:border-[#deb896]/55 transition-all duration-300 shadow-lg">
                <span className="tracking-wide">See How It Works</span>
                <div className="w-7 h-7 rounded-full border border-white/20 group-hover:border-[#deb896]/70 flex items-center justify-center bg-white/[0.04] group-hover:bg-[#deb896]/20 transition-all duration-300">
                  <Play className="w-2.5 h-2.5 fill-current text-[#deb896] ml-0.5 transition-transform group-hover:scale-110" />
                </div>
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT: 3D Photocard Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, x: 25 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
            className="relative hidden lg:flex justify-center items-center w-full min-h-[740px] z-10 pl-2"
          >

            <motion.img 
              src="/design.png" 
              alt="SynthScope 3D Persona Card and Analytics Display with Rock Pedestal" 
              className="relative z-20 w-full max-w-[680px] h-auto object-contain select-none cursor-pointer"
              animate={{ 
                y: [0, -12, 0],
                rotateZ: [0, 0.5, -0.5, 0],
                filter: [
                  "drop-shadow(0 0 3px rgba(238, 205, 176, 0.9)) drop-shadow(0 0 3px rgba(222,184,150,0.6)) drop-shadow(0 35px 50px rgba(0,0,0,0.9))",
                ]
              }}
            />
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════ */}
      <section className="py-32 px-6 border-t border-white/5 bg-gradient-to-b from-[#09090b] to-[#0d0d12]">
        <div className="max-w-[1400px] mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-semibold tracking-[0.25em] text-[#a1a1aa] uppercase mb-4"
          >
            Everything you need to
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-semibold text-white mb-20 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Run research at scale
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-0 lg:divide-x divide-white/5">
            {[
              { 
                icon: Users, 
                title: "Hyper-real Personas", 
                desc: "AI generates diverse, realistic personas based on your product and audience." 
              },
              { 
                icon: MessageSquare, 
                title: "Survey & Interview Modes", 
                desc: "Run surveys or one-on-one interviews with AI personas that think and respond like real users." 
              },
              { 
                icon: Network, 
                title: "Insight Extraction Agent", 
                desc: "Automatically analyze responses to surface patterns, themes, sentiments, and actionable insights." 
              },
              { 
                icon: FileDown, 
                title: "Export & Share", 
                desc: "Export beautiful reports as PDF or share dashboards with your team and stakeholders." 
              },
              { 
                icon: ShieldCheck, 
                title: "Private & Secure", 
                desc: "Your data stays yours. Enterprise-grade security and privacy by design." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center px-6"
              >
                <feature.icon className="w-8 h-8 text-[#d6a07e] mb-6 stroke-[1.5]" />
                <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">{feature.title}</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-24">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-semibold tracking-[0.25em] text-[#d6a07e] uppercase mb-4"
            >
              How It Works
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-semibold text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              From brief to insights in 4 simple steps
            </motion.h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-[40%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />

            {[
              { num: "1", icon: FileText, title: "Define Your Study", desc: "Add your product details, target audience, and research objectives. Tell us what you want to learn." },
              { num: "2", icon: Users, title: "Generate Personas", desc: "Our AI creates diverse, realistic personas tailored to your audience and product context." },
              { num: "3", icon: MessageSquare, title: "Run Surveys or Interviews", desc: "Ask questions and get thoughtful responses from AI personas in real-time." },
              { num: "4", icon: BarChart3, title: "Extract Insights", desc: "AI analyzes all responses and delivers clear, actionable insights and recommendations." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl bg-[#0d0d12] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="mb-8 relative">
                   <step.icon className="w-10 h-10 text-white/80 stroke-[1]" />
                </div>
                
                <div className="w-8 h-8 rounded-full bg-[#d6a07e] flex items-center justify-center text-[#09090b] font-bold text-xs mb-6 shadow-[0_0_15px_rgba(214,160,126,0.3)]">
                  {step.num}
                </div>

                <h3 className="text-sm font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <button className="btn-outline group px-6 py-3">
              See How It Works
              <Play className="w-3.5 h-3.5 ml-1.5 fill-current opacity-80" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          USE CASES
      ═══════════════════════════════════════ */}
      <section className="py-32 px-6 border-t border-white/5 bg-[#09090b]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
             <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-semibold tracking-[0.25em] text-[#a1a1aa] uppercase mb-4"
            >
              Use Cases
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-semibold text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Powering research across teams
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
              { icon: Target, title: "Product Teams", desc: "Validate ideas, features, and roadmaps with confidence." },
              { icon: Users, title: "UX Researchers", desc: "Run formative research and usability studies at scale." },
              { icon: Briefcase, title: "Marketing Teams", desc: "Understand audience needs, messaging, and positioning." },
              { icon: Building2, title: "Consultants", desc: "Deliver faster research with richer insights for clients." }
            ].map((uc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-[#0c0c0f] border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center mb-6">
                  <uc.icon className="w-5 h-5 text-[#d6a07e]" />
                </div>
                <h3 className="text-base font-semibold text-white mb-3">{uc.title}</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════ */}
      <section className="py-40 px-6 border-t border-white/5 relative overflow-hidden bg-gradient-to-b from-[#09090b] to-[#050508]">
        
        {/* Abstract graphic */}
        <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-40">
           <div className="absolute inset-0 rounded-full border-[0.5px] border-white/10 scale-75" />
           <div className="absolute inset-0 rounded-full border-[0.5px] border-white/10 scale-90" />
           <div className="absolute inset-0 rounded-full border-[0.5px] border-white/5 scale-100" />
           
           {/* Center Glowing Logo block */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-3xl border border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_100px_rgba(214,160,126,0.15)]">
              <div className="w-16 h-16 border-2 border-[#d6a07e] rounded-xl transform rotate-45 flex items-center justify-center">
                 <div className="w-8 h-8 border-2 border-[#d6a07e] rounded-lg -rotate-45" />
              </div>
           </div>

           {/* Orbiting dots */}
           <div className="absolute top-[10%] left-[50%] w-2 h-2 rounded-full bg-[#d6a07e] shadow-[0_0_10px_#d6a07e]" />
           <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to rethink<br />user research?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[#a1a1aa] mb-12 font-light"
            >
              Join product teams who are building<br />better products with SynthScope.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/signup" className="btn-primary group px-8 py-4">
                Start Your First Experiment
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
