import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CareersNotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">404</h1>
      <p className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
        Careers page not found
      </p>
      <p className="text-zinc-400 max-w-sm mb-8">
        This company&apos;s careers page doesn&apos;t exist, hasn&apos;t been published yet, or the URL is incorrect.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Go to CareerOS
      </Link>
    </div>
  );
}
