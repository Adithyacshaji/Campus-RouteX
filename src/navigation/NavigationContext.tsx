import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { NavigationMode, NavigationState } from "./types";

type NavigationContextValue = NavigationState & {
  setCurrentMode: (mode: NavigationMode) => void;
  setYourLocation: (location: string) => void;
  setDestination: (destination: string) => void;
  confirmEntrance: () => void;
  markReached: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

type NavigationProviderProps = {
  children: React.ReactNode;
  initialDestination?: string;
  entranceLabel?: string;
};

export function NavigationProvider({
  children,
  initialDestination = "",
  entranceLabel = "Entrance",
}: NavigationProviderProps) {
  const [currentMode, setCurrentMode] = useState<NavigationMode>("OUTDOOR");
  const [yourLocation, setYourLocation] = useState("");
  const [destination, setDestination] = useState(initialDestination);

  const confirmEntrance = useCallback(() => {
    setYourLocation(entranceLabel);
    setCurrentMode("INDOOR");
  }, [entranceLabel]);

  const markReached = useCallback(() => {
    setYourLocation(destination);
    setDestination("");
  }, [destination]);

  const value = useMemo(
    () => ({
      currentMode,
      yourLocation,
      destination,
      setCurrentMode,
      setYourLocation,
      setDestination,
      confirmEntrance,
      markReached,
    }),
    [currentMode, yourLocation, destination, confirmEntrance, markReached],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used inside NavigationProvider.");
  return context;
}
