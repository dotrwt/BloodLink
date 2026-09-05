import { useState, type FormEvent } from "react";
import { Link, useRouter } from "../lib/router";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { Logo } from "../components/layout/AppShell";
import { DropletFill, ShieldCheck } from "../lib/icons";
import { authService } from "../services/authService";

export default function Login() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function performLogin(loginEmail: string, loginPw: string) {
    setError("");
    if (!loginEmail || !loginPw) {
      setError("Please enter both your registered email address and password.");
      return;
    }

    setLoading(true);
    try {
      const { targetPath } = await authService.login(loginEmail.trim(), loginPw);
      navigate(targetPath);
    } catch (err: any) {
      setError(
        err?.message || "Invalid credentials. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    performLogin(email, pw);
  }

  return (
    <div className="min-h-full grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(50% 40% at 80% 20%, rgba(255,255,255,0.18), transparent 70%)",
          }}
        />
        <Link to="/" className="relative">
          <Logo className="text-primary-foreground" />
        </Link>
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
          <ShieldCheck size={18} /> Trusted by verified blood banks, hospitals &amp; donors
        </div>
      </div>

      {/* Clean Authentic Login Form */}
      <div className="flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-block mb-6">
            <Logo />
          </Link>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-4">
            <DropletFill size={24} />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to BloodLink</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Enter your credentials to access your secure portal.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {error && (
              <div className="text-sm text-critical bg-critical-soft border border-critical/20 rounded-xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            <Field label="Email address" required>
              <Input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!error && !email}
                autoComplete="email"
                required
              />
            </Field>

            <Field label="Password" required>
              <Input
                type="password"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                invalid={!!error && !pw}
                autoComplete="current-password"
                required
              />
            </Field>

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" loading={loading}>
                {loading ? "Authenticating…" : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-border flex items-center justify-center text-xs text-muted-foreground">
            <span>
              Don't have an account?{" "}
              <Link to="/select-role" className="text-primary font-semibold hover:underline">
                Get started &amp; choose your role
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
