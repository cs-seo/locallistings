// components/shared/StarRating.tsx
// Accessible star rating. Pure SSR (no JS), uses CSS background-image of inline SVG.

interface Props {
  value: number; // 0..5
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" } as const;

export function StarRating({ value, size = "md" }: Props) {
  const pct = Math.max(0, Math.min(5, value)) * 20; // 0..100

  return (
    <div
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className="relative inline-block leading-none"
    >
      <div className="flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`${sizes[size]} text-slate-200`} />
        ))}
      </div>
      <div
        className="absolute inset-0 overflow-hidden flex"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`${sizes[size]} text-amber-500`} />
        ))}
      </div>
    </div>
  );
}

function Star({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M9.05 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10 15.347l-3.354 2.676c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.662 9.384c-.784-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
    </svg>
  );
}
