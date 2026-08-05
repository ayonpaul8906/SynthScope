import { Link, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/auth";

const appLinks = [
  { to: "/create-experiment", label: "Simulator" },
  { to: "/personas", label: "Virtual Panel" },
  { to: "/survey", label: "Survey Lab" },
  { to: "/interview", label: "Consoles" },
  { to: "/dashboard", label: "Analytics" },
  { to: "/report", label: "Reports" },
] as const;

const LANDING_ROUTES = ["/", "/login", "/signup"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isLandingOrAuth = LANDING_ROUTES.includes(pathname);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full border-b border-white/[0.04] py-4 px-6 md:px-12 relative z-50"
      style={{ background: "rgba(12, 12, 15, 0.8)", backdropFilter: "blur(20px)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#d6a07e] animate-pulse-dot" />
          <span className="text-sm font-semibold tracking-wider text-white">
            SynthScope
          </span>
        </Link>

        {/* ─── LANDING MODE ─── */}
        {isLandingOrAuth ? (
          <>
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {["PRODUCT", "HOW IT WORKS", "USE CASES", "DOCS"].map((item) => (
                <Link
                  key={item}
                  to="/"
                  className="text-[10px] font-bold tracking-[0.15em] text-white hover:text-[#d6a07e] transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/login"
                className="btn-nav group"
              >
                LAUNCH DASHBOARD
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile */}
            <button
              className="lg:hidden flex h-8 w-8 items-center justify-center text-[#ededf0]"
              onClick={() => setOpen((v) => !v)}
              aria-label="menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full left-0 right-0 border-t border-white/[0.04] bg-[#0c0c0f] px-6 py-5 lg:hidden"
                >
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="text-sm text-[#6b6b78] hover:text-white"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="btn-primary text-center"
                    >
                      Get Started
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* ─── APP MODE: full nav links + user avatar ─── */
          <>
            <nav className="hidden items-center gap-7 lg:flex">
              {appLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-[11px] font-medium tracking-wider uppercase text-[#6b6b78] transition-colors duration-200 hover:text-[#ededf0]"
                  activeProps={{ className: "text-[#ededf0]" }}
                  activeOptions={{ exact: true }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#ededf0] border border-white/[0.07] hover:border-white/20 transition-all"
                  >
                    <span className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold">
                      {(user.email?.[0] ?? "U").toUpperCase()}
                    </span>
                    <span className="max-w-[120px] truncate text-[10px]">
                      {user.email}
                    </span>
                    <ChevronDown className="h-3 w-3 text-[#6b6b78]" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -4 }}
                        className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-white/[0.08] bg-[#131318] py-1 shadow-2xl z-50"
                      >
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-[11px] text-[#6b6b78] hover:text-white hover:bg-white/[0.04] transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-[11px] font-semibold tracking-wider uppercase text-[#6b6b78] hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link to="/signup" className="btn-primary text-[10px] px-5 py-2">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile App Nav */}
            <button
              className="lg:hidden flex h-8 w-8 items-center justify-center text-[#ededf0]"
              onClick={() => setOpen((v) => !v)}
              aria-label="menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full left-0 right-0 border-t border-white/[0.04] bg-[#0c0c0f] px-6 py-5 lg:hidden"
                >
                  <div className="flex flex-col gap-4">
                    {appLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setOpen(false)}
                        className="text-sm text-[#6b6b78] hover:text-[#ededf0] uppercase tracking-wider"
                        activeProps={{ className: "text-[#ededf0]" }}
                      >
                        {l.label}
                      </Link>
                    ))}
                    <div className="border-t border-white/[0.04] pt-4">
                      {user ? (
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 text-sm text-[#6b6b78] hover:text-white"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          onClick={() => setOpen(false)}
                          className="btn-primary w-full text-center"
                        >
                          Log In
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.header>
  );
}
