import { Link } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Logo } from "../components/layout/AppShell";
import { CompatibilityExplainer } from "../components/domain/CompatibilityExplainer";
import { BloodGroupChip, UrgencyBadge } from "../components/ui/domain";
import {
  Activity,
  ArrowRight,
  Building,
  Clock,
  DropletFill,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
  Zap,
} from "../lib/icons";

function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#roles" className="hover:text-foreground">For</a>
          <a href="#trust" className="hover:text-foreground">Trust &amp; safety</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/app/dashboard">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Landing() {
  return (
    <div className="min-h-full">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(60% 55% at 78% 12%, rgba(13,107,99,0.14), transparent 70%), radial-gradient(45% 45% at 8% 90%, rgba(210,31,60,0.08), transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-14 lg:pt-24 lg:pb-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <Badge tone="critical" icon={<Zap size={13} />}>
              Live emergency matching
            </Badge>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.02] tracking-tight">
              When minutes matter,<br />
              find the right blood <span className="text-primary">fast</span>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
              BloodLink connects patients and hospitals with compatible donors and
              verified blood banks nearby — ranked by compatibility, distance and
              eligibility, tracked in real time until the unit is confirmed.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/app/dashboard">
                <Button size="lg" rightIcon={<ArrowRight size={18} />} fullWidth>
                  Get started — it's free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" fullWidth>
                  I have an account
                </Button>
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                ["18k+", "donors on call"],
                ["240+", "verified banks"],
                ["9 min", "median response"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-num text-2xl font-bold text-foreground">{v}</dt>
                  <dd className="text-xs text-muted-foreground mt-0.5">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero card — live request preview */}
          <div className="relative">
            <div className="rounded-3xl border border-border bg-card shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] p-5">
              <div className="flex items-center justify-between">
                <UrgencyBadge urgency="critical" pulse />
                <span className="text-xs text-muted-foreground font-num">12 min ago</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <BloodGroupChip group="A+" size="xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Needed at</p>
                  <p className="font-semibold leading-tight">Manipal Hospital</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={13} /> 3.2 km · <Clock size={13} /> by 6:00 PM
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-num text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">units</p>
                </div>
              </div>
              <div className="mt-4 h-px bg-border" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Top matches
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { icon: <Building size={16} />, name: "Sanjeevani Blood Centre", meta: "12 units · 18 min", score: 94 },
                  { icon: <User size={16} />, name: "Rohit Menon · O-", meta: "2.1 km · 14 min", score: 91 },
                ].map((m) => (
                  <div key={m.name} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary shrink-0">
                      {m.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground font-num">{m.meta}</p>
                    </div>
                    <span className="ml-auto font-num text-lg font-bold text-primary">{m.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-border bg-card shadow-lg px-4 py-3 hidden sm:flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-success-soft text-success">
                <ShieldCheck size={17} />
              </span>
              <div className="text-xs">
                <p className="font-semibold">Donor accepted</p>
                <p className="text-muted-foreground">En route · ETA 14 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">From request to confirmed unit</h2>
          <p className="mt-3 text-muted-foreground">
            One transparent flow, whether the blood comes from a donor or a bank.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[
            { n: "01", icon: <DropletFill size={20} />, t: "Create request", d: "Blood group, units, hospital, urgency and required-by time." },
            { n: "02", icon: <Users size={20} />, t: "See ranked matches", d: "Compatible donors and banks scored by distance, availability and eligibility." },
            { n: "03", icon: <Phone size={20} />, t: "Select & contact", d: "Reach out, reserve units and confirm a source in one tap." },
            { n: "04", icon: <Activity size={20} />, t: "Track in real time", d: "Contacted → accepted → en route → confirmed, until fulfilled." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  {s.icon}
                </span>
                <span className="font-num text-sm font-bold text-muted-foreground/60">{s.n}</span>
              </div>
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">One platform, three roles</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Built for everyone in the chain</h2>
              <div className="mt-8 space-y-4">
                {[
                  { icon: <DropletFill size={18} />, t: "Donors", d: "Respond to nearby emergencies, manage availability and track eligibility." },
                  { icon: <User size={18} />, t: "Requesters", d: "Raise a request for a patient and follow it to confirmation." },
                  { icon: <Building size={18} />, t: "Blood banks", d: "Manage inventory, triage incoming requests and reserve units." },
                ].map((r) => (
                  <div key={r.t} className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      {r.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold">{r.t}</h3>
                      <p className="text-sm text-muted-foreground">{r.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/select-role" className="inline-block mt-8">
                <Button rightIcon={<ArrowRight size={17} />}>Choose your role</Button>
              </Link>
            </div>
            <div className="rounded-3xl border border-border bg-background p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Compatibility, explained
              </p>
              <CompatibilityExplainer recipient="A+" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <ShieldCheck size={22} />, t: "Verified institutions", d: "Every blood bank is document-verified before it can fulfil requests." },
            { icon: <Activity size={22} />, t: "Eligibility-aware", d: "Donors are only surfaced when medically eligible to donate." },
            { icon: <Users size={22} />, t: "Privacy-first", d: "Patient details are shared only with the source you choose to contact." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success">
                {c.icon}
              </span>
              <h3 className="mt-4 font-semibold text-lg">{c.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-primary text-primary-foreground p-8 lg:p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready when the call comes</h2>
          <p className="mt-3 text-primary-foreground/85 max-w-xl mx-auto">
            Join thousands keeping emergency blood within reach. Sign up in under two minutes.
          </p>
          <Link to="/app/dashboard" className="inline-block mt-7">
            <Button size="lg" variant="secondary" rightIcon={<ArrowRight size={18} />}>
              Get started
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo className="text-sm" />
          <p className="text-sm text-muted-foreground">
            © 2026 BloodLink. For emergencies, always call your local services.
          </p>
        </div>
      </footer>
    </div>
  );
}
