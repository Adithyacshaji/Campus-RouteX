import { NavigationProvider, useNavigation } from "./NavigationContext";
import { IndoorSelectionCard } from "./IndoorSelectionCard";
import { OutdoorOverlay } from "./OutdoorOverlay";
import { TransitionPrompt } from "./TransitionPrompt";
import type { IndoorLocationNode } from "./types";

type NavigationContainerProps = {
  children: React.ReactNode;
  indoorNodes: IndoorLocationNode[];
  initialDestination?: string;
  entranceLabel?: string;
  onOutdoorSearch?: (query: string) => void;
  onStartOutdoorRoute?: () => void;
};

function NavigationLayers({ indoorNodes, onOutdoorSearch, onStartOutdoorRoute }: Omit<NavigationContainerProps, "children" | "initialDestination" | "entranceLabel">) {
  const { currentMode } = useNavigation();
  if (currentMode === "OUTDOOR") return <OutdoorOverlay onSearch={onOutdoorSearch} onStartRoute={onStartOutdoorRoute} />;
  if (currentMode === "TRANSITION") return <TransitionPrompt />;
  return <IndoorSelectionCard nodes={indoorNodes} />;
}

/** Keeps the map/floor-plan canvas visible while navigation controls sit above it. */
export function NavigationContainer({ children, indoorNodes, initialDestination, entranceLabel, onOutdoorSearch, onStartOutdoorRoute }: NavigationContainerProps) {
  return <NavigationProvider initialDestination={initialDestination} entranceLabel={entranceLabel}><main className="relative h-dvh w-full overflow-hidden bg-slate-100"><div className="absolute inset-0 z-0">{children}</div><NavigationLayers indoorNodes={indoorNodes} onOutdoorSearch={onOutdoorSearch} onStartOutdoorRoute={onStartOutdoorRoute} /></main></NavigationProvider>;
}
