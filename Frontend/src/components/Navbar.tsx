import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const mainLinks = [
  { to: "/", label: "Overview" },
  { to: "/create-experiment", label: "Simulator" },
  { to: "/personas", label: "Virtual Panel" },
  { to: "/survey", label: "Surveys" },
  { to: "/interview", label: "Consoles" },
  { to: "/dashboard", label: "Analytics" },
  { to: "/report", label: "Executive Reports" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full border-b border-white/[0.03] bg-transparent py-4 px-6 md:px-12"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Typography */}
        <Link to="/" className="font-display text-xs font-bold text-white flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="tracking-[0.2em]">SYNTHSCOPE</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-8 lg:flex">
          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[12px] font-medium tracking-tight text-[#7f8084] transition-colors hover:text-[#f2f2f3]"
              activeProps={{ className: "text-[#f2f2f3]" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right CTA */}
        <div className="hidden items-center gap-6 lg:flex">
          <button className="text-[11px] font-semibold text-[#7f8084] hover:text-[#f2f2f3] transition-colors">
            Log In
          </button>
          <Link
            to="/create-experiment"
            className="rounded-md bg-white px-3.5 py-1.5 text-[11px] font-bold text-black hover:bg-zinc-200 transition-colors"
          >
            Launch Platform
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex h-8 w-8 items-center justify-center text-[#f2f2f3]"
          onClick={() => setOpen((v) => !v)}
          aria-label="menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="mt-4 border-t border-white/[0.04] pt-4 lg:hidden"
        >
          <div className="flex flex-col gap-3">
            {mainLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-[12px] text-[#7f8084] transition hover:text-[#f2f2f3]"
                activeProps={{ className: "text-[#f2f2f3]" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.04]">
              <button className="text-left text-[12px] text-[#7f8084] hover:text-[#f2f2f3] py-1">
                Log In
              </button>
              <Link
                to="/create-experiment"
                onClick={() => setOpen(false)}
                className="rounded-md bg-white py-2 text-center text-[11px] font-bold text-black"
              >
                Launch Platform
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
