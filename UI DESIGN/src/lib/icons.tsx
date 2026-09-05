import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Droplet = (p: P) => (
  <Svg {...p}>
    <path d="M12 2.5s6 6.3 6 10.5a6 6 0 0 1-12 0C6 8.8 12 2.5 12 2.5Z" />
  </Svg>
);
export const DropletFill = ({ size = 20, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M12 2.5s6 6.3 6 10.5a6 6 0 0 1-12 0C6 8.8 12 2.5 12 2.5Z" />
  </svg>
);
export const Heart = (p: P) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.35-9.2-8.5C1.3 8.6 2.7 5.5 5.7 5.1c1.9-.25 3.4.9 4.3 2.2.9-1.3 2.4-2.45 4.3-2.2 3 .4 4.4 3.5 2.9 6.4C19 15.65 12 20 12 20Z" />
  </Svg>
);
export const MapPin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 18.5 10.8C18.5 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.4" />
  </Svg>
);
export const Clock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Svg>
);
export const Phone = (p: P) => (
  <Svg {...p}>
    <path d="M6.6 4.5h3l1.4 3.5-2 1.4a11 11 0 0 0 5.1 5.1l1.4-2 3.5 1.4v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 5.1 6.1 1.5 1.5 0 0 1 6.6 4.5Z" />
  </Svg>
);
export const Check = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  </Svg>
);
export const CheckCircle = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.3 12.3 11 15l4.6-5.4" />
  </Svg>
);
export const X = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const XCircle = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </Svg>
);
export const ChevronRight = (p: P) => (
  <Svg {...p}><path d="M9 5l7 7-7 7" /></Svg>
);
export const ChevronLeft = (p: P) => (
  <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>
);
export const ChevronDown = (p: P) => (
  <Svg {...p}><path d="M5 9l7 7 7-7" /></Svg>
);
export const ArrowRight = (p: P) => (
  <Svg {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Svg>
);
export const ArrowLeft = (p: P) => (
  <Svg {...p}><path d="M20 12H5M11 6l-6 6 6 6" /></Svg>
);
export const Bell = (p: P) => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 4 1.2 5.5 2 6.5H4c.8-1 2-2.5 2-6.5Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Svg>
);
export const User = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 19.5a7 7 0 0 1 14 0" />
  </Svg>
);
export const Settings = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" />
  </Svg>
);
export const Plus = (p: P) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const Search = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);
export const Filter = (p: P) => (
  <Svg {...p}><path d="M4 6h16l-6 7v5l-4 2v-7L4 6Z" /></Svg>
);
export const AlertTriangle = (p: P) => (
  <Svg {...p}>
    <path d="M12 4.5 21 19H3l9-14.5Z" />
    <path d="M12 10v4M12 16.5v.01" />
  </Svg>
);
export const Activity = (p: P) => (
  <Svg {...p}><path d="M3 12h4l3 7 4-14 3 7h4" /></Svg>
);
export const ShieldCheck = (p: P) => (
  <Svg {...p}>
    <path d="M12 3l7 2.5v5c0 5-3.4 8.2-7 9.5-3.6-1.3-7-4.5-7-9.5v-5L12 3Z" />
    <path d="M9 12l2 2 4-4.5" />
  </Svg>
);
export const Building = (p: P) => (
  <Svg {...p}>
    <path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" />
    <path d="M15 9h3a1 1 0 0 1 1 1v11M3 21h18M8 8h0M11 8h0M8 12h0M11 12h0M8 16h0M11 16h0" />
  </Svg>
);
export const Menu = (p: P) => (
  <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
);
export const Calendar = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="5.5" width="16" height="15" rx="2" />
    <path d="M8 3.5v4M16 3.5v4M4 10h16" />
  </Svg>
);
export const Navigation = (p: P) => (
  <Svg {...p}><path d="M20 4 4 11l7 2 2 7 7-16Z" /></Svg>
);
export const Truck = (p: P) => (
  <Svg {...p}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17.5" cy="18" r="1.8" />
  </Svg>
);
export const Zap = (p: P) => (
  <Svg {...p}><path d="M13 3 5 13h6l-1 8 8-11h-6l1-7Z" /></Svg>
);
export const Users = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="9" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6M17 14.2a5.5 5.5 0 0 1 3.5 4.8" />
  </Svg>
);
export const Package = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 20 7v10l-8 4-8-4V7l8-4Z" />
    <path d="M4 7l8 4 8-4M12 11v10" />
  </Svg>
);
export const List = (p: P) => (
  <Svg {...p}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></Svg>
);
export const Home = (p: P) => (
  <Svg {...p}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 10v9h12v-9" />
  </Svg>
);
export const Star = (p: P) => (
  <Svg {...p}>
    <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z" />
  </Svg>
);
export const Info = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8v.01" />
  </Svg>
);
export const LogOut = (p: P) => (
  <Svg {...p}>
    <path d="M14 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8" />
    <path d="M17 8l4 4-4 4M9 12h12" />
  </Svg>
);
export const Circle = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /></Svg>
);
export const TrendingDown = (p: P) => (
  <Svg {...p}><path d="M4 7l6 6 4-4 6 6M20 15v-4h-4" /></Svg>
);
export const Sliders = (p: P) => (
  <Svg {...p}>
    <path d="M4 8h9M17 8h3M4 16h3M11 16h9" />
    <circle cx="15" cy="8" r="2" />
    <circle cx="9" cy="16" r="2" />
  </Svg>
);
export const Hospital = (p: P) => (
  <Svg {...p}>
    <path d="M4 21V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v15M3 21h18" />
    <path d="M12 8v5M9.5 10.5h5" />
  </Svg>
);
