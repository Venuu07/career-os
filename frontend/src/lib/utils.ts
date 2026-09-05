import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for composing Tailwind CSS class names.
 *
 * Combines clsx (conditional class logic) with tailwind-merge (conflict
 * resolution). This is the standard pattern required by shadcn/ui components.
 *
 * Example:
 *   cn("px-4 py-2", isActive && "bg-primary", "px-6")
 *   → "py-2 bg-primary px-6"  (px-4 is overridden by px-6 via twMerge)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
