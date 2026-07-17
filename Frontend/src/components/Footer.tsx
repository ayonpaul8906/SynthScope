import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-32 w-full border-t border-white/[0.03] bg-transparent py-12 px-6 md:px-12 text-[#7f8084]">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-xs font-bold tracking-widest text-white">
              SYNTHSCOPE
            </div>
            <p className="mt-3 text-[11px] leading-relaxed">
              AI-native synthetic user panels. Engineered for design validation and feedback
              simulation.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">
              Simulations
            </h4>
            <ul className="mt-3.5 space-y-2 text-[11px]">
              <li>
                <Link to="/personas" className="hover:text-white transition-colors">
                  Virtual Panel
                </Link>
              </li>
              <li>
                <Link to="/survey" className="hover:text-white transition-colors">
                  Survey Lab
                </Link>
              </li>
              <li>
                <Link to="/interview" className="hover:text-white transition-colors">
                  Interview Console
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">System</h4>
            <ul className="mt-3.5 space-y-2 text-[11px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security Audit
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">Access</h4>
            <ul className="mt-3.5 space-y-2 text-[11px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Console Login
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Status Feed
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.03] pt-6 text-[10px] sm:flex-row">
          <p>© {new Date().getFullYear()} SynthScope Inc. All rights reserved.</p>
          <p className="tracking-tight">High-fidelity user research validation.</p>
        </div>
      </div>
    </footer>
  );
}
