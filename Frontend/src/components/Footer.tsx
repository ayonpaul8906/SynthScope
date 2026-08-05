import { Link } from "@tanstack/react-router";
import { ArrowRight, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#09090b] pt-20 pb-8 px-6 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Col (Takes 1.5 cols roughly) */}
          <div className="lg:col-span-1.5 flex flex-col items-start pr-8">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center">
                 <div className="w-4 h-4 border border-[#d6a07e] rounded transform rotate-45 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 border border-[#d6a07e] rounded-sm -rotate-45" />
                 </div>
              </div>
              <span className="text-xl font-semibold tracking-wide text-white" style={{ fontFamily: "var(--font-display)" }}>
                SynthScope
              </span>
            </Link>
            <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-[250px]">
              AI-powered synthetic user research platform for modern product teams.
            </p>
          </div>

          {/* Links Cols */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <div className="flex flex-col gap-4 text-sm text-[#a1a1aa]">
              <Link to="/" className="hover:text-white transition-colors">Features</Link>
              <Link to="/" className="hover:text-white transition-colors">How It Works</Link>
              <Link to="/" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/" className="hover:text-white transition-colors">Updates</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white">Resources</h4>
            <div className="flex flex-col gap-4 text-sm text-[#a1a1aa]">
              <Link to="/" className="hover:text-white transition-colors">Documentation</Link>
              <Link to="/" className="hover:text-white transition-colors">Guides & Tutorials</Link>
              <Link to="/" className="hover:text-white transition-colors">API Reference</Link>
              <Link to="/" className="hover:text-white transition-colors">Blog</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <div className="flex flex-col gap-4 text-sm text-[#a1a1aa]">
              <Link to="/" className="hover:text-white transition-colors">About Us</Link>
              <Link to="/" className="hover:text-white transition-colors">Careers</Link>
              <Link to="/" className="hover:text-white transition-colors">Contact</Link>
              <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>

          {/* Newsletter Col */}
          <div className="lg:col-span-1 space-y-6">
            <h4 className="text-sm font-semibold text-white">Stay in the loop</h4>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Get product updates and research insights straight to your inbox.
            </p>
            <form className="relative mt-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-[#131318] border border-white/10 rounded-lg py-3 px-4 text-sm text-white placeholder-[#a1a1aa]/50 focus:outline-none focus:border-[#d6a07e]/50 transition-colors"
              />
              <button 
                type="submit" 
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-md px-3 flex items-center justify-center transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-[#a1a1aa]">
            © {new Date().getFullYear()} SynthScope. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#a1a1aa] hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-[#a1a1aa] hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="text-[#a1a1aa] hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
