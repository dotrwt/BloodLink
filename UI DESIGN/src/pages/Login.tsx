import { useState, type FormEvent } from "react";
import { Link, useRouter } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { Logo } from "../components/layout/AppShell";
import { DropletFill, ShieldCheck } from "../lib/icons";

export default function Login() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !pw) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/select-role");
    }, 900);
  }

  return (
    <div className="min-h-full grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(50% 40% at 80% 20%, rgba(255,255,255,0.18), transparent 70%)" }}
        />
        <Link to="/" className="relative"><Logo className="text-primary-foreground" /></Link>
        <div className="relative">
          <blockquote className="text-2xl font-display font-semibold leading-snug max-w-md">
            "We found an O- donor 2 km away in under ten minutes. BloodLink gave us
            back time we didn't have."
          </blockquote>
          <p className="mt-4 text-primary-foreground/80 text-sm">
            — Dr. Anita Verma, Emergency Medicine
          </p>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-primary-foreground/80">
          <ShieldCheck size={18} /> Trusted by 240+ verified blood banks
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden inline-block mb-8"><Logo /></Link>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-5">
            <DropletFill size={24} />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-muted-foreground text-sm">
            Log in to manage requests, donations and inventory.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="Email" required>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!error && !email}
                autoComplete="email"
              />
            </Field>
            <Field
              label="Password"
              required
              hint={<a className="text-primary hover:underline" href="#/login">Forgot?</a>}
            >
              <Input
                type="password"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                invalid={!!error && !pw}
                autoComplete="current-password"
              />
            </Field>
            {error && (
              <p className="text-sm text-critical bg-critical-soft rounded-lg px-3 py-2 font-medium">
                {error}
              </p>
            )}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            New to BloodLink?{" "}
            <Link to="/select-role" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
