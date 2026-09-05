import { useState, type FormEvent } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Field, Input, Select } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar, Divider } from "../components/ui/misc";
import { BloodGroupChip } from "../components/ui/domain";
import { cn } from "../lib/cn";
import { getRole } from "../lib/session";
import { BLOOD_GROUPS } from "../lib/blood";
import { CURRENT_USER } from "../lib/mock";
import { Building, Check, DropletFill, ShieldCheck, User } from "../lib/icons";
import type { Role } from "../lib/types";

const ROLE_TITLE: Record<Role, string> = {
  requester: "Requester",
  donor: "Donor",
  bank: "Blood Bank",
};

export default function Profile() {
  const role = getRole();
  const [saved, setSaved] = useState(false);
  const name =
    role === "donor" ? CURRENT_USER.donor.name : role === "bank" ? CURRENT_USER.bank.name : CURRENT_USER.requester.name;

  function save(e: FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <AppShell role={role} title="Profile & settings" active="/app/profile">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight lg:hidden mb-6">Profile &amp; settings</h1>

        {/* Identity header */}
        <Card className="mb-5">
          <CardBody className="flex items-center gap-4">
            <div className="relative">
              {role === "bank" ? (
                <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Building size={30} />
                </span>
              ) : (
                <Avatar name={name} size={64} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold truncate">{name}</h2>
                <Badge tone="primary" icon={role === "donor" ? <DropletFill size={12} /> : role === "bank" ? <Building size={12} /> : <User size={12} />}>
                  {ROLE_TITLE[role]}
                </Badge>
              </div>
              {role === "bank" ? (
                <p className="mt-1 text-sm text-success flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={15} /> Verified institution
                </p>
              ) : role === "donor" ? (
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                  Blood group <BloodGroupChip group={CURRENT_USER.donor.bloodGroup} size="sm" />
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{CURRENT_USER.requester.org}</p>
              )}
            </div>
          </CardBody>
        </Card>

        <form onSubmit={save}>
          <Card className="mb-5">
            <CardHeader title="Account details" subtitle="Update your contact information." />
            <CardBody className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" required className="sm:col-span-2">
                <Input defaultValue={name} />
              </Field>
              <Field label="Email">
                <Input type="email" defaultValue="ananya.rao@example.com" />
              </Field>
              <Field label="Phone">
                <Input type="tel" defaultValue="+91 98450 12345" />
              </Field>
              {role === "donor" && (
                <Field label="Blood group" required>
                  <Select defaultValue={CURRENT_USER.donor.bloodGroup}>
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field label="Location" className={role === "donor" ? "" : "sm:col-span-2"}>
                <Input defaultValue="Bengaluru, Karnataka" />
              </Field>
            </CardBody>
          </Card>

          {role === "donor" && (
            <Card className="mb-5">
              <CardHeader title="Donation preferences" subtitle="Control when and how you're contacted." />
              <CardBody className="divide-y divide-border">
                {[
                  ["Available for emergencies", "Get notified about nearby critical requests", true],
                  ["Auto-share ETA", "Share live location when you accept a request", true],
                  ["Weekend donations only", "Limit requests to Saturdays and Sundays", false],
                ].map(([t, d, on], i) => (
                  <Toggle key={i} title={t as string} desc={d as string} defaultOn={on as boolean} />
                ))}
              </CardBody>
            </Card>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" leftIcon={saved ? <Check size={16} /> : undefined}>
              {saved ? "Saved" : "Save changes"}
            </Button>
            {saved && (
              <span className="text-sm text-success font-medium animate-bl-fade-up">
                Your changes have been saved.
              </span>
            )}
          </div>
        </form>

        <Divider className="my-8" />
        <div className="rounded-2xl border border-critical/20 bg-critical-soft/40 p-5">
          <h3 className="font-semibold text-critical">Danger zone</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Deactivating removes you from matching until you return.
          </p>
          <Button variant="outline" size="sm" className="mt-4 border-critical/30 text-critical hover:bg-critical-soft">
            Deactivate account
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Toggle({ title, desc, defaultOn }: { title: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors shrink-0",
          on ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            on ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
