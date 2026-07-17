import { CheckCircle2, MapPin, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "./NavigationContext";
import type { IndoorLocationNode } from "./types";

type Field = "yourLocation" | "destination";
type IndoorSelectionCardProps = { nodes: IndoorLocationNode[] };

export function IndoorSelectionCard({ nodes }: IndoorSelectionCardProps) {
  const { yourLocation, destination, setYourLocation, setDestination, markReached } = useNavigation();
  const [activeField, setActiveField] = useState<Field | null>(null);
  const activeValue = activeField === "yourLocation" ? yourLocation : destination;
  const matches = useMemo(() => nodes.filter((node) => node.label.toLowerCase().includes((activeValue ?? "").toLowerCase())).slice(0, 6), [nodes, activeValue]);

  useEffect(() => {
    if (!activeField) return;
    const close = () => setActiveField(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [activeField]);

  const update = (field: Field, value: string) => field === "yourLocation" ? setYourLocation(value) : setDestination(value);
  const selectNode = (node: IndoorLocationNode) => { if (activeField) update(activeField, node.label); setActiveField(null); };
  const field = (name: Field, title: string, value: string) => <div className="relative" onClick={(event) => event.stopPropagation()}>
    <label className="mb-1 block text-xs font-semibold text-slate-500">{title}</label>
    <div className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100"><MapPin className="h-4 w-4 shrink-0 text-slate-500" /><input value={value} onFocus={() => setActiveField(name)} onChange={(event) => update(name, event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none" placeholder={`Select ${title.toLowerCase()}`} aria-label={title} />{value && <button type="button" onClick={() => { update(name, ""); setActiveField(name); }} className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700" aria-label={`Clear ${title.toLowerCase()}`}><X className="h-4 w-4" /></button>}</div>
    {activeField === name && <ul className="absolute z-30 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg" role="listbox">{matches.length ? matches.map((node) => <li key={node.id}><button type="button" onClick={() => selectNode(node)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"><span>{node.label}</span>{node.floor && <span className="text-xs text-slate-400">{node.floor}</span>}</button></li>) : <li className="px-3 py-2 text-sm text-slate-500">No matching indoor locations</li>}</ul>}
  </div>;

  return <section className="absolute inset-x-4 top-4 z-20 rounded-2xl bg-white p-4 shadow-lg shadow-slate-900/15" aria-label="Indoor route selection"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Indoor navigation</p><h2 className="mt-1 text-lg font-bold text-slate-900">Set your route</h2></div><div className="flex flex-col gap-3">{field("yourLocation", "Your Location", yourLocation)}{field("destination", "Destination", destination)}</div><button type="button" disabled={!destination} onClick={markReached} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"><CheckCircle2 className="h-5 w-5" />I Reached</button></section>;
}
