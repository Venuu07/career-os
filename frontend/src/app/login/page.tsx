"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Eye, EyeOff, LayoutTemplate } from "lucide-react";
import { CareerOSLogo } from "@/components/ui/CareerOSLogo";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoFilling, setIsDemoFilling] = useState(false);

  const DEMO_EMAIL = "demo@careeros.dev";
  const DEMO_PASSWORD = "Demo@12345";

  const handleDemoLogin = async () => {
    setIsDemoFilling(true);
    setError("");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    // Small delay so state updates flush before submit
    await new Promise((r) => setTimeout(r, 80));
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", DEMO_EMAIL);
      formData.append("password", DEMO_PASSWORD);
      await apiFetch("/api/auth/login", { method: "POST", body: formData });
      await refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to sign in.";
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsDemoFilling(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      await apiFetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      await refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to sign in.";
      if (
        (err as { status?: number }).status === 401 ||
        msg.toLowerCase().includes("incorrect")
      ) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* ── Left panel — form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center mb-12 group transition-opacity hover:opacity-80">
            <CareerOSLogo size="md" />
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ color: "var(--ink)" }}
            >
              Welcome back
            </h1>
            <p style={{ color: "var(--muted-ink)" }} className="text-base">
              Sign in to manage your careers page.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "var(--orange-bg)",
                color: "#b94a00",
                border: "1.5px solid #ffd4b2",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                  style={{ color: "var(--ink)" }}
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ color: "var(--muted-ink)" }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="btn-pill btn-pill-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo account entry */}
          <div
            className="mt-8 rounded-2xl p-5"
            style={{
              background: "var(--surface)",
              border: "1.5px solid var(--border)",
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: "var(--green)" }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" style={{ color: "var(--ink)" }}>
                  <path d="M8 2a3 3 0 100 6 3 3 0 000-6zM3 13a5 5 0 0110 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  Explore the demo workspace
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-ink)" }}>
                  Try CareerOS with Stark Industries sample data
                </p>
              </div>
            </div>
            <button
              id="demo-login-btn"
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading || isDemoFilling}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--green)",
                color: "var(--ink)",
              }}
            >
              {isDemoFilling || isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Use demo account"
              )}
            </button>
          </div>

          {/* Footer link */}
          <p
            className="mt-5 text-center text-sm"
            style={{ color: "var(--muted-ink)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold underline-offset-2 hover:underline transition-all"
              style={{ color: "var(--ink)" }}
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel — brand sidebar ───────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] p-12 rounded-l-3xl"
        style={{ backgroundColor: "var(--ink)" }}
      >
        {/* Top — descriptor */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-10 text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.1)", color: "var(--cream)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--green)" }}
            />
            Recruiter-first Careers Builder
          </div>

          <h2
            className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight mb-4"
            style={{ color: "var(--canvas)" }}
          >
            Your employer brand,
            <br />
            <span style={{ color: "var(--green)" }}>beautifully published.</span>
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "rgba(240,239,232,0.65)" }}>
            Build a premium careers page, showcase your culture, and connect with the
            right candidates — without touching code.
          </p>
        </div>

        {/* Middle — feature list */}
        <ul className="space-y-4 my-10">
          {[
            "Visual section builder with live preview",
            "Hero, About, Culture, Benefits & Jobs",
            "One-click publish to a branded public URL",
            "Candidate search, filters & job detail",
          ].map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span
                className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--green)" }}
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="h-3 w-3"
                  style={{ color: "var(--ink)" }}
                >
                  <path
                    d="M2 6l2.5 2.5L10 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm leading-relaxed" style={{ color: "rgba(240,239,232,0.8)" }}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Bottom — mock preview card */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--green)" }}
            >
              <LayoutTemplate className="h-3.5 w-3.5" style={{ color: "var(--ink)" }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--canvas)" }}>
              careers.yourcompany.com
            </span>
          </div>
          <div className="space-y-1.5">
            <div
              className="h-2.5 rounded-full w-3/4"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <div
              className="h-2.5 rounded-full w-1/2"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <div
              className="h-7 rounded-full flex-1"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            />
            <div
              className="h-7 rounded-full w-20"
              style={{ backgroundColor: "var(--green)", opacity: 0.8 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
