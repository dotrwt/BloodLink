import { useState } from "react";
import { Link, useRouter } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Logo } from "../components/layout/AppShell";
import { cn } from "../lib/cn";
import type { Role } from "../lib/types";
import {
  ArrowRight,
  Building,
  Check,
  DropletFill,
  User,
} from "../lib/icons";

const ROLES: {
  role: Role;
  to: string;
  icon: typeof User;
  title: string;
  desc: string;
  points: string[];
  tag?: string;
}[] = [
  {
    role: "requester",
    to: "/app/requester",
    icon: User,
    title: "Requester",
    desc: "Raise an emergency request for a patient and track it to confirmation.",
    points: ["Create requests in seconds", "See ranked donors & banks", "Live status tracking"],
    tag: "Most common",
  },
  {
    role: "donor",
    to: "/app/donor",
    icon: DropletFill,
    title: "Donor",
    desc: "Respond to nearby emergencies and help patients when it counts.",
    points: ["One-tap emergency response", "Manage availability", "Track your eligibility"],
  },
  {
    role: "bank",
    to: "/app/bank",
    icon: Building,
    title: "Blood Bank",
    desc: "Manage inventory, triage requests and reserve units — for verified institutions.",
    points: ["Expiry-aware inventory", "Incoming request queue", "Reserve & fulfil"],
  },
];

export default function RoleSelect() {
  const { navigate } = useRouter();
  const [selected, setSelected] = useState<Role>("requester");
  const active = ROLES.find((r) => r.role === selected)!;

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center max-w-lg mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">How will you use BloodLink?</h1>
            <p className="mt-2.5 text-muted-foreground">
              Choose a role to continue. You can switch or add roles later.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {ROLES.map((r) => {
              const isSel = selected === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setSelected(r.role)}
                  className={cn(
                    "text-left rounded-2xl border-2 p-5 transition-all relative",
                    isSel
                      ? "border-primary bg-primary-soft/40 shadow-[0_2px_20px_-10px_rgba(13,107,99,0.5)]"
                      : "border-border bg-card hover:border-[#d6d1c8]",
                  )}
                >
                  {r.tag && (
                    <span className="absolute top-4 right-4">
                      <Badge tone="primary">{r.tag}</Badge>
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl transition-colors",
                      isSel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <r.icon size={24} />
                  </span>
                  <h3 className="mt-4 font-semibold text-lg flex items-center gap-2">
                    {r.title}
                    {isSel && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check size={13} />
                      </span>
                    )}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                  <ul className="mt-4 space-y-1.5">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check size={14} className="text-primary shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              onClick={() => navigate(active.to)}
            >
              Continue as {active.title}
            </Button>
            <span className="text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
