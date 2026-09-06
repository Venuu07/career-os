import Image from "next/image";

export type CareerOSLogoSize = "sm" | "md" | "lg";

interface CareerOSLogoProps {
  /** sm = nav/header (28px mark), md = auth pages (36px mark), lg = hero (48px mark) */
  size?: CareerOSLogoSize;
  /** Hide the "CareerOS" wordmark text — useful for very compact contexts */
  wordmark?: boolean;
  className?: string;
}

const SIZE_MAP: Record<CareerOSLogoSize, { chip: string; img: number; text: string }> = {
  sm: { chip: "h-7 w-7 rounded-xl",  img: 28, text: "text-sm font-bold tracking-tight" },
  md: { chip: "h-9 w-9 rounded-xl",  img: 36, text: "text-lg font-bold tracking-tight" },
  lg: { chip: "h-12 w-12 rounded-2xl", img: 48, text: "text-xl font-bold tracking-tight" },
};

/**
 * CareerOS product logo mark + wordmark.
 *
 * Uses the existing /careerOs-logo.png asset from /public.
 * The PNG has a white background, so the mark is displayed inside
 * a white rounded chip — appropriate for the frosted-glass product headers.
 *
 * DO NOT use this on candidate-facing company careers pages.
 * This is strictly the SaaS product brand mark.
 */
export function CareerOSLogo({
  size = "sm",
  wordmark = true,
  className = "",
}: CareerOSLogoProps) {
  const { chip, img, text } = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Logo mark chip — white bg keeps the PNG clean on any header */}
      <span
        className={`${chip} flex items-center justify-center shrink-0 overflow-hidden`}
        style={{
          backgroundColor: "#ffffff",
          border: "1.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <Image
          src="/careerOs-logo.png"
          alt="CareerOS"
          width={img}
          height={img}
          className="object-contain"
          priority
        />
      </span>

      {/* Wordmark */}
      {wordmark && (
        <span className={text} style={{ color: "var(--ink)" }}>
          CareerOS
        </span>
      )}
    </span>
  );
}
