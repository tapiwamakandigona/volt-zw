import { cn } from "@/lib/utils";

/** VoltZW lightning mark — the brand logo, used in the app shell, auth, splash. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="voltGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22c55e" />
          <stop offset="1" stopColor="#0d7838" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="12" fill="url(#voltGrad)" />
      <path
        d="M27.6 5.5 14.6 26.9h7.9l-2.2 15.6 13-21.4h-8.2z"
        fill="#fff"
      />
    </svg>
  );
}

/** Full wordmark: lightning mark + "VoltZW". */
export function Logo({
  className,
  markClassName,
  textClassName,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className={cn("h-9 w-9", markClassName)} />
      <span className={cn("text-lg font-extrabold tracking-tight", textClassName)}>
        Volt<span className="text-primary-400">ZW</span>
      </span>
    </span>
  );
}
