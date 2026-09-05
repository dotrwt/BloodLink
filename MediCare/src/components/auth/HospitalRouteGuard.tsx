import { useState, type ReactNode } from "react";
import { Link } from "../../lib/router";
import { Button } from "../ui/Button";
import { Card, CardBody } from "../ui/Card";
import { Logo } from "../layout/AppShell";
import { getStoredUser, getToken } from "../../services/apiClient";
import {
  AlertTriangle,
  Building,
} from "../../lib/icons";

interface HospitalRouteGuardProps {
  children: ReactNode;
}

const DEV_KEY = "bloodlink_dev_mode";

export function HospitalRouteGuard({ children }: HospitalRouteGuardProps) {
  const [devBypass, setDevBypass] = useState<boolean>(() => {

    try {
      return sessionStorage.getItem(DEV_KEY) === "true";
    } catch {
      return false;
    }
  });

  const token = getToken();
  const user = getStoredUser();

  const userRole = (user?.role || "").toLowerCase();
  const isAuthorizedHospital =
    !!token &&
    (userRole === "bank" ||
      userRole === "hospital" ||
      userRole === "admin" ||
      user?.role === "BLOOD_BANK" ||
      user?.role === "HOSPITAL");

  function enableDevMode() {
    try {
      sessionStorage.setItem(DEV_KEY, "true");
    } catch {
      /* ignore */
    }
    setDevBypass(true);
  }

  function disableDevMode() {
    try {
      sessionStorage.removeItem(DEV_KEY);
    } catch {
      /* ignore */
    }
    setDevBypass(false);
  }

  // If authorized hospital or developer mode is active, allow access
  if (isAuthorizedHospital || devBypass) {
    return (
      <div className="min-h-full flex flex-col">
        {devBypass && !isAuthorizedHospital && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs flex items-center justify-between flex-wrap gap-2 sticky top-0 z-50 backdrop-blur-md">
            <div className="flex items-center gap-2 font-medium">
              <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
              <strong>Developer Mode Active:</strong> Hospital panel access unlocked for
              development &amp; inspection.
            </div>
            <button
              onClick={disableDevMode}
              className="font-bold underline hover:text-foreground cursor-pointer text-[11px]"
            >
              Exit Developer Mode
            </button>
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  // Access Denied / Authorization Screen
  return (
    <div className="min-h-full bg-[#fcfbf9] dark:bg-background flex flex-col">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/app/requester">
              <Button variant="ghost" size="sm">
                Requester Hub
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Hospital Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto px-5 py-14 flex flex-col justify-center w-full">
        <Card className="border-border shadow-xl overflow-hidden">
          {/* Header warning strip */}
          <div className="bg-critical/10 border-b border-critical/20 p-6 flex items-center gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-critical text-white shadow-md">
              <AlertTriangle size={24} />
            </span>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-critical">
                Restricted Healthcare Sector
              </span>
              <h1 className="text-xl font-bold text-foreground">
                Hospital &amp; Blood Bank Authorization Required
              </h1>
            </div>
          </div>

          <CardBody className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Access to the <strong>Blood Bank &amp; Hospital Inventory Portal</strong> is
                strictly restricted to verified clinical blood centers, registered hospital
                transfusion officers, and accredited institutions.
              </p>
              <p>
                Patient requesters and individual voluntary blood donors do not have access to
                institutional inventory controls or internal hospital triage queues.
              </p>
            </div>

            {/* Verification highlights */}
            <div className="rounded-2xl bg-muted/60 border border-border p-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Building size={16} className="text-primary" /> Required Credentials:
              </div>
              <ul className="space-y-2 pl-6 list-disc">
                <li>Government or State Blood Transfusion Council license number</li>
                <li>Authorized institutional email address (@hospital.org)</li>
                <li>Hospital administrative credentials verified by BloodLink</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Link to="/login" className="block w-full">
                <Button size="lg" fullWidth leftIcon={<Building size={16} />}>
                  Sign in with Hospital Credentials
                </Button>
              </Link>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link to="/select-role" className="flex-1">
                  <Button variant="outline" size="md" fullWidth>
                    Register New Institution
                  </Button>
                </Link>
                <Link to="/app/requester" className="flex-1">
                  <Button variant="ghost" size="md" fullWidth>
                    Back to Requester Hub
                  </Button>
                </Link>
              </div>
            </div>

            {/* Developer Override Option ("except hamara abhi developer ko") */}
            <div className="mt-8 pt-6 border-t border-dashed border-border flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-2">
                Developer &amp; Testing Access
              </span>
              <p className="text-xs text-muted-foreground max-w-sm mb-3">
                Need to test hospital inventory during active development without hospital credentials?
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 text-xs font-semibold"
                onClick={enableDevMode}
              >
                Developer Override: Open Hospital Panel
              </Button>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
