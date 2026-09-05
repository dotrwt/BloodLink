import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { CompatibilityExplainer } from "../../components/domain/CompatibilityExplainer";
import { UrgencyBadge } from "../../components/ui/domain";
import { Skeleton } from "../../components/ui/misc";
import { cn } from "../../lib/cn";
import { Link, useRouter } from "../../lib/router";
import { useOptions } from "../../hooks/useOptions";
import { useRequests } from "../../hooks/useRequests";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import type { BloodGroup, Urgency } from "../../types/models";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "../../lib/icons";

const TIME_PRESETS = [
  { label: "Immediate (< 2 hrs)", value: "Today, within 2 hours" },
  { label: "Today Evening", value: "Today, 6:00 PM" },
  { label: "Tomorrow Morning", value: "Tomorrow, 9:00 AM" },
  { label: "Scheduled Transfusion", value: "Scheduled for next day" },
];

const UNIT_PRESETS = [1, 2, 3, 4];

export default function CreateRequest() {
  const { navigate } = useRouter();
  const { bloodGroups, urgencyLevels, hospitals, loading: optionsLoading } = useOptions();
  const { createRequest } = useRequests();
  const { user } = useCurrentUser();

  const [group, setGroup] = useState<BloodGroup | "">("A+");
  const [units, setUnits] = useState("2");
  const [patient, setPatient] = useState("");
  const [hospital, setHospital] = useState(hospitals[0]?.name || "Manipal Hospital, Old Airport Rd");
  const [location, setLocation] = useState(hospitals[0]?.address || "HAL, Bengaluru");
  const [city, setCity] = useState("Gwalior");
  const [area, setArea] = useState("Indiranagar");
  const [urgency, setUrgency] = useState<Urgency>("critical");
  const [requiredBy, setRequiredBy] = useState("Today, within 2 hours");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (user?.city) setCity(user.city);
    if (user?.area) setArea(user.area);
    if (user?.city && hospitals.length > 0) {
      const matchHosp = hospitals.find(
        (h) => h.city?.toLowerCase() === user.city?.toLowerCase()
      );
      if (matchHosp) {
        setHospital(matchHosp.name);
        setLocation(matchHosp.address);
      }
    }
  }, [user, hospitals]);

  const errors = {
    group: !group ? "Select the required blood group" : "",
    units: !units || Number(units) < 1 ? "Enter at least 1 unit" : "",
    patient: !patient.trim() ? "Patient name is required" : "",
    hospital: !hospital ? "Hospital / facility is required" : "",
    requiredBy: !requiredBy.trim() ? "Set a required-by time" : "",
  };
  const valid = Object.values(errors).every((e) => !e);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || !group) return;
    setSubmitting(true);
    try {
      const created = await createRequest({
        patientName: patient,
        bloodGroup: group,
        units: Number(units),
        hospital,
        location: location || `${area}, ${city}`,
        city,
        area,
        urgency,
        requiredBy,
        note,
      });
      navigate(`/app/requester/matches/${created.id}`);
    } catch (err) {
      console.error("Failed to create request", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="New blood request" active="/app/requester/new">
      <Link
        to="/app/dashboard"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      {optionsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start pb-12 lg:pb-0">
          <form onSubmit={submit}>
            {/* Step 1: Urgency Selection */}
            <Card className="mb-5 shadow-2xs">
              <CardHeader
                title="1. Urgency Level"
                subtitle="Drives notification frequency, push notifications, and source ranking."
              />
              <CardBody className="pt-0">
                <div className="grid sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {urgencyLevels.map((u) => {
                    const active = urgency === u.value;
                    return (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => {
                          setUrgency(u.value);
                          if (u.value === "critical") setRequiredBy("Today, within 2 hours");
                        }}
                        className={cn(
                          "text-left rounded-2xl border-2 p-3.5 transition-all cursor-pointer",
                          active
                            ? u.value === "critical"
                              ? "border-critical bg-critical-soft/60 shadow-xs"
                              : u.value === "urgent"
                              ? "border-urgent bg-urgent-soft/60 shadow-xs"
                              : "border-primary bg-primary-soft/60 shadow-xs"
                            : "border-border bg-card hover:border-border/90 opacity-80 hover:opacity-100",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <UrgencyBadge urgency={u.value} size="sm" pulse={u.value === "critical"} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Step 2: Patient & Blood Group Details */}
            <Card className="mb-5 shadow-2xs">
              <CardHeader title="2. Blood & Patient Details" />
              <CardBody className="pt-0 space-y-4">
                {/* Blood Group Quick-Pick Chips */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                    Blood group needed <span className="text-critical">*</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {bloodGroups.map((g) => {
                      const isSelected = group === g.value;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setGroup(g.value as BloodGroup)}
                          className={cn(
                            "h-12 rounded-xl flex flex-col items-center justify-center font-num font-bold text-base transition-all cursor-pointer border",
                            isSelected
                              ? "bg-critical text-critical-foreground border-critical shadow-sm scale-105 ring-2 ring-critical/30"
                              : "bg-card border-border text-foreground hover:bg-muted"
                          )}
                        >
                          {g.value}
                        </button>
                      );
                    })}
                  </div>
                  {touched && errors.group && (
                    <p className="mt-1.5 text-xs text-critical font-medium">{errors.group}</p>
                  )}
                </div>

                {/* Units Required with Quick Preset Chips */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Units required <span className="text-critical">*</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {UNIT_PRESETS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnits(String(u))}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-bold font-num border transition-all cursor-pointer",
                          units === String(u)
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-card border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {u} {u === 1 ? "Unit" : "Units"}
                      </button>
                    ))}
                    <div className="w-24">
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        placeholder="Custom"
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">1 unit ≈ 450 ml whole blood</p>
                  {touched && errors.units && (
                    <p className="mt-1 text-xs text-critical font-medium">{errors.units}</p>
                  )}
                </div>

                {/* Patient Name */}
                <Field
                  label="Patient full name"
                  required
                  hint="Shared strictly with verified donors & blood banks"
                  error={touched ? errors.patient : undefined}
                >
                  <Input
                    placeholder="e.g. Meera Rao"
                    value={patient}
                    onChange={(e) => setPatient(e.target.value)}
                    invalid={touched && !!errors.patient}
                  />
                </Field>

                {/* Hospital Selection */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Hospital / Facility" required error={touched ? errors.hospital : undefined}>
                    <Select
                      value={hospital}
                      onChange={(e) => {
                        setHospital(e.target.value);
                        const matched = hospitals.find((h) => h.name === e.target.value);
                        if (matched) setLocation(matched.address);
                      }}
                      invalid={touched && !!errors.hospital}
                    >
                      <option value="">Select hospital…</option>
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.name}>{h.name}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Ward / Specific Room" hint="e.g. ICU Bed 4, Emergency wing">
                    <Input
                      placeholder="e.g. ICU Wing A, Floor 2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </Field>
                </div>

                {/* City & Locality Input */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="City / District" required hint="Used for nearby donor matching and map dispatch">
                    <Input
                      placeholder="e.g. Gwalior, Bengaluru, Delhi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Field>
                  <Field label="Area / Locality" required hint="e.g. Indiranagar, City Centre, Lashkar">
                    <Input
                      placeholder="e.g. Indiranagar, City Centre"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </Field>
                </div>

                {/* Required By with Fast Presets */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Required by <span className="text-critical">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {TIME_PRESETS.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setRequiredBy(t.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
                          requiredBy === t.value
                            ? "bg-primary-soft text-primary border-primary/40 font-bold"
                            : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="e.g. Today, 6:00 PM"
                    value={requiredBy}
                    onChange={(e) => setRequiredBy(e.target.value)}
                    invalid={touched && !!errors.requiredBy}
                  />
                  {touched && errors.requiredBy && (
                    <p className="mt-1 text-xs text-critical font-medium">{errors.requiredBy}</p>
                  )}
                </div>

                {/* Clinical Notes */}
                <Field label="Clinical note (optional)" hint="Helps blood banks prioritize cross-matching">
                  <Textarea
                    placeholder="e.g. Post-op cardiac surgery, patient stable but low Hb."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                </Field>
              </CardBody>
            </Card>

            {/* Desktop Actions */}
            <div className="flex items-center justify-between gap-4">
              <Link to="/app/dashboard">
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                rightIcon={<ArrowRight size={18} />}
                className="shadow-sm"
              >
                {submitting ? "Ranking sources in real-time…" : "Find matching sources"}
              </Button>
            </div>
          </form>

          {/* Compatibility Sidebar Assistant */}
          <aside className="space-y-4 sticky top-20">
            <Card className="shadow-2xs">
              <CardHeader
                title="Compatibility Matrix"
                subtitle="Live preview for the selected blood group"
              />
              <CardBody className="pt-0">
                <CompatibilityExplainer recipient={group || "A+"} />
              </CardBody>
            </Card>

            <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 text-xs space-y-2">
              <p className="font-bold text-primary flex items-center gap-1.5">
                <ShieldCheck size={16} /> Verified Donor Network
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Requests are ranked by ABO compatibility, driving distance, and donor availability to ensure units arrive in under 30 minutes.
              </p>
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
