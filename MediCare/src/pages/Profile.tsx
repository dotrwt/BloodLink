import { useState, type FormEvent } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { Avatar, Skeleton, ErrorState } from "../components/ui/misc";
import { BloodGroupChip } from "../components/ui/domain";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useOptions } from "../hooks/useOptions";
import { cn } from "../lib/cn";
import type { BloodGroup, UserProfile } from "../types/models";
import { CheckCircle, ShieldCheck } from "../lib/icons";

interface ProfileFormProps {
  user: UserProfile;
  bloodGroups: { value: BloodGroup; label: string }[];
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

function ProfileForm({ user, bloodGroups, updateProfile }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "+91 98765 00001");
  const [org, setOrg] = useState(user.org || "");
  const [location, setLocation] = useState(user.location);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user.bloodGroup);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone, org, location, bloodGroup });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Identity Card */}
      <Card className="mb-6 shadow-2xs">
        <CardBody className="p-4 sm:p-5 flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">{user.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <BloodGroupChip group={user.bloodGroup} size="sm" />
              <span className="text-xs text-success flex items-center gap-1 font-semibold">
                <ShieldCheck size={13} /> Verified Citizen Profile
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <form onSubmit={submit} className="space-y-5">
        <Card className="shadow-2xs">
          <CardHeader title="Personal & Contact Information" />
          <CardBody className="pt-0 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>

              <Field label="Emergency contact phone" required hint="Used for urgent dispatch notifications">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  required
                />
              </Field>
            </div>

            <Field label="Organization / affiliation" hint="e.g. Hospital coordinator, Family advocate, Individual">
              <Input value={org} onChange={(e) => setOrg(e.target.value)} />
            </Field>

            <Field label="City / district" required>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
            </Field>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Your Blood Group <span className="text-critical">*</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {bloodGroups.map((bg) => {
                  const isSelected = bloodGroup === bg.value;
                  return (
                    <button
                      key={bg.value}
                      type="button"
                      onClick={() => setBloodGroup(bg.value)}
                      className={cn(
                        "h-10 rounded-xl font-num font-bold text-sm border transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs scale-105"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      )}
                    >
                      {bg.value}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Action button & save feedback */}
        <div className="flex items-center justify-between gap-4">
          {saved && (
            <span className="text-xs sm:text-sm font-bold text-success flex items-center gap-1.5 animate-bl-fade-up">
              <CheckCircle size={16} /> Changes saved successfully
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit" size="md" loading={saving} className="shadow-xs">
              {saving ? "Saving changes…" : "Save profile changes"}
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
    <AppShell title="Profile & Preferences" active="/app/profile">
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold tracking-tight mb-1 lg:hidden text-foreground">Account Profile</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-5">
          Manage your verified donor identity, emergency phone, and location
        </p>

        {error && (
          <div className="mb-6">
            <ErrorState message={error} retry={refetch} />
          </div>
        )}

        {loading || !user ? (
          <div className="space-y-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          <ProfileForm key={user.id} user={user} bloodGroups={bloodGroups} updateProfile={updateProfile} />
        )}
      </div>
    </AppShell>
  );
}
