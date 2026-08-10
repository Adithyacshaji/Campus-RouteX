import { useMemo } from "react";
import { Navigation, CornerUpLeft, CornerUpRight, ArrowUp, ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { calculateHaversineDistance } from "../../utils/haversine";

const bearing = (from, to) => {
  const y = Math.sin((to[1] - from[1]) * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180);
  const x = Math.cos(from[0] * Math.PI / 180) * Math.sin(to[0] * Math.PI / 180) - Math.sin(from[0] * Math.PI / 180) * Math.cos(to[0] * Math.PI / 180) * Math.cos((to[1] - from[1]) * Math.PI / 180);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const turnDetails = (first, second) => {
  if (!first || !second) return { text: "Continue straight", icon: ArrowUp };
  const delta = ((second - first + 540) % 360) - 180;
  const absDelta = Math.abs(delta);
  
  if (absDelta < 20) {
    return { text: "Continue straight", icon: ArrowUp };
  }
  
  if (absDelta > 145) {
    return { text: "Make a U-turn", icon: ArrowUp };
  }
  
  if (absDelta < 45) {
    return delta > 0 
      ? { text: "Slight right", icon: ArrowUpRight } 
      : { text: "Slight left", icon: ArrowUpLeft };
  }
  
  if (absDelta > 110) {
    return delta > 0 
      ? { text: "Sharp right", icon: CornerUpRight } 
      : { text: "Sharp left", icon: CornerUpLeft };
  }
  
  return delta > 0 
    ? { text: "Turn right", icon: CornerUpRight } 
    : { text: "Turn left", icon: CornerUpLeft };
};

export default function RouteGuidanceCard({ path, indoor, destination, etaSeconds = 0, onNextStep }) {
  const guidance = useMemo(() => {
    if (path.length < 2) return null;
    
    let turnIndex;
    let accumulatedDistance;
    let currentBearing;

    if (path.length >= 3) {
      accumulatedDistance = 
        calculateHaversineDistance(path[0][0], path[0][1], path[1][0], path[1][1]) + 
        calculateHaversineDistance(path[1][0], path[1][1], path[2][0], path[2][1]);
      currentBearing = bearing(path[1], path[2]);
      turnIndex = 2;
    } else {
      accumulatedDistance = calculateHaversineDistance(path[0][0], path[0][1], path[1][0], path[1][1]);
      currentBearing = bearing(path[0], path[1]);
      turnIndex = 1;
    }

    // Accumulate distance along straight segments until a significant turn
    while (turnIndex < path.length - 1) {
      const nextBearing = bearing(path[turnIndex], path[turnIndex + 1]);
      const delta = ((nextBearing - currentBearing + 540) % 360) - 180;
      
      // If the turn is significant (>= 20 degrees), break and report this turn
      if (Math.abs(delta) >= 20) {
        break;
      }
      
      // Otherwise, it's mostly straight, so add distance and keep going
      accumulatedDistance += calculateHaversineDistance(path[turnIndex][0], path[turnIndex][1], path[turnIndex + 1][0], path[turnIndex + 1][1]);
      currentBearing = nextBearing; // Update bearing slightly if it's a gentle curve
      turnIndex++;
    }

    const nextBearingToUse = turnIndex < path.length - 1 ? bearing(path[turnIndex], path[turnIndex + 1]) : null;
    const turn = turnDetails(currentBearing, nextBearingToUse);
    
    const isFinalStretch = turnIndex === path.length - 1;
    let instruction = "";
    let TurnIcon = ArrowUp;
    const destName = destination ? (destination.name || destination.id) : "";

    if (isFinalStretch) {
      if (accumulatedDistance <= 15) {
        instruction = destName ? `Arriving at ${destName}` : "Arriving at destination";
        TurnIcon = Navigation;
      } else {
        instruction = destName ? `Head toward ${destName}` : "Continue straight";
        TurnIcon = ArrowUp;
      }
    } else {
      instruction = destName ? `${turn.text} toward ${destName}` : turn.text;
      TurnIcon = turn.icon;
    }
    
    return {
      distance: Math.max(1, Math.round(accumulatedDistance)),
      instruction,
      TurnIcon,
      rotation: currentBearing,
    };
  }, [path, destination]);

  if (!guidance) return null;
  const etaLabel = etaSeconds > 0 ? ` · about ${etaSeconds < 60 ? `${etaSeconds} sec` : `${Math.ceil(etaSeconds / 60)} min`}` : "";
  const TurnIcon = guidance.TurnIcon;

  return (
    <section className={`absolute left-2 right-2 z-[2000] transition-all duration-300 pointer-events-none ${indoor ? "top-[16px]" : "top-[76px]"}`} aria-live="polite">
      <div className="bg-green-600 text-white rounded-[20px] shadow-[0_8px_30px_rgb(22,163,74,0.35)] p-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <TurnIcon size={24} strokeWidth={2.5} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold text-white leading-tight">
              {guidance.instruction}{etaLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
