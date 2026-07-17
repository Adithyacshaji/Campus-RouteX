import { useMemo } from "react";
import { Navigation } from "lucide-react";
import { calculateHaversineDistance } from "../utils/haversine";
import "./RouteGuidanceCard.css";

const bearing = (from, to) => {
  const y = Math.sin((to[1] - from[1]) * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180);
  const x = Math.cos(from[0] * Math.PI / 180) * Math.sin(to[0] * Math.PI / 180) - Math.sin(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) * Math.cos((to[1] - from[1]) * Math.PI / 180);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const turnText = (first, second) => {
  if (!first || !second) return "Continue straight";
  const delta = ((second - first + 540) % 360) - 180;
  if (Math.abs(delta) < 28) return "Continue straight";
  if (Math.abs(delta) > 145) return "Make a U-turn";
  return delta > 0 ? "Turn right" : "Turn left";
};

export default function RouteGuidanceCard({ path, indoor, destination, etaSeconds = 0 }) {
  const guidance = useMemo(() => {
    if (path.length < 2) return null;
    const segmentDistance = calculateHaversineDistance(path[0][0], path[0][1], path[1][0], path[1][1]);
    const firstBearing = bearing(path[0], path[1]);
    const nextBearing = path.length > 2 ? bearing(path[1], path[2]) : null;
    return {
      distance: Math.max(1, Math.round(segmentDistance)),
      next: turnText(firstBearing, nextBearing),
      rotation: firstBearing,
    };
  }, [path]);

  if (!guidance) return null;
  const etaLabel = etaSeconds > 0 ? ` · about ${etaSeconds < 60 ? `${etaSeconds} sec` : `${Math.ceil(etaSeconds / 60)} min`}` : "";
  return <section className={`route-guidance-card ${indoor ? "route-guidance-indoor" : ""}`} aria-live="polite">
    <Navigation size={22} fill="currentColor" style={{ transform: `rotate(${guidance.rotation}deg)` }} />
    <div><strong>Continue for {guidance.distance} m</strong><span>{guidance.next}{destination ? ` toward ${destination.name || destination.id}` : ""}{etaLabel}</span></div>
  </section>;
}
