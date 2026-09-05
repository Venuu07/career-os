"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      if ((err as { status?: number }).status === 401 || msg.toLowerCase().includes("incorrect")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-8 w-8 rounded-lg bg-[oklch(0.6_0.15_250)] flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">CareerOS</span>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Welcome back</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Sign in to access your recruiter dashboard.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
            Create one
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            ← Back to CareerOS
          </Link>
        </p>
      </div>
    </div>
  );
}
