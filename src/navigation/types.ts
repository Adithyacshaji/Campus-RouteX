export type NavigationMode = "OUTDOOR" | "TRANSITION" | "INDOOR";

export type IndoorLocationNode = {
  id: string;
  label: string;
  floor?: string;
};

export type NavigationState = {
  currentMode: NavigationMode;
  yourLocation: string;
  destination: string;
};
