import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "primary" | "critical" | "urgent" | "success" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-soft text-primary",
  critical: "bg-critical-soft text-critical",
  urgent: "bg-urgent-soft text-urgent",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
};

export function Badge({
  tone = "neutral",
  size = "md",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  size?: "sm" | "md";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold leading-none whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
