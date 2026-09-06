"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ArrowRight,
  LayoutTemplate,
  Zap,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { CareerOSLogo } from "@/components/ui/CareerOSLogo";

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
      accent: "var(--green)",
      accentBg: "var(--green-bg)",
      title: "Visual Page Builder",
      description:
        "Section editor with live preview. Build a careers page that reflects your brand — no code required.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      accent: "var(--orange)",
      accentBg: "var(--orange-bg)",
      title: "Instant Publishing",
      description:
        "Draft, preview, and publish in seconds. Candidates always see your latest content.",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      accent: "var(--lavender)",
      accentBg: "var(--lavender-bg)",
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
    <div className="min-h-screen bg-canvas flex flex-col relative" style={{ fontFamily: "var(--font-onest, Onest, system-ui, sans-serif)" }}>
      {/* ── Background Grid ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 80%)",
      }} />
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: "rgba(243,243,241,0.85)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center">
            <CareerOSLogo size="sm" />
          </div>

          <nav className="flex items-center gap-2">
            {authChecked && isAuthenticated ? (
              <Link href="/dashboard" className="btn-pill btn-pill-primary text-sm">
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 transition-colors hover:opacity-70"
                  style={{ color: "var(--muted-ink)" }}
                >
                  Log in
                </Link>
                <Link href="/register" className="btn-pill btn-pill-primary text-sm">
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{
              border: "1.5px solid var(--border-subtle)",
              background: "var(--surface)",
              color: "var(--muted-ink)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--green)" }}
            />
            ATS Careers Page Builder — built for recruiters
          </div>

          <h1
            className="text-display mb-6"
            style={{ color: "var(--ink)" }}
          >
            Your careers page.{" "}
            <span style={{ color: "var(--green)" }}>Built in minutes.</span>
          </h1>

          <p
            className="text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: "var(--muted-ink)" }}
          >
            CareerOS gives recruiters a premium careers page builder. Design your
            employer brand, showcase open roles, and share a polished public page —
            all without touching code.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {authChecked && isAuthenticated ? (
              <Link href="/dashboard" className="btn-pill btn-pill-primary px-7 py-3">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-pill btn-pill-primary px-7 py-3">
                  Create your page <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="btn-pill btn-pill-ghost px-7 py-3"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Proof bullets */}
          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 relative z-10">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--muted-ink)" }}
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  style={{ color: "var(--green)" }}
                />
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Product Loop ──────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-h3 font-bold" style={{ color: "var(--ink)" }}>From recruiter config to candidate experience</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--muted-ink)" }}>CareerOS turns configuration into a polished candidate journey.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 relative">
            {/* Recruiter Box */}
            <div className="flex-1 p-8 rounded-[2rem] flex flex-col justify-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)" }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-8" style={{ color: "var(--muted-ink)" }}>The Recruiter</div>
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4"><span className="w-7 h-7 rounded-full bg-[var(--green-bg)] text-[var(--green)] flex items-center justify-center text-xs font-bold">1</span> <span className="font-semibold text-lg" style={{ color: "var(--ink)" }}>Build & Brand</span></div>
                <div className="flex items-center gap-4"><span className="w-7 h-7 rounded-full bg-[var(--orange-bg)] text-[var(--orange)] flex items-center justify-center text-xs font-bold">2</span> <span className="font-semibold text-lg" style={{ color: "var(--ink)" }}>Curate Roles</span></div>
                <div className="flex items-center gap-4"><span className="w-7 h-7 rounded-full bg-[var(--lavender-bg)] text-[var(--lavender)] flex items-center justify-center text-xs font-bold">3</span> <span className="font-semibold text-lg" style={{ color: "var(--ink)" }}>Preview & Publish</span></div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="hidden md:flex flex-col items-center justify-center px-2">
              <ArrowRight className="h-6 w-6" style={{ color: "var(--border-subtle)" }} strokeWidth={3} />
            </div>
            <div className="flex md:hidden flex-col items-center justify-center py-2">
              <div className="h-6 w-0.5" style={{ backgroundColor: "var(--border-subtle)" }}></div>
            </div>
            
            {/* Candidate Box */}
            <div className="flex-1 p-8 rounded-[2rem] flex flex-col justify-center" style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>The Candidate</div>
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4"><span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>1</span> <span className="font-semibold text-lg">Explore Company</span></div>
                <div className="flex items-center gap-4"><span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>2</span> <span className="font-semibold text-lg">Discover Roles</span></div>
                <div className="flex items-center gap-4"><span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>3</span> <span className="font-semibold text-lg">Apply Seamlessly</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Preview strip ─────────────────────────────────────────────── */}
        <section
          className="py-16"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--surface)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6">
            {/* Section label */}
            <p className="text-eyebrow text-center mb-8">Live preview</p>

            <div
              className="rounded-3xl overflow-hidden shadow-xl"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-1.5 px-4 py-3"
                style={{
                  background: "var(--canvas)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <span className="h-3 w-3 rounded-full bg-green-400/70" />
                <div
                  className="ml-3 flex-1 h-5 rounded-full text-xs flex items-center px-3 max-w-xs"
                  style={{
                    background: "var(--border-subtle)",
                    color: "var(--muted-ink)",
                  }}
                >
                  acme.careeros.app/careers
                </div>
              </div>

              {/* Mock page */}
              <div
                className="px-12 py-20 text-center"
                style={{
                  background: "linear-gradient(135deg, var(--canvas) 0%, var(--surface) 100%)",
                }}
              >
                <div
                  className="text-eyebrow mb-4"
                  style={{ color: "var(--green)" }}
                >
                  Acme Inc.
                </div>
                <div
                  className="text-4xl font-bold tracking-tight mb-4"
                  style={{ color: "var(--ink)" }}
                >
                  Come build with us.
                </div>
                <div
                  className="max-w-md mx-auto mb-8 text-sm leading-relaxed"
                  style={{ color: "var(--muted-ink)" }}
                >
                  We&apos;re a team of builders obsessed with craft. Join us to solve
                  hard problems and ship great products.
                </div>
                <div
                  className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
                >
                  View 12 open roles →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-eyebrow mb-3">Features</p>
            <h2 className="text-h2" style={{ color: "var(--ink)" }}>
              Everything a recruiter needs
            </h2>
            <p
              className="mt-4 text-base max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--muted-ink)" }}
            >
              Built around the actual recruiter workflow — not a
              general-purpose website builder.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-7 group transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center mb-5 transition-all"
                  style={{
                    backgroundColor: f.accentBg,
                    color: f.accent,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-semibold mb-2 text-base"
                  style={{ color: "var(--ink)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--muted-ink)" }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA strip ────────────────────────────────────────────────── */}
        <section
          className="py-20"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--ink)",
          }}
        >
          <div className="max-w-xl mx-auto px-6 text-center">
            <h2
              className="text-3xl font-bold tracking-tight mb-4"
              style={{ color: "var(--canvas)" }}
            >
              Ready to launch your careers page?
            </h2>
            <p
              className="mb-8 text-base leading-relaxed"
              style={{ color: "rgba(240,239,232,0.65)" }}
            >
              Create an account and have a branded, published page in under 10
              minutes.
            </p>
            {authChecked && isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-pill px-8 py-3 text-sm font-semibold"
                style={{ backgroundColor: "var(--green)", color: "var(--ink)" }}
              >
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="btn-pill px-8 py-3 text-sm font-semibold"
                style={{ backgroundColor: "var(--green)", color: "var(--ink)" }}
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--surface)" }}
        className="py-6"
      >
        <div
          className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs"
          style={{ color: "var(--muted-ink)" }}
        >
          <span>© 2026 CareerOS</span>
          <span>ATS Careers Page Builder</span>
        </div>
      </footer>
    </div>
  );
}
