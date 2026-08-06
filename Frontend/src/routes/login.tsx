import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Log In — SynthScope" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/create-experiment" });
    } catch (err: any) {
      setError(err.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/create-experiment`,
        },
      });
      if (error) {
        if (
          error.message?.includes("Unsupported provider") ||
          error.message?.includes("missing OAuth secret") ||
          error.message?.includes("validation_failed")
        ) {
          setError(
            "Google Sign-In isn't configured yet. Go to Supabase Dashboard → Authentication → Providers → Google and add your Client ID & Secret.",
          );
        } else {
          throw error;
        }
      }
    } catch (err: any) {
      setError(err.message ?? "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-90vh">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-end p-16">
        {/* Ambient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 20% 80%, rgba(40,40,65,0.6) 0%, transparent 70%), radial-gradient(ellipse 80% 60% at 80% 20%, rgba(20,20,40,0.5) 0%, transparent 70%), #080809",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b6b78] mb-6 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-white/40" />
              AI RESEARCH PLATFORM
            </p>
            <h2
              className="text-6xl xl:text-7xl font-bold text-white uppercase leading-[0.88] mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              SYNTHETIC
              <br />
              <span className="text-[#6b6b78]">MINDS.</span>
              <br />
              REAL
              <br />
              INSIGHTS.
            </h2>
            <p className="text-sm text-[#6b6b78] max-w-xs leading-relaxed">
              Generate high-fidelity personas, run automated surveys, and validate
              your product without recruiting a single real user.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6b6b78] mb-4">
              WELCOME BACK
            </p>
            <h1
              className="text-5xl font-bold text-white uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LOG IN
            </h1>
            <p className="mt-3 text-sm text-[#6b6b78]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white hover:underline underline-offset-2">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-md border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all text-sm font-medium text-[#ededf0] disabled:opacity-50 mb-6"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              /* Google SVG icon */
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6b6b78]">
              or
            </span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#6b6b78] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-[#ededf0] placeholder-[#6b6b78] outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#6b6b78]">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[10px] text-[#6b6b78] hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-11 text-sm text-[#ededf0] placeholder-[#6b6b78] outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b6b78] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[11px] text-red-400 font-mono py-2 px-3 rounded bg-red-500/10 border border-red-500/20">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-[10px] text-[#6b6b78] text-center leading-relaxed">
            By signing in, you agree to our{" "}
            <span className="text-white/50">Terms of Service</span> and{" "}
            <span className="text-white/50">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
