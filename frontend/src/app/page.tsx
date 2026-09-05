"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ArrowRight, LayoutTemplate, Zap, Globe, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(() => {
        setIsAuthenticated(true);
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, []);

  const features = [
    {
      icon: <LayoutTemplate className="h-5 w-5" />,
      title: "Visual Page Builder",
      description:
        "Drag-and-drop section editor with live preview. Build a careers page that reflects your brand — no code required.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Instant Publishing",
      description:
        "Draft, preview, and publish in seconds. Candidates always see your latest content.",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Branded Public Page",
      description:
        "A dedicated careers URL for your company. SEO-optimised and mobile-first out of the box.",
    },
  ];

  const bullets = [
    "Hero, About, Culture, Benefits, Video & Custom sections",
    "Real-time preview across desktop, tablet & mobile",
    "Live job listings synced from your workspace",
    "Candidate-facing search, filter and job detail views",
  ];

  return (
    <div className="min-h-screen bg-[oklch(0.99_0_0)] dark:bg-black flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[oklch(0.6_0.15_250)] flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">C</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight">
              CareerOS
            </span>
          </div>
          <nav className="flex items-center gap-3">
            {authChecked && isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
              >
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                >
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.15_250)]" />
            ATS Careers Page Builder — built for recruiters
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.05] max-w-4xl mx-auto">
            Your careers page.{" "}
            <span className="text-[oklch(0.6_0.15_250)]">Built in minutes.</span>
          </h1>

          <p className="mt-7 text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            CareerOS gives recruiters a premium careers page builder. Design your employer brand, showcase open roles, and share a polished public page — all without touching code.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {authChecked && isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors shadow-sm"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors shadow-sm"
                >
                  Create your page <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Proof points */}
          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-[oklch(0.6_0.15_250)] shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* Preview strip */}
        <section className="border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="ml-3 flex-1 h-5 rounded bg-zinc-200 dark:bg-zinc-800 max-w-xs text-xs flex items-center px-2 text-zinc-400">
                  acme.careeros.app/careers
                </div>
              </div>
              {/* Mock careers page preview */}
              <div className="px-12 py-16 text-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-950">
                <div className="inline-block text-xs font-medium tracking-widest text-[oklch(0.6_0.15_250)] uppercase mb-4">
                  Acme Inc.
                </div>
                <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">
                  Come build with us.
                </div>
                <div className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                  We&apos;re a team of builders obsessed with craft. Join us to solve hard problems and ship great products.
                </div>
                <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium">
                  View 12 open roles →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Everything a recruiter needs
            </h2>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Built around the actual recruiter workflow — not a general-purpose website builder.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="group">
                <div className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-500 mb-4 group-hover:border-[oklch(0.6_0.15_250)] group-hover:text-[oklch(0.6_0.15_250)] transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 py-16">
          <div className="max-w-xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
              Ready to launch your careers page?
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-7 text-sm">
              Create an account and have a branded, published page in under 10 minutes.
            </p>
            {authChecked && isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
              >
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-zinc-400">
          <span>© 2026 CareerOS</span>
          <span>ATS Careers Page Builder</span>
        </div>
      </footer>
    </div>
  );
}
