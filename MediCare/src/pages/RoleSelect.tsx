import { useState, type FormEvent } from "react";
import { Link, useRouter } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Field, Input, Select } from "../components/ui/Field";
import { Card, CardBody } from "../components/ui/Card";
import { Logo } from "../components/layout/AppShell";
import { authService } from "../services/authService";
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
    badge: "Emergency & Patient",
    description: "Raise an emergency request for a patient and track it live to confirmation.",
    icon: User,
    features: [
      "Create emergency requests in seconds",
      "Ranked matches by distance & compatibility",
      "Live GPS tracking when donor accepts",
    ],
  },
  {
    id: "donor",
    title: "Donor",
    description: "Respond to nearby emergencies and help save lives when minutes matter.",
    icon: DropletFill,
    features: [
      "Emergency broadcast notifications",
      "One-tap request accept & live route navigation",
      "Manage availability & donation history",
    ],
  },
  {
    id: "bank",
    title: "Blood Bank / Hospital",
    description: "Manage blood inventory, triage requests and reserve emergency units.",
    icon: Building,
    features: [
      "Real-time expiry & safe threshold tracking",
      "Incoming patient request triage queue",
      "Unit reservations & dispatch coordination",
    ],
  },
];

export default function RoleSelect() {
  const { navigate } = useRouter();
  const { bloodGroups } = useOptions();

  const [selectedRole, setSelectedRole] = useState<Role>("requester");
  const [step, setStep] = useState<"select" | "register">("select");

  // Common credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Donor-specific fields
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [age, setAge] = useState<number | "">(26);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [isAvailable, setIsAvailable] = useState(true);

  // Requester-specific fields
  const [relationship, setRelationship] = useState<
    "SELF" | "FAMILY" | "HOSPITAL_STAFF" | "OTHER"
  >("SELF");

  // Bank-specific fields
  const [bankName, setBankName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bankType, setBankType] = useState<
    "GOVERNMENT" | "PRIVATE" | "RED_CROSS"
  >("PRIVATE");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("474001");
  const [contactPerson, setContactPerson] = useState("");
  const [designation, setDesignation] = useState("Blood Bank Officer");

  // Geographic fields
  const [city, setCity] = useState("Bengaluru");
  const [area, setArea] = useState("Indiranagar");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRoleData = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  function handleContinue() {
    setError("");
    setStep("register");
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      let targetPath = "/app/requester";

      if (selectedRole === "donor") {
        if (!name || !phone) {
          throw new Error("Please enter your full name and phone number.");
        }
        const res = await authService.signupDonor({
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirm_password: confirmPassword,
          blood_group: bloodGroup,
          age: age ? Number(age) : undefined,
          gender,
          city: city.trim() || undefined,
          area: area.trim() || undefined,
          is_available: isAvailable,
        });
        targetPath = res.targetPath;
      } else if (selectedRole === "bank") {
        if (!bankName || !phone) {
          throw new Error("Please enter blood bank name and phone number.");
        }
        const res = await authService.signupBloodBank({
          blood_bank_name: bankName.trim(),
          official_email: email.trim(),
          phone: phone.trim(),
          password,
          confirm_password: confirmPassword,
          license_number: licenseNumber.trim() || undefined,
          blood_bank_type: bankType,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          pincode: pincode.trim() || undefined,
          contact_person_name: (contactPerson || name).trim() || undefined,
          contact_person_designation: designation.trim() || undefined,
        });
        targetPath = res.targetPath;
      } else {
        // Requester
        if (!name || !phone) {
          throw new Error("Please enter your full name and phone number.");
        }
        const res = await authService.signupRequester({
          full_name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirm_password: confirmPassword,
          city: city.trim() || undefined,
          area: area.trim() || undefined,
          relationship_to_patient: relationship,
        });
        targetPath = res.targetPath;
      }

      navigate(targetPath);
    } catch (err: any) {
      setError(
        err?.message || "Failed to create account. Please check your inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-[#fcfbf9] dark:bg-background flex flex-col">
      {/* Top bar with Logo and Log in */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-5 py-10 lg:py-14 w-full flex flex-col justify-center">
        {step === "select" ? (
          <>
            {/* Header copy */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                How will you use BloodLink?
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Choose your role to get started with an authentic, isolated workspace.
              </p>
            </div>

            {/* 3 Selectable Cards */}
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
                            <Check
                              size={14}
                              className="text-primary shrink-0 mt-0.5"
                              strokeWidth={2.5}
                            />
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
          /* Step 2: Role-Specific Credentials Form */
          <div className="max-w-xl mx-auto w-full">
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
                    {activeRoleData.title} Registration
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in your {activeRoleData.title.toLowerCase()} details to activate your
                  portal.
                </p>

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-critical-soft text-critical text-xs font-medium border border-critical/20">
                      {error}
                    </div>
                  )}

                  {/* Role-Specific Identity Fields */}
                  {selectedRole === "bank" ? (
                    <>
                      <Field label="Blood Bank / Hospital Name" required>
                        <Input
                          placeholder="e.g. Apollo Hospital Blood Bank"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          required
                        />
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Official Email" required>
                          <Input
                            type="email"
                            placeholder="bloodbank@apollo.org"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </Field>
                        <Field label="Emergency Hotline Phone" required>
                          <Input
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="License Number">
                          <Input
                            placeholder="e.g. BB-2026-9812"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                          />
                        </Field>
                        <Field label="Institution Type">
                          <Select
                            value={bankType}
                            onChange={(e) =>
                              setBankType(e.target.value as "GOVERNMENT" | "PRIVATE" | "RED_CROSS")
                            }
                          >
                            <option value="PRIVATE">Private Hospital / Center</option>
                            <option value="GOVERNMENT">Government Hospital</option>
                            <option value="RED_CROSS">Red Cross Blood Bank</option>
                          </Select>
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <Field label="Street Address">
                            <Input
                              placeholder="15th Cross, Ring Road"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                            />
                          </Field>
                        </div>
                        <Field label="Pincode">
                          <Input
                            placeholder="474001"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Authorized Contact Person">
                          <Input
                            placeholder="Dr. Rajesh Kumar"
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                          />
                        </Field>
                        <Field label="Designation">
                          <Input
                            placeholder="Chief Medical Officer"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                          />
                        </Field>
                      </div>
                    </>
                  ) : (
                    <>
                      <Field label="Full Name" required>
                        <Input
                          placeholder="e.g. Ananya Rao"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Email address" required>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </Field>
                        <Field label="Phone number" required>
                          <Input
                            placeholder="+91 98765 00001"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </Field>
                      </div>
                    </>
                  )}

                  {/* Donor Specific Attributes */}
                  {selectedRole === "donor" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Blood Group" required>
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

                      <Field label="Age">
                        <Input
                          type="number"
                          placeholder="25"
                          min={18}
                          max={65}
                          value={age}
                          onChange={(e) =>
                            setAge(e.target.value ? Number(e.target.value) : "")
                          }
                        />
                      </Field>

                      <Field label="Gender">
                        <Select
                          value={gender}
                          onChange={(e) =>
                            setGender(e.target.value as "MALE" | "FEMALE" | "OTHER")
                          }
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </Select>
                      </Field>
                    </div>
                  )}

                  {/* Requester Specific Attributes */}
                  {selectedRole === "requester" && (
                    <Field label="Relationship to Patient">
                      <Select
                        value={relationship}
                        onChange={(e) =>
                          setRelationship(
                            e.target.value as
                              | "SELF"
                              | "FAMILY"
                              | "HOSPITAL_STAFF"
                              | "OTHER"
                          )
                        }
                      >
                        <option value="SELF">Patient / Self</option>
                        <option value="FAMILY">Family Member</option>
                        <option value="HOSPITAL_STAFF">Hospital Staff / Doctor</option>
                        <option value="OTHER">Friend / Volunteer Advocate</option>
                      </Select>
                    </Field>
                  )}

                  {/* City & Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="City">
                      <Input
                        placeholder="Bengaluru"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </Field>
                    <Field label="Area / Locality">
                      <Input
                        placeholder="Indiranagar"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                      />
                    </Field>
                  </div>

                  {/* Donor Availability Toggle */}
                  {selectedRole === "donor" && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="size-4 rounded text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          Available for emergency donation
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          You will receive emergency alerts when compatible patients are nearby.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Password" required>
                      <Input
                        type="password"
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Confirm Password" required>
                      <Input
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </Field>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <Button type="submit" size="lg" fullWidth loading={loading}>
                      {loading
                        ? "Registering authentic account…"
                        : `Register as ${activeRoleData.title}`}
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
