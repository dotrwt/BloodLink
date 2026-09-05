import { useState, type FormEvent } from "react";
import { Link, useRouter } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Field, Input, Select } from "../components/ui/Field";
import { Card, CardBody } from "../components/ui/Card";
import { Logo } from "../components/layout/AppShell";
import { userService } from "../services/userService";
import { useOptions } from "../hooks/useOptions";
import type { Role, BloodGroup } from "../types/models";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Check,
  DropletFill,
  ShieldCheck,
  User,
} from "../lib/icons";

interface RoleOption {
  id: Role;
  title: string;
  badge?: string;
  description: string;
  icon: typeof User;
  features: string[];
}

const ROLES: RoleOption[] = [
  {
    id: "requester",
    title: "Requester",
    badge: "Most common",
    description: "Raise an emergency request for a patient and track it to confirmation.",
    icon: User,
    features: [
      "Create requests in seconds",
      "See ranked donors & banks",
      "Live status tracking",
    ],
  },
  {
    id: "donor",
    title: "Donor",
    description: "Respond to nearby emergencies and help patients when it counts.",
    icon: DropletFill,
    features: [
      "One-tap emergency response",
      "Manage availability",
      "Track your eligibility",
    ],
  },
  {
    id: "bank",
    title: "Blood Bank",
    description: "Manage inventory, triage requests and reserve units — for verified institutions.",
    icon: Building,
    features: [
      "Expiry-aware inventory",
      "Incoming request queue",
      "Reserve & fulfil",
    ],
  },
];

export default function RoleSelect() {
  const { navigate } = useRouter();
  const { bloodGroups } = useOptions();

  const [selectedRole, setSelectedRole] = useState<Role>("requester");
  const [step, setStep] = useState<"select" | "register">("select");

  // Registration Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [affiliation, setAffiliation] = useState("");
  const [location, setLocation] = useState("Bengaluru");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRoleData = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  function handleContinue() {
    setStep("register");
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all required fields to create your account.");
      return;
    }

    setLoading(true);
    try {
      // Save profile details to in-memory store
      await userService.updateProfile({
        name,
        email,
        role: selectedRole,
        bloodGroup,
        location: location || "Bengaluru",
        org: affiliation || (selectedRole === "bank" ? "Sanjeevani Blood Centre" : "Individual"),
      });

      // Navigate directly into the chosen dashboard
      if (selectedRole === "donor") {
        navigate("/app/donor");
      } else if (selectedRole === "bank") {
        navigate("/app/bank");
      } else {
        navigate("/app/requester");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete signup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-[#fcfbf9] dark:bg-background flex flex-col">
      {/* Top bar with Logo and Log in */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-5 py-12 lg:py-16 w-full flex flex-col justify-center">
        {step === "select" ? (
          <>
            {/* Header copy */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                How will you use BloodLink?
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Choose a role to continue. You can switch or add roles later.
              </p>
            </div>

            {/* 3 Selectable Cards matching exact design */}
            <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto w-full items-stretch">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.id;
                const IconComponent = role.icon;

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer bg-card ${
                      isSelected
                        ? "border-2 border-primary shadow-md ring-1 ring-primary/25 bg-primary-soft/[0.04]"
                        : "border border-border/80 hover:border-border shadow-xs hover:shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Top icon and badge */}
                      <div className="flex items-start justify-between mb-5">
                        <span
                          className={`flex size-11 items-center justify-center rounded-xl transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/70 text-muted-foreground"
                          }`}
                        >
                          <IconComponent size={20} />
                        </span>

                        {role.badge && (
                          <span className="text-[11px] font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                            {role.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Selection Checkmark */}
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{role.title}</h3>
                        {isSelected && (
                          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {role.description}
                      </p>

                      {/* Feature Bullet List */}
                      <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                        {role.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check size={14} className="text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <Button
                size="lg"
                className="px-8 py-3 rounded-xl font-semibold shadow-sm"
                onClick={handleContinue}
                rightIcon={<ArrowRight size={17} />}
              >
                Continue as {activeRoleData.title}
              </Button>

              <p className="text-sm text-muted-foreground">
                Already registered?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* Step 2: Quick Sign Up / Credentials Form */
          <div className="max-w-md mx-auto w-full">
            <button
              type="button"
              onClick={() => setStep("select")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
            >
              <ArrowLeft size={16} /> Choose a different role
            </button>

            <Card className="shadow-lg border-border">
              <CardBody className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <activeRoleData.icon size={16} />
                  </span>
                  <span className="text-xs font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                    {activeRoleData.title} Account
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign up to access your dedicated {activeRoleData.title} dashboard.
                </p>

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-critical-soft text-critical text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <Field label="Full name" required>
                    <Input
                      placeholder="e.g. Ananya Rao"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Email address" required>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Password" required>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Field>

                  {/* Conditional role fields */}
                  {selectedRole === "donor" && (
                    <Field label="Your blood group" required>
                      <Select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      >
                        {bloodGroups.map((bg) => (
                          <option key={bg.value} value={bg.value}>
                            {bg.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  )}

                  {selectedRole === "bank" && (
                    <Field label="Blood Bank / Institution Name" required>
                      <Input
                        placeholder="e.g. Sanjeevani Blood Centre"
                        value={affiliation}
                        onChange={(e) => setAffiliation(e.target.value)}
                        required
                      />
                    </Field>
                  )}

                  {selectedRole === "requester" && (
                    <Field label="Hospital / Affiliation (optional)">
                      <Input
                        placeholder="e.g. Manipal Hospital, or Family advocate"
                        value={affiliation}
                        onChange={(e) => setAffiliation(e.target.value)}
                      />
                    </Field>
                  )}

                  <Field label="City / Location">
                    <Input
                      placeholder="e.g. Indiranagar, Bengaluru"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </Field>

                  <div className="pt-2 space-y-2.5">
                    <Button type="submit" size="lg" fullWidth loading={loading}>
                      {loading ? "Creating account…" : `Create ${activeRoleData.title} account`}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(
                          selectedRole === "donor"
                            ? "/app/donor"
                            : selectedRole === "bank"
                            ? "/app/bank"
                            : "/app/requester"
                        );
                      }}
                      className="w-full text-center text-xs font-semibold text-primary hover:underline py-1 cursor-pointer"
                    >
                      Instant Demo Mode: Enter {activeRoleData.title} Workspace →
                    </button>
                  </div>
                </form>

                <p className="mt-5 text-xs text-muted-foreground text-center">
                  Already registered?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Log in
                  </Link>
                </p>
              </CardBody>
            </Card>

            <div className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-success" />
              <span>Free, private, and secure emergency medical network</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
