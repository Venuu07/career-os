import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="h-12 w-12 rounded-2xl bg-[oklch(0.6_0.15_250)] flex items-center justify-center mb-6">
        <span className="text-white text-xl font-bold">C</span>
      </div>
      <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">404</h1>
      <p className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Page not found</p>
      <p className="text-zinc-400 max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to CareerOS
      </Link>
    </div>
  );
}
