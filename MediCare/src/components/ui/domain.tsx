import { cn } from "../../lib/cn";
import type { BloodGroup, RequestStatus, Urgency } from "../../lib/types";
import { AlertTriangle, Check, Clock, Zap } from "../../lib/icons";

/* ---------- Urgency (color + icon + label, never color alone) ---------- */

const URGENCY_META: Record<
  Urgency,
  { label: string; tone: string; Icon: typeof Zap }
> = {
  critical: { label: "Critical", tone: "bg-critical-soft text-critical", Icon: Zap },
  urgent: { label: "Urgent", tone: "bg-urgent-soft text-urgent", Icon: AlertTriangle },
  routine: { label: "Routine", tone: "bg-muted text-muted-foreground", Icon: Clock },
};

export function UrgencyBadge({
  urgency,
  size = "md",
  pulse,
}: {
  urgency: Urgency;
  size?: "sm" | "md";
  pulse?: boolean;
}) {
  const m = URGENCY_META[urgency];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide leading-none",
        m.tone,
        size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
      )}
    >
      {urgency === "critical" && pulse && (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full rounded-full bg-critical animate-bl-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-critical" />
        </span>
      )}
      <m.Icon size={size === "sm" ? 12 : 14} />
      {m.label}
    </span>
  );
}

/* ---------- Blood group chip (mono, high visual weight) ---------- */

export function BloodGroupChip({
  group,
  size = "md",
  tone = "critical",
}: {
  group: BloodGroup;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "critical" | "neutral" | "outline";
}) {
  const sizes = {
    sm: "h-6 min-w-6 px-1.5 text-xs rounded-md",
    md: "h-8 min-w-8 px-2 text-sm rounded-lg",
    lg: "h-11 min-w-11 px-2.5 text-lg rounded-xl",
    xl: "h-16 min-w-16 px-3 text-3xl rounded-2xl",
  };
  const tones = {
    critical: "bg-critical text-critical-foreground",
    neutral: "bg-muted text-foreground",
    outline: "border border-critical/30 bg-critical-soft text-critical",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-num font-bold tracking-tight",
        sizes[size],
        tones[tone],
      )}
    >
      {group}
    </span>
  );
}

/* ---------- Status stepper (step-based tracking) ---------- */

const FLOW: { key: RequestStatus; label: string }[] = [
  { key: "matching", label: "Matching" },
  { key: "contacted", label: "Contacted" },
  { key: "accepted", label: "Accepted" },
  { key: "en_route", label: "En route" },
  { key: "confirmed", label: "Confirmed" },
];

const ORDER: RequestStatus[] = ["matching", "contacted", "accepted", "en_route", "confirmed", "fulfilled"];

function statusIndex(s: RequestStatus): number {
  if (s === "fulfilled") return FLOW.length; // all done
  return Math.max(0, ORDER.indexOf(s));
}

export function StatusStepper({
  status,
  orientation = "horizontal",
  onStepClick,
}: {
  status: RequestStatus;
  orientation?: "horizontal" | "vertical";
  onStepClick?: (step: RequestStatus) => void;
}) {
  const current = statusIndex(status);

  if (orientation === "vertical") {
    return (
      <ol className="relative">
        {FLOW.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step.key}
              onClick={() => onStepClick?.(step.key)}
              className={cn("flex gap-3 pb-6 last:pb-0", onStepClick && "cursor-pointer select-none group")}
            >
              <div className="relative flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold shrink-0 z-10 transition-transform group-hover:scale-105",
                    done && "bg-success border-success text-success-foreground",
                    active && "bg-primary border-primary text-primary-foreground shadow-xs",
                    !done && !active && "bg-card border-border text-muted-foreground group-hover:border-primary/50",
                  )}
                >
                  {done ? <Check size={14} /> : i + 1}
                </span>
                {i < FLOW.length - 1 && (
                  <span
                    className={cn(
                      "w-0.5 flex-1 mt-1 -mb-6",
                      i < current ? "bg-success" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className="pt-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {step.label}
                </p>
                {active && (
                  <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary animate-bl-pulse" />
                    In progress
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className="flex items-center">
      {FLOW.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div
            key={step.key}
            onClick={() => onStepClick?.(step.key)}
            className={cn(
              "flex items-center flex-1 last:flex-none",
              onStepClick && "cursor-pointer select-none group"
            )}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-transform group-hover:scale-110",
                  done && "bg-success border-success text-success-foreground",
                  active && "bg-primary border-primary text-primary-foreground shadow-xs",
                  !done && !active && "bg-card border-border text-muted-foreground group-hover:border-primary/50",
                )}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap transition-colors",
                  active ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < FLOW.length - 1 && (
              <span
                className={cn(
                  "h-0.5 flex-1 mx-1.5 -mt-5 rounded-full transition-colors",
                  i < current ? "bg-success" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
