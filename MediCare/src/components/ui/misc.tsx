import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Avatar({
  name,
  size = 40,
  tone = "primary",
}: {
  name: string;
  size?: number;
  tone?: "primary" | "neutral";
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold shrink-0",
        tone === "primary"
          ? "bg-primary-soft text-primary"
          : "bg-muted text-muted-foreground",
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border-2 border-current border-t-transparent animate-spin",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bl-skeleton rounded-lg", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-14",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-critical-soft text-critical">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4.5 21 19H3l9-14.5Z" /><path d="M12 10v4M12 16.5v.01" />
        </svg>
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center rounded-xl border border-input bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />;
}

export function Stat({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "critical" | "urgent" | "success" | "primary";
  icon?: ReactNode;
}) {
  const toneText =
    tone === "critical"
      ? "text-critical"
      : tone === "urgent"
        ? "text-urgent"
        : tone === "success"
          ? "text-success"
          : tone === "primary"
            ? "text-primary"
            : "text-foreground";
  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={cn("mt-2 font-num text-2xl font-bold tracking-tight", toneText)}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
