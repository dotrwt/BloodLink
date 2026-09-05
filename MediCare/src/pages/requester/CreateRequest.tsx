import { useState, type FormEvent } from "react";
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
import type { BloodGroup, Urgency } from "../../types/models";
import { ArrowLeft, ArrowRight } from "../../lib/icons";

export default function CreateRequest() {
  const { navigate } = useRouter();
  const { bloodGroups, urgencyLevels, hospitals, loading: optionsLoading } = useOptions();
  const { createRequest } = useRequests();

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
        location: location || "Central City",
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
    <AppShell title="New request" active="/app/requester/new">
      <Link to="/app/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      {optionsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
          <form onSubmit={submit}>
            {/* Urgency selection */}
            <Card className="mb-5">
              <CardHeader title="How urgent is this?" subtitle="This drives how aggressively we alert donors and rank sources." />
              <CardBody className="pt-0">
                <div className="grid sm:grid-cols-3 gap-3">
                  {urgencyLevels.map((u) => {
                    const active = urgency === u.value;
                    return (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => setUrgency(u.value)}
                        className={cn(
                          "text-left rounded-2xl border-2 p-3.5 transition-all cursor-pointer",
                          active
                            ? u.value === "critical"
                              ? "border-critical bg-critical-soft/50"
                              : u.value === "urgent"
                              ? "border-urgent bg-urgent-soft/50"
                              : "border-primary bg-primary-soft/50"
                            : "border-border bg-card hover:border-[#d6d1c8]",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <UrgencyBadge urgency={u.value} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Request details */}
            <Card className="mb-5">
              <CardHeader title="Patient & blood requirements" />
              <CardBody className="pt-0 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Blood group needed" required error={touched ? errors.group : undefined}>
                    <Select
                      value={group}
                      onChange={(e) => setGroup(e.target.value as BloodGroup)}
                      invalid={touched && !!errors.group}
                    >
                      <option value="">Select group…</option>
                      {bloodGroups.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Units required" required hint="1 unit ≈ 450 ml" error={touched ? errors.units : undefined}>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      placeholder="e.g. 2"
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      invalid={touched && !!errors.units}
                    />
                  </Field>
                </div>

                <Field label="Patient name" required hint="Used only for hospital coordination" error={touched ? errors.patient : undefined}>
                  <Input
                    placeholder="e.g. Meera Rao"
                    value={patient}
                    onChange={(e) => setPatient(e.target.value)}
                    invalid={touched && !!errors.patient}
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Hospital / facility" required error={touched ? errors.hospital : undefined}>
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

                  <Field label="Location / ward" hint="e.g. ICU Ward 3">
                    <Input
                      placeholder="Ward, floor, landmark"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Required by" required hint="When must the unit be at the hospital?" error={touched ? errors.requiredBy : undefined}>
                  <Input
                    placeholder="e.g. Today, 6:00 PM"
                    value={requiredBy}
                    onChange={(e) => setRequiredBy(e.target.value)}
                    invalid={touched && !!errors.requiredBy}
                  />
                </Field>

                <Field label="Clinical note (optional)" hint="Helps blood banks and donors triage urgency">
                  <Textarea
                    placeholder="e.g. Post-op cardiac surgery, patient stable but low Hb."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </Field>
              </CardBody>
            </Card>

            <div className="flex items-center justify-between gap-4">
              <Link to="/app/dashboard">
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" size="lg" loading={submitting} rightIcon={<ArrowRight size={18} />}>
                {submitting ? "Publishing & matching…" : "Find matching sources"}
              </Button>
            </div>
          </form>

          {/* Live compatibility sidebar helper */}
          <aside className="space-y-4">
            <Card>
              <CardHeader title="ABO & Rh compatibility" />
              <CardBody className="pt-0">
                <CompatibilityExplainer recipient={group || "A+"} />
              </CardBody>
            </Card>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
