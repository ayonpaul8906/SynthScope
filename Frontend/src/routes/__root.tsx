import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AuroraBackground } from "../components/AuroraBackground";
import { AuthProvider, useAuth } from "../lib/auth";
import { Loader2 } from "lucide-react";

// Pages that are public (no auth required)
const PUBLIC_ROUTES = ["/", "/login", "/signup"];
// Pages where the full app navbar is hidden (landing / auth pages)
const LANDING_ROUTES = ["/", "/login", "/signup"];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong rounded-lg p-12 text-center max-w-md">
        <p className="text-[11px] font-mono uppercase tracking-widest text-[#6b6b78] mb-4">
          404 — PAGE NOT FOUND
        </p>
        <h1
          className="text-8xl font-bold uppercase"
          style={{
            fontFamily: "var(--font-display)",
            lineHeight: 0.88,
          }}
        >
          LOST
        </h1>
        <p className="mt-6 text-sm text-[#6b6b78]">This page drifted into the void.</p>
        <a
          href="/"
          className="btn-primary mt-8 inline-flex"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong rounded-lg p-10 text-center max-w-md">
        <p className="text-[11px] font-mono uppercase tracking-widest text-[#6b6b78] mb-3">
          Error
        </p>
        <h1
          className="text-5xl font-bold text-white uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Something broke
        </h1>
        <p className="mt-3 text-sm text-[#6b6b78]">Try again or head home.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn-ghost">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "SynthScope — AI Synthetic Personas for Product Research",
      },
      {
        name: "description",
        content:
          "Generate high-fidelity synthetic personas to validate ideas, simulate user interviews, and run automated surveys — instantly.",
      },
      { property: "og:title", content: "SynthScope — AI-Powered Synthetic User Research" },
      {
        property: "og:description",
        content: "AI-powered synthetic personas for instant product research.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Outfit:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppContent() {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isLandingOrAuth = LANDING_ROUTES.includes(pathname);
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const { user, loading } = useAuth();

  // Auth gate: redirect unauthenticated users away from app pages
  useEffect(() => {
    if (!loading && !user && !isPublic) {
      // Use window.location to avoid typed route constraints during dev
      window.location.href = "/login";
    }
  }, [user, loading, isPublic]);

  // While auth is resolving on protected pages, show minimal loader
  if (loading && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    );
  }

  // If not authenticated and not public, render nothing while redirecting
  if (!loading && !user && !isPublic) {
    return null;
  }

  return (
    <>
      <AuroraBackground />
      <div className="grid-overlay" />
      <div className="noise-texture" />
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        {/* Footer only on landing & auth pages */}
        {isLandingOrAuth && <Footer />}
      </div>
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
