import {
  Zap,
  Globe,
  Shield,
  Users,
  Heart,
  Sparkles,
  Building2,
  Lightbulb,
  Rocket,
  Leaf,
  Star,
  CheckCircle2,
  Briefcase,
  Clock,
  DollarSign,
  GraduationCap,
  Laptop,
  Map,
  MessageCircle,
  Smile,
  Target,
  Layers,
  Code2,
  FlaskConical,
  Handshake,
  type LucideProps,
} from "lucide-react";
import type { FC } from "react";

// ─── Icon map ────────────────────────────────────────────────────────────────
// Maps string keys (as stored in section data) to Lucide icon components.
// Keys are normalised to lowercase before lookup.

const ICON_MAP: Record<string, FC<LucideProps>> = {
  // Seeded demo keys
  zap:         Zap,
  globe:       Globe,
  shield:      Shield,
  users:       Users,
  // Common additions
  heart:       Heart,
  sparkles:    Sparkles,
  building:    Building2,
  building2:   Building2,
  lightbulb:   Lightbulb,
  rocket:      Rocket,
  leaf:        Leaf,
  star:        Star,
  check:       CheckCircle2,
  briefcase:   Briefcase,
  clock:       Clock,
  dollar:      DollarSign,
  money:       DollarSign,
  graduation:  GraduationCap,
  laptop:      Laptop,
  remote:      Laptop,
  map:         Map,
  chat:        MessageCircle,
  message:     MessageCircle,
  smile:       Smile,
  target:      Target,
  layers:      Layers,
  code:        Code2,
  flask:       FlaskConical,
  science:     FlaskConical,
  handshake:   Handshake,
  trust:       Handshake,
  // Semantic aliases
  health:      Heart,
  medical:     Heart,
  equity:      DollarSign,
  pto:         Clock,
  vacation:    Clock,
  learning:    GraduationCap,
  education:   GraduationCap,
  growth:      Rocket,
  impact:      Globe,
  community:   Users,
  team:        Users,
  innovation:  Zap,
  tech:        Zap,
  diversity:   Smile,
  inclusion:   Handshake,
};

/** Fallback for unrecognised non-emoji strings — never renders raw text */
const FALLBACK_ICON: FC<LucideProps> = Star;

// ─── Emoji detection ──────────────────────────────────────────────────────────
// If the stored value is a single grapheme cluster that is an emoji (e.g. "🚀"),
// render it as text — this preserves intentional emoji usage in existing data.

function isEmoji(s: string): boolean {
  return /^\p{Emoji}[\uFE0F\u20E3]?$/u.test(s.trim());
}

// ─── SectionIcon ─────────────────────────────────────────────────────────────

export interface SectionIconProps {
  /** Raw icon field from section data — may be a Lucide key, emoji, or unknown string */
  icon: string;
  /** Pixel size applied to width and height. Default: 18 */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a section icon safely.
 *
 * Resolution order:
 *   1. Known Lucide key  → Lucide SVG icon
 *   2. Single emoji      → emoji <span> (preserves existing emoji data)
 *   3. Anything else     → fallback Star icon (never renders raw text)
 */
export function SectionIcon({ icon, size = 18, className, style }: SectionIconProps) {
  const key = icon?.trim().toLowerCase();

  const LucideIcon = key ? ICON_MAP[key] : undefined;
  if (LucideIcon) {
    return (
      <LucideIcon
        width={size}
        height={size}
        strokeWidth={1.75}
        className={className}
        style={style}
        aria-hidden="true"
      />
    );
  }

  if (icon && isEmoji(icon)) {
    return (
      <span aria-hidden="true" style={{ fontSize: size - 2, lineHeight: 1 }}>
        {icon}
      </span>
    );
  }

  return (
    <FALLBACK_ICON
      width={size}
      height={size}
      strokeWidth={1.75}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Full list of supported icon key strings */
export const SUPPORTED_ICON_KEYS = Object.keys(ICON_MAP);
