import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  Activity,
  Navigation,
  Phone,
  Play,
  RotateCcw,
  ShieldCheck,
} from "../../lib/icons";

interface LiveDonorMapProps {
  donorName?: string;
  donorBloodGroup?: string;
  donorPhone?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  status?: string;
  className?: string;
}

// Route waypoints simulating route in Bengaluru from Indiranagar to Manipal Hospital
const DEFAULT_ROUTE: [number, number][] = [
  [12.9784, 77.6408], // Donor Start (100 Feet Rd, Indiranagar)
  [12.9745, 77.6415], // CMH Road Junction
  [12.9698, 77.6432], // Domlur Flyover entry
  [12.9652, 77.6475], // Airport Road transition
  [12.9615, 77.6512], // HAL Old Airport Rd
  [12.9592, 77.6534], // Destination (Manipal Hospital Emergency)
];

export function LiveDonorMap({
  donorName = "Rahul Sharma",
  donorBloodGroup = "O-",
  donorPhone = "+91 98765 43210",
  hospitalName = "Manipal Hospital, Old Airport Rd",
  hospitalAddress = "HAL 2nd Stage, Bengaluru",
  status = "accepted",
  className = "",
}: LiveDonorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const donorMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Simulation progress index (0 to 1)
  const [progress, setProgress] = useState(0.25);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(32);

  // Compute interpolated position along the route
  const totalSegments = DEFAULT_ROUTE.length - 1;
  const currentSegmentIndex = Math.min(
    Math.floor(progress * totalSegments),
    totalSegments - 1
  );
  const segmentFraction = progress * totalSegments - currentSegmentIndex;

  const p1 = DEFAULT_ROUTE[currentSegmentIndex];
  const p2 = DEFAULT_ROUTE[currentSegmentIndex + 1];

  const currentLat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
  const currentLng = p1[1] + (p2[1] - p1[1]) * segmentFraction;

  // Calculate remaining distance in km
  const totalDistKm = 2.8;
  const remainingDist = Math.max(0.1, totalDistKm * (1 - progress));
  const estimatedMins = Math.max(1, Math.round(remainingDist * 3.8));

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map instance
    const map = L.map(mapContainerRef.current, {
      center: [12.9688, 77.6471],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add high contrast tile layer (OpenStreetMap Standard)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    // Subtle zoom control at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Full glowing route path
    const routeLine = L.polyline(DEFAULT_ROUTE, {
      color: "#0d6b63",
      weight: 6,
      opacity: 0.75,
      dashArray: "10, 8",
      lineCap: "round",
    }).addTo(map);

    routePolylineRef.current = routeLine;

    // Destination Hospital Marker
    const hospitalCoords = DEFAULT_ROUTE[DEFAULT_ROUTE.length - 1];
    const hospitalIcon = L.divIcon({
      className: "custom-hospital-marker",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            width: 38px;
            height: 38px;
            border-radius: 12px;
            background: #d21f3c;
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(210,31,60,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #ffffff;
            font-weight: 800;
            font-size: 16px;
          ">
            +
          </div>
          <div style="
            position: absolute;
            top: -24px;
            white-space: nowrap;
            background: #1e293b;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 9999px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            Emergency Destination
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    L.marker(hospitalCoords, { icon: hospitalIcon })
      .addTo(map)
      .bindPopup(
        `<strong>${hospitalName}</strong><br/><span style="font-size:12px;color:#64748b;">${hospitalAddress}</span>`
      );

    // Donor Moving Marker
    const donorIcon = L.divIcon({
      className: "custom-donor-marker",
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <!-- Pulsing sonar beacon -->
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 9999px;
            background: rgba(13, 107, 99, 0.35);
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <!-- Center Pin -->
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            background: #0d6b63;
            color: #ffffff;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 12px rgba(13, 107, 99, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
          ">
            🩸
          </div>
          <!-- Donor Blood Badge -->
          <div style="
            position: absolute;
            bottom: -18px;
            white-space: nowrap;
            background: #0f172a;
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 9999px;
            border: 1px solid rgba(255,255,255,0.2);
          ">
            ${donorBloodGroup} Donor
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const donorMarker = L.marker([DEFAULT_ROUTE[0][0], DEFAULT_ROUTE[0][1]], {
      icon: donorIcon,
    }).addTo(map);

    donorMarker.bindPopup(
      `<strong>${donorName}</strong> (${donorBloodGroup})<br/><span style="color:#0d6b63;font-size:12px;font-weight:600;">En route to emergency patient</span>`
    );

    donorMarkerRef.current = donorMarker;
    mapInstanceRef.current = map;

    // Fit route bounds nicely
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [donorBloodGroup, donorName, hospitalAddress, hospitalName]);

  // Handle smooth simulation progression
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.98) {
          return 0.98; // Stay near hospital
        }
        return prev + 0.015;
      });

      // Random speed fluctuations between 28 - 38 km/h
      setCurrentSpeed(Math.floor(28 + Math.random() * 10));
    }, 1800);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Update donor marker position on map when progress updates
  useEffect(() => {
    if (donorMarkerRef.current) {
      donorMarkerRef.current.setLatLng([currentLat, currentLng]);
    }
  }, [currentLat, currentLng]);

  function centerOnDonor() {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLat, currentLng], 15, {
        animate: true,
      });
    }
  }

  function centerOnRoute() {
    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), {
        padding: [50, 50],
        animate: true,
      });
    }
  }

  function resetSim() {
    setProgress(0.05);
  }

  const statusLabel =
    status === "en_route"
      ? "En Route to Destination"
      : status === "confirmed"
      ? "Arrived at Hospital"
      : "Accepted by Donor";

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-border shadow-md bg-card ${className}`}
    >
      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[360px] sm:h-[420px] bg-[#e6ecea] relative z-0"
      />

      {/* Floating Header HUD: GPS Streaming Active */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 max-w-[85%] pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Badge
            tone="critical"
            className="shadow-md backdrop-blur-md bg-critical/90 text-white font-semibold py-1 px-2.5 flex items-center gap-1.5"
          >
            <span className="size-2 rounded-full bg-white animate-ping" />
            <Activity size={13} className="animate-pulse" />
            LIVE DONOR GPS
          </Badge>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-background/90 backdrop-blur px-2.5 py-1 rounded-full border border-border/80 shadow-xs text-muted-foreground">
            <ShieldCheck size={13} className="text-success" /> Satellite Encrypted
          </span>
        </div>

        {/* Current status summary pill */}
        <div className="bg-background/95 backdrop-blur-md border border-border/80 rounded-2xl p-2.5 shadow-lg pointer-events-auto max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xs">
              {donorBloodGroup}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-foreground flex items-center gap-1.5">
                {donorName}
                <span className="text-[10px] font-medium text-success bg-success-soft px-1.5 py-0.5 rounded">
                  {statusLabel}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Destination: {hospitalName.split(",")[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Telemetry Stats HUD (Top Right) */}
      <div className="absolute top-3 right-3 z-10 pointer-events-auto">
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-lg flex flex-col gap-2 min-w-[130px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Estimated Arrival
            </span>
            <span className="text-lg font-extrabold text-primary font-num flex items-center gap-1">
              ~{estimatedMins} min
            </span>
          </div>

          <div className="border-t border-border/60 pt-1.5 flex justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">Distance</span>
              <span className="font-semibold text-foreground font-num">
                {remainingDist.toFixed(1)} km
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Speed</span>
              <span className="font-semibold text-foreground font-num">
                {currentSpeed} km/h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Controls Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-background/90 backdrop-blur-md p-1.5 rounded-2xl border border-border/80 shadow-md">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs px-2.5"
            onClick={centerOnDonor}
            leftIcon={<Navigation size={13} className="text-primary" />}
          >
            Locate Donor
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs px-2.5 hidden sm:inline-flex"
            onClick={centerOnRoute}
          >
            Full Route
          </Button>
          <Button
            size="sm"
            variant={isLiveSimulating ? "ghost" : "primary"}
            className="h-8 text-xs px-2.5"
            onClick={() => setIsLiveSimulating((v) => !v)}
            leftIcon={<Play size={12} />}
          >
            {isLiveSimulating ? "Pause" : "Resume"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs px-2"
            onClick={resetSim}
            title="Reset simulation replay"
          >
            <RotateCcw size={13} />
          </Button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <a href={`tel:${donorPhone.replace(/\s+/g, "")}`}>
            <Button
              size="sm"
              variant="primary"
              className="shadow-md h-9 text-xs px-3.5"
              leftIcon={<Phone size={13} />}
            >
              Call Donor ({donorPhone.slice(-4)})
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
