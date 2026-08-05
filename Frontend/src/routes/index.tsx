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
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-10 pb-16 px-6 lg:px-12 overflow-hidden">
        {/* Subtle background glow */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(ellipse 70% 60% at 50% 20%, rgba(214, 160, 126, 0.04) 0%, transparent 60%)' 
          }} 
        />

        <div className="max-w-[1400px] w-full mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-8 items-center relative z-10">
          
          {/* LEFT: Copy & CTAs */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left max-w-2xl"
          >
            {/* Headline */}
            <motion.h1 
              variants={fadeUp} 
              className="text-[clamp(3.5rem,5.5vw,5.5rem)] leading-[1.05] font-semibold tracking-tight mb-8"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Understand users.<br />
              Build what <span style={{ fontFamily: "var(--font-display)", color: "#d6a07e" }} className="italic font-normal">matters.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={fadeUp} 
              className="text-lg text-[#a1a1aa] leading-relaxed mb-10 max-w-lg font-light"
            >
              Generate realistic synthetic personas, run surveys or interviews, and uncover powerful insights without the cost and complexity of real user research.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5 mb-16">
              <Link to="/signup" className="btn-primary group">
                Start Your First Experiment
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="btn-outline group">
                See How It Works
                <Play className="w-4 h-4 ml-1 fill-current opacity-80" />
              </button>
            </motion.div>

            {/* Feature small icons row */}
            <motion.div variants={fadeUp} className="flex items-start gap-8 border-t border-white/5 pt-8 w-full">
              {[
                { icon: Users, label: "AI Generated\nPersonas" },
                { icon: MessageSquare, label: "Survey & Interview\nSimulation" },
                { icon: BarChart3, label: "Insight Extraction\nAgent" },
                { icon: FileDown, label: "Export Reports\nas PDF" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/10 group-hover:border-[#d6a07e]/40 transition-colors">
                    <item.icon className="w-4 h-4 text-[#a1a1aa] group-hover:text-[#d6a07e] transition-colors" />
                  </div>
                  <span className="text-[10px] text-[#a1a1aa] uppercase tracking-wider leading-relaxed whitespace-pre-line group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: 3D Composition */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:flex justify-center items-center h-[700px] w-full perspective-[1200px]"
          >
            <div 
              className="relative w-full h-full transform-style-3d"
              style={{ transform: "rotateY(-12deg) rotateX(6deg) scale(0.95)" }}
            >

              {/* Card: Persona Overview */}
              <div 
                className="absolute left-[10%] w-[420px] rounded-2xl border border-white/10 bg-[#0f0f12]/80 backdrop-blur-xl p-8 shadow-2xl"
                style={{ transform: "translateZ(40px) translateX(40px)" }}
              >
                <h3 className="text-sm font-medium text-white/90 mb-6">Persona Overview</h3>
                
                {/* Profile Header */}
                <div className="flex items-start gap-5 mb-8">
                  <div className="w-16 h-20 rounded-lg overflow-hidden border border-white/10 bg-black/50 shrink-0">
                    <img src="/persona_avatar.jpg" alt="Persona" className="w-full h-full object-cover grayscale opacity-90" />
                  </div>
                  <div className="pt-1">
                    <h4 className="text-lg font-semibold text-white mb-1">Arjun, 27</h4>
                    <p className="text-xs text-[#a1a1aa] font-mono mb-1">Software Engineer</p>
                    <p className="text-xs text-[#a1a1aa] font-mono mb-3">Bengaluru, India</p>
                    <div className="flex gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/70">Tech-savvy</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/70">Early Adopter</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bars Section */}
                <div className="space-y-6">
                  {/* Motivations */}
                  <div>
                    <h5 className="text-[10px] uppercase tracking-widest text-[#a1a1aa] mb-3">Motivations</h5>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Career Growth', val: 85 },
                        { label: 'Efficiency', val: 92 },
                        { label: 'Financial Freedom', val: 75 }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-xs text-white/80 w-32">{item.label}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.val}%` }}
                              transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                              className="h-full bg-[#d6a07e] rounded-full" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <h5 className="text-[10px] uppercase tracking-widest text-[#a1a1aa] mb-3">Pain Points</h5>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Complex Onboarding', val: 80 },
                        { label: 'Limited Customization', val: 65 },
                        { label: 'High Costs', val: 90 }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-xs text-white/80 w-32">{item.label}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.val}%` }}
                              transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                              className="h-full bg-white/40 rounded-full" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Features */}
                  <div>
                    <h5 className="text-[10px] uppercase tracking-widest text-[#a1a1aa] mb-3">Preferred Features</h5>
                    <div className="flex gap-2">
                       <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/80 bg-white/5">Automation</span>
                       <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/80 bg-white/5">Analytics</span>
                       <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/80 bg-white/5">Integrations</span>
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Decorative ground/shadow */}
              <div 
                className="absolute bottom-[-10%] left-[-10%] right-[-10%] h-[200px] bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none"
                style={{ transform: "translateZ(-100px)" }}
              />
            </div>
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
