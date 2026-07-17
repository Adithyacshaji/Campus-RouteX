import { MapPin, Navigation, Search } from "lucide-react";
import { useNavigation } from "./NavigationContext";

type OutdoorOverlayProps = {
  onSearch?: (query: string) => void;
  onStartRoute?: () => void;
};

export function OutdoorOverlay({ onSearch, onStartRoute }: OutdoorOverlayProps) {
  const { destination, setDestination, setCurrentMode } = useNavigation();

  const handleRouteAction = () => {
    onStartRoute?.();
    setCurrentMode("TRANSITION");
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-label="Outdoor navigation controls">
      <div className="pointer-events-auto absolute inset-x-4 top-4">
        <label className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-lg shadow-slate-900/10">
          <Search className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
          <input
            value={destination}
            onChange={(event) => {
              const value = event.target.value;
              setDestination(value);
              onSearch?.(value);
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Search a building or destination"
            aria-label="Outdoor destination"
          />
        </label>
      </div>

      {destination && (
        <section className="pointer-events-auto absolute inset-x-4 bottom-5 rounded-2xl bg-white p-4 shadow-lg shadow-slate-900/15" aria-label="Route directions">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><MapPin className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Route in progress</p>
              <p className="truncate text-base font-semibold text-slate-900">{destination}</p>
              <p className="mt-1 text-sm text-slate-500">Follow the highlighted path to the entrance.</p>
            </div>
          </div>
          <button type="button" onClick={handleRouteAction} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">
            <Navigation className="h-4 w-4" /> I reached the entrance
          </button>
        </section>
      )}
    </div>
  );
}
