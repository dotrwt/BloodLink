import { useState } from "react";
import { Link } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/layout/AppShell";
import { BloodGroupChip, UrgencyBadge } from "../components/ui/domain";
import { BLOOD_GROUPS, compatibleDonors, canDonateTo } from "../lib/blood";
import type { BloodGroup } from "../lib/types";
import { cn } from "../lib/cn";
import {
  Activity,
  ArrowRight,
  Award,
  Building,
  Check,
  ChevronDown,
  Clock,
  DropletFill,
  Heart,
  Hospital,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  User,
  Users,
  X,
  Zap,
} from "../lib/icons";
import { useLandingMetrics } from "../hooks/useLandingMetrics";

/* Mock data for interactive availability checker */
const ESTIMATOR_DATA: Record<
  BloodGroup,
  { donorsNearby: number; unitsInBanks: number; etaMin: number; banksCount: number }
> = {
  "O-": { donorsNearby: 6, unitsInBanks: 3, etaMin: 11, banksCount: 2 },
  "O+": { donorsNearby: 34, unitsInBanks: 18, etaMin: 9, banksCount: 4 },
  "A-": { donorsNearby: 9, unitsInBanks: 5, etaMin: 13, banksCount: 2 },
  "A+": { donorsNearby: 28, unitsInBanks: 14, etaMin: 10, banksCount: 4 },
  "B-": { donorsNearby: 7, unitsInBanks: 4, etaMin: 12, banksCount: 2 },
  "B+": { donorsNearby: 32, unitsInBanks: 16, etaMin: 9, banksCount: 4 },
  "AB-": { donorsNearby: 4, unitsInBanks: 2, etaMin: 15, banksCount: 1 },
  "AB+": { donorsNearby: 18, unitsInBanks: 9, etaMin: 10, banksCount: 3 },
};

