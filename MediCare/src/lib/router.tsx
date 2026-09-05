/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Tiny hash-based router — self-contained, no dependencies.
 * Paths look like "/app/requester/matches/req-201".
 */

type RouterCtx = {
  path: string;
  navigate: (to: string) => void;
  back: () => void;
};

const Ctx = createContext<RouterCtx | null>(null);

function readHash(): string {
  const raw = window.location.hash.replace(/^#/, "");
  return raw.length ? raw : "/";
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() => readHash());

  useEffect(() => {
    if (!window.location.hash) window.location.hash = "#/";
    const onHash = () => setPath(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = "#" + to;
    // scroll main region to top on navigation
    requestAnimationFrame(() => {
      const main = document.getElementById("bl-scroll");
      if (main) main.scrollTop = 0;
      else window.scrollTo({ top: 0 });
    });
  }, []);

  const back = useCallback(() => window.history.back(), []);

  const value = useMemo(() => ({ path, navigate, back }), [path, navigate, back]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRouter(): RouterCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRouter must be used inside RouterProvider");
  return ctx;
}

/** Match a pattern like "/app/requester/matches/:id" against the current path. */
export function matchPath(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const pSeg = pattern.split("/").filter(Boolean);
  const aSeg = path.split("?")[0].split("/").filter(Boolean);
  if (pSeg.length !== aSeg.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(":")) params[pSeg[i].slice(1)] = decodeURIComponent(aSeg[i]);
    else if (pSeg[i] !== aSeg[i]) return null;
  }
  return params;
}

export function Link({
  to,
  className,
  children,
  onClick,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={"#" + to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
