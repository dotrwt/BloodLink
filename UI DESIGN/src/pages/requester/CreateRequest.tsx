import { useState, type FormEvent } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { CompatibilityExplainer } from "../../components/domain/CompatibilityExplainer";
import { UrgencyBadge } from "../../components/ui/domain";
import { cn } from "../../lib/cn";
import { Link, useRouter } from "../../lib/router";
import { BLOOD_GROUPS } from "../../lib/blood";
import type { BloodGroup, Urgency } from "../../lib/types";
import { AlertTriangle, ArrowLeft, ArrowRight, Info, Search } from "../../lib/icons";

const URGENCY_OPTS: { value: Urgency; label: string; desc: string }[] = [
  { value: "critical", label: "Critical", desc: "Life-threatening, needed within hours" },
  { value: "urgent", label: "Urgent", desc: "Needed today" },
  { value: "routine", label: "Routine", desc: "Planned / scheduled" },
];

export default function CreateRequest() {
  const { navigate } = useRouter();
  const [group, setGroup] = useState<BloodGroup | "">("");
  const [units, setUnits] = useState("");
  const [patient, setPatient] = useState("");
  const [hospital, setHospital] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("urgent");
  const [requiredBy, setRequiredBy] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = {
    group: !group ? "Select the required blood group" : "",
    units: !units || Number(units) < 1 ? "Enter at least 1 unit" : "",
    patient: !patient ? "Patient name is required" : "",
    hospital: !hospital ? "Hospital / facility is required" : "",
    requiredBy: !requiredBy ? "Set a required-by time" : "",
  };
  const valid = Object.values(errors).every((e) => !e);

  function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setSubmitting(true);
    setTimeout(() => navigate("/app/requester/matches/req-201"), 1100);
  }

  return (
    <AppShell role="requester" title="New request" active="/app/requester/new">
      <Link to="/app/requester" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
        <form onSubmit={submit}>
          {/* Urgency — most prominent decision */}
          <Card className="mb-5">
            <CardHeader title="How urgent is this?" subtitle="This drives how aggressively we alert donors and rank sources." />
            <CardBody>
              <div className="grid sm:grid-cols-3 gap-3">
                {URGENCY_OPTS.map((o) => (
                  <button
                    type="button"
                    key={o.value}
                    onClick={() => setUrgency(o.value)}
                    className={cn(
                      "text-left rounded-xl border-2 p-3.5 transition-all",
                      urgency === o.value
                        ? o.value === "critical"
                          ? "border-critical bg-critical-soft"
                          : "border-primary bg-primary-soft/40"
                        : "border-border bg-card hover:border-[#d6d1c8]",
                    )}
                  >
                    <UrgencyBadge urgency={o.value} />
                    <p className="mt-2.5 text-xs text-muted-foreground leading-snug">{o.desc}</p>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="mb-5">
            <CardHeader title="Blood needed" />
            <CardBody className="grid sm:grid-cols-2 gap-4">
              <Field label="Blood group" required error={touched ? errors.group : ""}>
                <Select value={group} onChange={(e) => setGroup(e.target.value as BloodGroup)} invalid={touched && !!errors.group}>
                  <option value="" disabled>Select group</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Units required" required error={touched ? errors.units : ""}>
                <Input type="number" min={1} max={20} placeholder="e.g. 3" value={units} onChange={(e) => setUnits(e.target.value)} invalid={touched && !!errors.units} />
              </Field>
            </CardBody>
          </Card>

          <Card className="mb-5">
            <CardHeader title="Patient & location" />
            <CardBody className="grid sm:grid-cols-2 gap-4">
              <Field label="Patient name" required error={touched ? errors.patient : ""} className="sm:col-span-2">
                <Input placeholder="Full name" value={patient} onChange={(e) => setPatient(e.target.value)} invalid={touched && !!errors.patient} />
              </Field>
              <Field label="Hospital / facility" required error={touched ? errors.hospital : ""} className="sm:col-span-2">
                <Input placeholder="e.g. Manipal Hospital, Old Airport Rd" value={hospital} onChange={(e) => setHospital(e.target.value)} invalid={touched && !!errors.hospital} />
              </Field>
              <Field label="Area / location">
                <Input placeholder="e.g. HAL, Bengaluru" value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <Field label="Required by" required error={touched ? errors.requiredBy : ""}>
                <Input placeholder="e.g. Today, 6:00 PM" value={requiredBy} onChange={(e) => setRequiredBy(e.target.value)} invalid={touched && !!errors.requiredBy} />
              </Field>
              <Field label="Note for donors (optional)" className="sm:col-span-2">
                <Textarea placeholder="Any context that helps — condition, ward, contact person…" value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
            </CardBody>
          </Card>

          {touched && !valid && (
            <p className="text-sm text-critical bg-critical-soft rounded-lg px-3 py-2 font-medium mb-4 flex items-center gap-2">
              <AlertTriangle size={16} /> Please fix the highlighted fields to continue.
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" size="lg" loading={submitting} rightIcon={!submitting ? <Search size={18} /> : undefined}>
              {submitting ? "Finding matches…" : "Find matches"}
            </Button>
            <Link to="/app/requester">
              <Button type="button" variant="ghost" size="lg">Cancel</Button>
            </Link>
          </div>
        </form>

        {/* Live compatibility preview */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Card>
            <CardHeader title="Compatibility preview" />
            <CardBody>
              {group ? (
                <CompatibilityExplainer recipient={group} compact />
              ) : (
                <div className="flex flex-col items-center text-center py-6 text-muted-foreground">
                  <Info size={26} className="mb-2 opacity-60" />
                  <p className="text-sm">Select a blood group to see who can donate.</p>
                </div>
              )}
            </CardBody>
          </Card>
          <div className="rounded-2xl border border-border bg-primary-soft/40 p-4 flex gap-3">
            <ArrowRight size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Next, you'll see <strong className="text-foreground">ranked matches</strong> — donors and banks scored by compatibility, distance, availability and eligibility.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