function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#estimator" className="hover:text-foreground transition-colors">Availability</a>
          <a href="#compatibility" className="hover:text-foreground transition-colors">Compatibility Lab</a>
          <a href="#roles" className="hover:text-foreground transition-colors">Who it's for</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          <a
            href="tel:1800256635"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-soft/80 hover:bg-primary-soft px-3 py-1.5 rounded-full border border-primary/20 transition-colors"
          >
            <Phone size={13} />
            <span>1800-BLOOD-LINK</span>
          </a>
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/select-role">
            <Button size="sm">Get started</Button>
          </Link>
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex size-9 items-center justify-center rounded-xl text-foreground hover:bg-muted touch-target"
            aria-label="Toggle navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation sheet */}
      {open && (
        <div className="sm:hidden border-b border-border bg-card p-4 space-y-3 animate-bl-fade-up shadow-lg">
          <nav className="flex flex-col space-y-1 text-sm font-medium">
            <a
              href="#how"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              How it works
            </a>
            <a
              href="#estimator"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              Live Availability
            </a>
            <a
              href="#compatibility"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              Compatibility Lab
            </a>
            <a
              href="#roles"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              Who it's for
            </a>
            <a
              href="#faq"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors"
            >
              FAQ
            </a>
          </nav>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <a
              href="tel:1800256635"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-primary bg-primary-soft py-2.5 rounded-xl border border-primary/20"
            >
              <Phone size={14} /> 24/7 Helpline: 1800-BLOOD-LINK
            </a>
            <Link to="/select-role" onClick={() => setOpen(false)}>
              <Button fullWidth size="md">Get started free</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Landing() {
  const { metrics, loading } = useLandingMetrics();
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>("A+");
  const [compatView, setCompatView] = useState<"receive" | "give">("receive");
  const [activeCompatGroup, setActiveCompatGroup] = useState<BloodGroup>("A+");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const est = ESTIMATOR_DATA[selectedGroup];

  const steps = [
    {
      step: "01",
      title: "1-Tap Emergency Request",
      desc: "Specify blood group, required units, and hospital with instant 1-tap presets in under 30 seconds.",
      icon: <DropletFill size={22} />,
    },
    {
      step: "02",
      title: "Proximity & Compatibility Scoring",
      desc: "Our matching engine instantly ranks compatible sources based on medical ABO rules, road distance, and live bank stock.",
      icon: <Users size={22} />,
    },
    {
      step: "03",
      title: "Direct Coordinator Dispatch",
      desc: "Direct telephone clearance with verified on-call donors and accredited blood banks with zero intermediary delays.",
      icon: <Phone size={22} />,
    },
    {
      step: "04",
      title: "Cold-Chain Monitored Transit",
      desc: "Live GPS tracking and certified continuous 2–6°C cold-chain verification until the unit reaches the patient's bedside.",
      icon: <Activity size={22} />,
    },
  ];

  const faqs = [
    {
      q: "Is BloodLink completely free to use for patients and donors?",
      a: "Yes. BloodLink is an open community and emergency healthcare network. We do not charge patients, families, or voluntary donors any service fees or brokerage commissions. All emergency coordination is strictly humanitarian.",
    },
    {
      q: "How are blood banks and volunteer donors verified?",
      a: "Every participating blood bank and hospital undergoes official accreditation and license screening before going live. Volunteer donors complete health eligibility verification (hemoglobin levels, donation intervals, and medical clearance) before receiving emergency pings.",
    },
    {
      q: "What if I need blood immediately but don't know the patient's exact blood type?",
      a: "Hospital emergency rooms generally crossmatch blood in minutes. In ultra-critical trauma situations, clinicians administer O- Negative blood (the universal red cell donor). You can raise an urgent O- request while the lab confirms the group.",
    },
    {
      q: "How does BloodLink protect donor and patient privacy?",
      a: "We practice strict privacy-by-design. Contact numbers and personal identifiers are never publicly listed. They are securely shared only once an emergency match is accepted and validated by an emergency coordinator.",
    },
    {
      q: "How is the blood kept safe during emergency transport?",
      a: "All units are transported in certified thermal coolers with continuous 2–6°C temperature monitoring telemetry, ensuring compliance with clinical transfusion safety standards.",
    },
  ];

  return (
    <div className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bl-dot-grid border-b border-border/70">
        {/* Subtle radial glow accents */}
        <div
          className="pointer-events-none absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(13,107,99,0.3) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(210,31,60,0.2) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-14 items-center">
            {/* Left Column: Clear Mission, Headline, & Actions */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft border border-primary/20 text-xs font-semibold text-primary mb-6 shadow-xs">
                <span className="size-2 rounded-full bg-primary animate-bl-ping" />
                <span>Emergency Blood Coordination Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight text-foreground leading-[1.06] font-display">
                When minutes matter,<br />
                find the right blood <span className="text-primary">fast</span>.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                BloodLink connects patients and hospitals with compatible donors and verified blood banks nearby — ranked by medical compatibility, road distance, and eligibility, tracked in real time until the unit arrives at the bedside.
              </p>

              {/* Primary Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
                <Link to="/select-role" className="flex-1">
                  <Button size="lg" rightIcon={<ArrowRight size={18} />} fullWidth>
                    Request Blood Units
                  </Button>
                </Link>
                <Link to="/select-role" className="flex-1">
                  <Button size="lg" variant="outline" fullWidth>
                    Register as Donor
                  </Button>
                </Link>
              </div>

              {/* Trust Badge Bar */}
              <div className="mt-10 pt-6 border-t border-border/80 flex items-center gap-6 sm:gap-8 flex-wrap">
                <div>
                  <p className="font-num text-2xl font-extrabold text-foreground">
                    {loading || !metrics ? "142" : metrics.donorsOnCall}
                  </p>
                  <p className="text-xs text-muted-foreground">donors on call</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="font-num text-2xl font-extrabold text-foreground">
                    {loading || !metrics ? "18" : metrics.verifiedBanks}
                  </p>
                  <p className="text-xs text-muted-foreground">verified blood banks</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="font-num text-2xl font-extrabold text-primary">
                    {loading || !metrics ? "< 12m" : metrics.medianResponseTime}
                  </p>
                  <p className="text-xs text-muted-foreground">median match time</p>
                </div>
              </div>
            </div>

            {/* Right Column: Clean, Polished Live Requisition Card */}
            <div className="relative">
              <div className="rounded-3xl border border-border bg-card shadow-[0_24px_50px_-20px_rgba(13,107,99,0.16)] p-6 sm:p-7">
                {/* Header: Urgency & Post Time */}
                <div className="flex items-center justify-between">
                  <UrgencyBadge urgency="critical" pulse />
                  <span className="text-xs text-muted-foreground font-num flex items-center gap-1">
                    <Clock size={12} /> Posted 4m ago
                  </span>
                </div>

                {/* Patient Requisition Info */}
                <div className="mt-4 flex items-center gap-4">
                  <BloodGroupChip group="A+" size="xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Emergency Requisition at</p>
                    <p className="font-bold text-foreground text-base truncate">City Trauma &amp; Super Speciality</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> 2.8 km away · Required by 7:30 PM
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-num text-2xl font-extrabold text-foreground">2</p>
                    <p className="text-[11px] text-muted-foreground">units needed</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">Dispatch Progress</span>
                    <span className="font-num font-bold text-primary">En Route (ETA 11m)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "72%" }} />
                  </div>
                </div>

                <div className="mt-4 h-px bg-border" />

                {/* Nearest Ranked Matches */}
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Top Ranked Matches</span>
                  <span className="text-[10px] text-primary lowercase font-medium">calculated by distance &amp; blood group</span>
                </p>

                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary-soft/30 p-3 transition-colors">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                      <Building size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate">Red Cross Regional Blood Centre</p>
                        <span className="text-[10px] bg-primary/15 text-primary font-bold px-1.5 py-0.2 rounded">Bank</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-num">1.4 km · 4 units in stock</p>
                    </div>
                    <div className="text-right">
                      <span className="font-num text-base font-extrabold text-primary">98</span>
                      <span className="text-[10px] block text-muted-foreground leading-none">score</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-border p-3 hover:border-primary/30 transition-colors">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground shrink-0">
                      <User size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate">Priya S. (Verified Volunteer)</p>
                        <span className="text-[10px] bg-success-soft text-success font-bold px-1.5 py-0.2 rounded">Donor</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-num">3.1 km · On-call ready</p>
                    </div>
                    <div className="text-right">
                      <span className="font-num text-base font-extrabold text-foreground">92</span>
                      <span className="text-[10px] block text-muted-foreground leading-none">score</span>
                    </div>
                  </div>
                </div>

                {/* Card footer: Cold chain telemetry */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-success font-medium">
                    <ShieldCheck size={15} />
                    Certified Cold-Chain: 3.6°C (Safe 2–6°C)
                  </span>
                  <span className="text-[11px] font-num">ID: #REQ-8821</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Quick Availability Checker Section */}
      <section id="estimator" className="py-14 sm:py-18 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-2">
              <Zap size={13} />
              <span>Real-Time Regional Data</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Check Blood Availability in Your Area
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select your required blood group to preview estimated dispatch speed and nearby supply.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Blood Group:</span>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedGroup(bg)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold font-num transition-all cursor-pointer btn-tactile",
                    selectedGroup === bg
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {bg}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-4 rounded-2xl bg-card border border-border/80">
                <p className="font-num text-2xl sm:text-3xl font-extrabold text-foreground">~{est.etaMin}m</p>
                <p className="text-xs text-muted-foreground mt-1">Estimated Dispatch ETA</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/80">
                <p className="font-num text-2xl sm:text-3xl font-extrabold text-primary">{est.unitsInBanks}</p>
                <p className="text-xs text-muted-foreground mt-1">Units in {est.banksCount} Blood Banks</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/80">
                <p className="font-num text-2xl sm:text-3xl font-extrabold text-success">{est.donorsNearby}</p>
                <p className="text-xs text-muted-foreground mt-1">On-Call Donors in 8 km</p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-success" />
                Verified document check passed for all listed sources
              </span>
              <Link to="/select-role">
                <Button size="md" rightIcon={<ArrowRight size={16} />}>
                  Request {selectedGroup} Blood Units
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Performance Metrics Ribbon */}
      <section className="py-10 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Clock size={22} />
              </span>
              <div>
                <p className="font-num text-xl sm:text-2xl font-extrabold text-foreground">&lt; 12 mins</p>
                <p className="text-xs text-muted-foreground">Median dispatch confirmation</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-success-soft text-success">
                <ShieldCheck size={22} />
              </span>
              <div>
                <p className="font-num text-xl sm:text-2xl font-extrabold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground">Document-verified banks</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-critical-soft text-critical">
                <Heart size={22} />
              </span>
              <div>
                <p className="font-num text-xl sm:text-2xl font-extrabold text-foreground">4,850+</p>
                <p className="text-xs text-muted-foreground">Lives saved across the city</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-info-soft text-info">
                <Truck size={22} />
              </span>
              <div>
                <p className="font-num text-xl sm:text-2xl font-extrabold text-foreground">2–6°C</p>
                <p className="text-xs text-muted-foreground">Clinical cold-chain guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Blood Compatibility Lab */}
      <section id="compatibility" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-22">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-2.5">
            <Award size={13} />
            <span>Clinical Knowledge Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">Interactive Compatibility Laboratory</h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Understand the biological rules of safe transfusion. Select any group to explore incoming compatibility and outgoing giving power.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-sm p-6 sm:p-8">
          {/* Controls: Mode toggle + Blood selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Inspect Group:</span>
              <BloodGroupChip group={activeCompatGroup} size="lg" />
            </div>

            <div className="flex items-center gap-1.5 bg-muted/80 p-1 rounded-xl border border-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCompatView("receive")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                  compatView === "receive"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Who can donate to {activeCompatGroup}?
              </button>
              <button
                type="button"
                onClick={() => setCompatView("give")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                  compatView === "give"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Who can {activeCompatGroup} save?
              </button>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setActiveCompatGroup(bg)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold font-num transition-all cursor-pointer",
                    activeCompatGroup === bg
                      ? "bg-primary text-primary-foreground shadow-xs scale-105"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic compatibility grid */}
          <div className="mt-6">
            {(() => {
              const compatibleList =
                compatView === "receive"
                  ? compatibleDonors(activeCompatGroup)
                  : canDonateTo(activeCompatGroup);

              return (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <p className="text-sm font-medium text-foreground">
                      {compatView === "receive" ? (
                        <>
                          Patients with <strong className="text-primary font-bold">{activeCompatGroup}</strong> can safely receive red blood cells from{" "}
                          <strong className="text-foreground font-bold">{compatibleList.length} blood groups</strong>:
                        </>
                      ) : (
                        <>
                          Donors with <strong className="text-primary font-bold">{activeCompatGroup}</strong> can donate red blood cells to{" "}
                          <strong className="text-foreground font-bold">{compatibleList.length} recipient groups</strong>:
                        </>
                      )}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {activeCompatGroup === "O-" && "🌟 Universal Red Cell Donor"}
                      {activeCompatGroup === "AB+" && "🌟 Universal Red Cell Recipient"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {BLOOD_GROUPS.map((g) => {
                      const isOk = compatibleList.includes(g);
                      const isExact = g === activeCompatGroup;

                      return (
                        <div
                          key={g}
                          className={cn(
                            "flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all bl-card-lift",
                            isExact
                              ? "border-primary bg-primary-soft/60 shadow-xs"
                              : isOk
                                ? "border-success/40 bg-success-soft/60"
                                : "border-border/60 bg-muted/40 opacity-50"
                          )}
                        >
                          <span
                            className={cn(
                              "font-num font-extrabold text-lg",
                              isExact ? "text-primary" : isOk ? "text-success" : "text-muted-foreground"
                            )}
                          >
                            {g}
                          </span>
                          <span
                            className={cn(
                              "mt-1 text-[11px] font-semibold flex items-center gap-0.5",
                              isExact ? "text-primary font-bold" : isOk ? "text-success" : "text-muted-foreground"
                            )}
                          >
                            {isExact ? (
                              <>
                                <DropletFill size={11} /> Exact
                              </>
                            ) : isOk ? (
                              <>
                                <Check size={12} /> Safe
                              </>
                            ) : (
                              "Incompatible"
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Educational Callout footer */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="rounded-2xl bg-muted/40 border border-border/80 p-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground mb-1">
                <span className="size-2 rounded-full bg-critical" />
                <span>O- Negative: The Universal Lifesaver</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Because O- red blood cells lack A, B, and Rh antigens, they can be transfused to virtually any emergency patient when there's no time to type blood.
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 border border-border/80 p-4">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground mb-1">
                <span className="size-2 rounded-full bg-primary" />
                <span>AB+ Positive: The Universal Receiver</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Individuals with AB+ blood have both A and B antigens and the Rh factor, allowing them to safely receive red blood cells from every other group.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Journey */}
      <section id="how" className="bg-card border-y border-border py-16 lg:py-22">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Transparent Emergency Journey</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight font-display">How BloodLink Works in Emergencies</h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              A streamlined, 4-step coordination flow designed for clarity when seconds matter.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div key={s.step} className="rounded-3xl border border-border bg-background p-6 flex flex-col justify-between bl-card-lift">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                      {s.icon}
                    </span>
                    <span className="font-num text-sm font-extrabold text-muted-foreground/60">{s.step}</span>
                  </div>
                  <h3 className="font-bold text-base text-foreground">{s.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Portals ("Built for Everyone in the Chain") */}
      <section id="roles" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-22">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Role-Tailored Workspaces</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight font-display">Built for Everyone in the Chain</h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Choose your role to enter dedicated dashboards engineered with calm efficiency.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Voluntary Donors */}
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between bl-card-lift shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-critical-soft text-critical">
                  <Heart size={24} />
                </span>
                <span className="text-[11px] font-bold text-critical bg-critical-soft/80 px-2.5 py-0.5 rounded-full">
                  Volunteers
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">For Blood Donors</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Be on call for emergency alerts in your neighborhood without receiving spam or unsolicited calls.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>1-Tap On-Call Availability toggle (10 km radius)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>Eligibility countdown &amp; medical rest intervals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>Verified digital certificate after every donation</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Link to="/donor">
                <Button fullWidth variant="outline" rightIcon={<ArrowRight size={15} />}>
                  Enter Donor Portal
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Requesters & Families */}
          <div className="rounded-3xl border-2 border-primary/30 bg-primary-soft/20 p-6 flex flex-col justify-between bl-card-lift shadow-md relative">
            <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
              Emergency Priority
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Activity size={24} />
                </span>
                <span className="text-[11px] font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                  Patients &amp; Families
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">For Requesters</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Raise an emergency blood request in seconds. See transparently ranked nearby donors and certified banks.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>1-Tap unit chips &amp; immediate urgency presets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>Multi-factor sorting: Best Match, Distance, ETA</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>Live tracking with emergency coordinator desk hotline</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-border/80">
              <Link to="/requester">
                <Button fullWidth rightIcon={<ArrowRight size={15} />}>
                  Enter Requester Desk
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Blood Banks & Hospitals */}
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between bl-card-lift shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-info-soft text-info">
                  <Hospital size={24} />
                </span>
                <span className="text-[11px] font-bold text-info bg-info-soft px-2.5 py-0.5 rounded-full">
                  Institutions
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">For Blood Banks</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Manage your 8-group stock with instant inventory counters, depletion alerts, and hospital triage.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>8-group stock grid with 1-click + / - adjustments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>Incoming hospital emergency request triage modal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-success shrink-0" />
                  <span>Cold-chain compliance &amp; transfer logging</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Link to="/bank">
                <Button fullWidth variant="outline" rightIcon={<ArrowRight size={15} />}>
                  Enter Bank Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Community Stories & Testimonials */}
      <section className="bg-card border-y border-border py-16 lg:py-22">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Voices from the Network</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight font-display">Trusted by Doctors, Donors &amp; Families</h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Real experiences from people who relied on BloodLink during life-critical moments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-background p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed italic">
                  "During acute trauma surgeries, waiting 45 minutes for blood can be fatal. BloodLink slashed our emergency requisition and dispatch time to just 14 minutes."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-xs">
                  PS
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">Dr. Priya Sharma</p>
                  <p className="text-[11px] text-muted-foreground">Chief of Emergency Medicine</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed italic">
                  "As an O- Negative universal donor, I always wanted to help in genuine emergencies without random spam calls. The 10 km on-call radar gave me that exact peace of mind."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-critical-soft text-critical font-bold text-xs">
                  RM
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">Rahul Mehta</p>
                  <p className="text-[11px] text-muted-foreground">14-time Volunteer Donor</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed italic">
                  "At 2 AM when local hospital stock ran out of B+ platelets, BloodLink connected us with a certified donor 4 km away. The coordinator guided us every step of the way."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success font-bold text-xs">
                  SR
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">Sunita Rao</p>
                  <p className="text-[11px] text-muted-foreground">Patient's Family Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 lg:py-22">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Got Questions?</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight font-display">Frequently Asked Questions</h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Everything you need to know about privacy, eligibility, safety, and hospital coordination.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-foreground text-sm sm:text-base hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={cn("text-muted-foreground shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/60 animate-bl-fade-up">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Reassuring Call to Action & 24/7 Helpline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 lg:pb-24">
        <div className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground p-8 sm:p-12 lg:p-14 text-center shadow-lg">
          {/* Subtle background circles */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-black/10 blur-2xl" />

          <div className="relative max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-semibold mb-4">
              <Phone size={13} />
              <span>24/7 Emergency Dispatch Helpline</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              Ready when seconds count. Be someone's lifeline today.
            </h2>

            <p className="mt-4 text-primary-foreground/85 text-sm sm:text-base leading-relaxed">
              Join thousands keeping emergency blood within reach. Register as a donor or request units for a hospital in under two minutes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/select-role" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" rightIcon={<ArrowRight size={18} />} fullWidth>
                  Get Started Free
                </Button>
              </Link>
              <a
                href="tel:1800256635"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-sm font-bold border border-primary-foreground/20 transition-colors"
              >
                <Phone size={16} />
                <span>Call 1800-BLOOD-LINK</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="border-t border-border bg-card/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Logo />
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Emergency blood coordination network connecting patients, verified donors, and blood banks with calm precision.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-success font-semibold">
                <span className="size-2 rounded-full bg-emerald-500 animate-bl-pulse" />
                <span>All Systems Operational (99.98%)</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Workspaces</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/requester" className="hover:text-foreground transition-colors">Emergency Requester</Link></li>
                <li><Link to="/donor" className="hover:text-foreground transition-colors">Volunteer Donor</Link></li>
                <li><Link to="/bank" className="hover:text-foreground transition-colors">Blood Bank Inventory</Link></li>
                <li><Link to="/select-role" className="hover:text-foreground transition-colors">Role Selector</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Clinical Tools</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#estimator" className="hover:text-foreground transition-colors">Availability Checker</a></li>
                <li><a href="#compatibility" className="hover:text-foreground transition-colors">Compatibility Matrix</a></li>
                <li><a href="#how" className="hover:text-foreground transition-colors">Cold-Chain Protocol</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">Emergency FAQ</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Emergency Contact</p>
              <p className="text-xs font-bold text-foreground">24/7 Dispatch Hotline:</p>
              <p className="font-num text-sm font-extrabold text-primary mt-0.5">1800-BLOOD-LINK</p>
              <p className="text-xs text-muted-foreground mt-2">
                For life-threatening situations, always alert your local ambulance service (112 / 102).
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 BloodLink Foundation. Non-profit humanitarian network.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
              <span>·</span>
              <span className="hover:text-foreground cursor-pointer">Clinical Accreditation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
