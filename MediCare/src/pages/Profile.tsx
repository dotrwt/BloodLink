import { useState, type FormEvent } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field, Input, Select } from "../components/ui/Field";
import { Avatar, Skeleton, ErrorState } from "../components/ui/misc";
import { BloodGroupChip } from "../components/ui/domain";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useOptions } from "../hooks/useOptions";
import type { BloodGroup, UserProfile } from "../types/models";
import { Check, ShieldCheck } from "../lib/icons";

interface ProfileFormProps {
  user: UserProfile;
  bloodGroups: { value: BloodGroup; label: string }[];
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

function ProfileForm({ user, bloodGroups, updateProfile }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [org, setOrg] = useState(user.org || "");
  const [location, setLocation] = useState(user.location);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user.bloodGroup);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, org, location, bloodGroup });
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Identity card */}
      <Card className="mb-6">
        <CardBody className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{user.name}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <BloodGroupChip group={user.bloodGroup} size="sm" />
              <span className="text-xs text-success flex items-center gap-1 font-medium">
                <ShieldCheck size={13} /> Verified identity
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <form onSubmit={submit} className="space-y-5">
        <Card>
          <CardHeader title="Personal information" />
          <CardBody className="pt-0 space-y-4">
            <Field label="Full name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>

            <Field label="Organization / affiliation" hint="e.g. Hospital coordinator, Family advocate, Individual">
              <Input value={org} onChange={(e) => setOrg(e.target.value)} />
            </Field>

            <Field label="City / district" required>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
            </Field>

            <Field label="Blood group" required>
              <Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}>
                {bloodGroups.map((bg) => (
                  <option key={bg.value} value={bg.value}>{bg.label}</option>
                ))}
              </Select>
            </Field>
          </CardBody>
        </Card>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-sm font-medium text-success flex items-center gap-1.5">
              <Check size={16} /> Changes saved successfully
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit" size="md" loading={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function Profile() {
  const { user, loading, error, refetch, updateProfile } = useCurrentUser();
  const { bloodGroups } = useOptions();

  return (
    <AppShell title="Profile" active="/app/profile">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-1 lg:hidden">Profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage your account information and preferences</p>

        {error && (
          <div className="mb-6">
            <ErrorState message={error} retry={refetch} />
          </div>
        )}

        {loading || !user ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          <ProfileForm key={user.id} user={user} bloodGroups={bloodGroups} updateProfile={updateProfile} />
        )}
      </div>
    </AppShell>
  );
}
