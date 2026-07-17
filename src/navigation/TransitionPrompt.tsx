import { DoorOpen } from "lucide-react";
import { useNavigation } from "./NavigationContext";

export function TransitionPrompt() {
  const { setCurrentMode, confirmEntrance } = useNavigation();
  return (
    <div className="absolute inset-x-4 bottom-5 z-20 rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/20" role="dialog" aria-modal="true" aria-labelledby="entrance-prompt-title">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><DoorOpen className="h-5 w-5" /></span>
        <div><h2 id="entrance-prompt-title" className="text-base font-semibold text-slate-900">Have you reached the entrance?</h2><p className="mt-1 text-sm text-slate-500">We’ll switch to the indoor floor plan.</p></div>
      </div>
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={() => setCurrentMode("OUTDOOR")} className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">No</button>
        <button type="button" onClick={confirmEntrance} className="h-11 flex-1 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">Yes</button>
      </div>
    </div>
  );
}
