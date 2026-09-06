/**
 * AmbientRings — subtle static concentric ring geometry.
 * Used behind hero content to give visual depth.
 * Non-interactive, low-opacity, CSS/SVG only.
 */
export function AmbientRings({
  className = "",
  color = "#A9CBB7",
  ringCount = 5,
  baseRadius = 200,
  gap = 80,
  opacity = 0.18,
}: {
  className?: string;
  color?: string;
  ringCount?: number;
  baseRadius?: number;
  gap?: number;
  opacity?: number;
}) {
  const size = (baseRadius + gap * (ringCount - 1)) * 2 + 80;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {Array.from({ length: ringCount }, (_, i) => {
        const r = baseRadius + i * gap;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}
