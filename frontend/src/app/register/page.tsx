"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { CareerOSLogo } from "@/components/ui/CareerOSLogo";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    company_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.company_name.trim()) {
      setError("Company name is required.");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      // After registration, log them in automatically
      const loginForm = new FormData();
      loginForm.append("username", form.email);
      loginForm.append("password", form.password);
      await apiFetch("/api/auth/login", { method: "POST", body: loginForm });
      await refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        (err as Error).message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* ── Left panel — brand sidebar ────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] p-12 rounded-r-3xl"
        style={{ backgroundColor: "var(--ink)" }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <CareerOSLogo size="md" />
        </div>

        {/* Center content */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.1)", color: "var(--cream)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--lavender)" }}
            />
            Free to get started
          </div>

          <h2
            className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight mb-4"
            style={{ color: "var(--canvas)" }}
          >
            Set up your
            <br />
            <span style={{ color: "var(--lavender)" }}>careers page</span>
            <br />
            in minutes.
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(240,239,232,0.65)" }}>
            Join recruiters building branded, candidate-first careers experiences
            without writing a single line of code.
          </p>

          {/* Steps */}
          <ol className="space-y-5">
            {[
              { num: "1", label: "Create your account & company" },
              { num: "2", label: "Build your careers page visually" },
              { num: "3", label: "Publish your branded careers URL" },
            ].map((step) => (
              <li key={step.num} className="flex items-center gap-4">
                <span
                  className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "var(--canvas)",
                  }}
                >
                  {step.num}
                </span>
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(240,239,232,0.8)" }}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom quote */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p className="text-sm leading-relaxed italic" style={{ color: "rgba(240,239,232,0.7)" }}>
            &ldquo;A polished careers page is often a candidate&rsquo;s first real impression of
            your company. Make it count.&rdquo;
          </p>
          <p className="mt-2 text-xs font-medium" style={{ color: "var(--green)" }}>
            — CareerOS
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
        <div className="max-w-sm w-full mx-auto">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden inline-flex items-center mb-10 transition-opacity hover:opacity-80">
            <CareerOSLogo size="md" />
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ color: "var(--ink)" }}
            >
              Create your account
            </h1>
            <p style={{ color: "var(--muted-ink)" }} className="text-base">
              Start building your careers page in minutes.
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder="Alex Johnson"
                value={form.full_name}
                onChange={handleChange}
                className="field-input"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Work email <span style={{ color: "var(--orange)" }}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                className="field-input"
              />
            </div>

            <div>
              <label
                htmlFor="company_name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Company name <span style={{ color: "var(--orange)" }}>*</span>
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                required
                placeholder="Acme Inc."
                value={form.company_name}
                onChange={handleChange}
                className="field-input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Password <span style={{ color: "var(--orange)" }}>*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
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
              id="register-submit"
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
                  Creating account…
                </span>
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p
            className="mt-8 text-center text-sm"
            style={{ color: "var(--muted-ink)" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold underline-offset-2 hover:underline transition-all"
              style={{ color: "var(--ink)" }}
            >
              Sign in
            </Link>
          </p>

          {/* Legal */}
          <p
            className="mt-6 text-center text-xs leading-relaxed"
            style={{ color: "var(--muted-ink)", opacity: 0.7 }}
          >
            By creating an account you agree to our terms of service and privacy
            policy.
          </p>
        </div>
      </div>
    </div>
  );
}
