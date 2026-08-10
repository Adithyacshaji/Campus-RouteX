/**
 * YDCard.jsx
 *
 * Unified "Your Location / Destination" card used in two modes:
 *
 *  • OUTDOOR mode  – "Your Location" is a read-only GPS label; "Destination"
 *    is a full search input that queries the same SEARCH_ITEMS pool as
 *    SearchBar.jsx (with toilet-floor filtering applied).
 *
 *  • INDOOR mode   – Both rows are searchable dropdowns backed by the
 *    active indoor node list (same buildOptions logic as IndoorRoutingCard).
 *    The card is always shown as soon as the user enters indoor mode.
 *
 * Props
 * ─────
 *  mode            "outdoor" | "indoor"
 *  currentFloor    string — active floor key ("G", "B1", "1", …)
 *  gpsLocationLabel string — read-only label for the GPS origin row (outdoor)
 *
 *  // Outdoor-specific
 *  onOutdoorSelect  (item) => void  — called when user picks a destination
 *
 *  // Indoor-specific
 *  activeIndoorNodes  object  — the normalised indoor node map
 *  initialSource      object  — pre-filled source node {name, nearestNode, floor}
 *  initialDestination object  — pre-filled destination
 *  onRoute            (source, dest) => void
 *  onSourceSelect     (item) => void
 *  onOutdoorNavigation () => void  — exit indoor mode button
 *  hintMessage        string
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapPin, Navigation2, DoorOpen, User, Building2, Search, X, ArrowUpRight } from "lucide-react";
import { useDatabase } from "../../context/DatabaseContext";
import "./YDCard.css";

// ─── Alias dictionary (mirrors SearchBar.jsx) ─────────────────────────────────
const ALIASES = {
  cse: ["computer science", "computer science and engineering", "cs"],
  cs: ["computer science", "cse"],
  ece: ["electronics and communication"],
  eee: ["electrical and electronics"],
  me: ["mechanical engineering"],
  mech: ["mechanical engineering"],
  ce: ["civil engineering"],
  mca: ["master of computer applications"],
  mba: ["master of business administration"],
  hod: ["head of department"],
  toilet: ["washroom", "restroom", "bathroom", "wc"],
  washroom: ["toilet", "restroom", "bathroom", "wc"],
};

const TOILET_TERMS = new Set(["toilet", "washroom", "restroom", "bathroom", "wc"]);
const TOILET_NAMES = ["toilet", "washroom", "restroom", "bathroom", "wc", "girl", "boy"];

function isToiletItem(item) {
  const name = (item.name || "").toLowerCase();
  return TOILET_NAMES.some((t) => name.includes(t));
}

function getSearchTokens(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeSpaceless(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ─── Outdoor search logic (mirrors SearchBar useMemo) ─────────────────────────
function scoreOutdoor(item, query, isIndoorMode, currentFloor) {
  const qTrimmed = query.trim().toLowerCase();
  if (!qTrimmed) return 0;

  const qTokens = getSearchTokens(qTrimmed);
  const qSpaceless = normalizeSpaceless(qTrimmed);

  const expandedQTokens = new Set(qTokens);
  qTokens.forEach((t) => {
    if (ALIASES[t]) {
      ALIASES[t].forEach((alias) => {
        getSearchTokens(alias).forEach((at) => expandedQTokens.add(at));
      });
    }
  });
  const finalQTokens = Array.from(expandedQTokens);

  // Toilet smart filter
  const isToiletQuery = qTokens.some((t) => TOILET_TERMS.has(t));
  if (isToiletQuery && isIndoorMode && isToiletItem(item)) {
    if (item.floor && item.floor !== currentFloor) return -1; // hard suppress
  }

  const name = item.name || "";
  const nameLower = name.toLowerCase();
  const nameSpaceless = normalizeSpaceless(nameLower);
  const itemId = (item.id || "").toString().toLowerCase();
  const itemIdSpaceless = normalizeSpaceless(itemId);
  const dept = (item.department || "").toLowerCase();
  const desig = (item.designation || "").toLowerCase();
  const bldg = (item.building || "").toLowerCase();
  const floor = (item.floor || "").toString().toLowerCase();
  const room = (item.room || "").toString().toLowerCase();
  const type = (item.type || "").toLowerCase();
  const nameWords = getSearchTokens(nameLower);

  let score = 0;
  if (nameLower === qTrimmed || itemId === qTrimmed || itemIdSpaceless === qSpaceless) score += 1000;
  else if (nameLower.startsWith(qTrimmed) || itemIdSpaceless.startsWith(qSpaceless)) score += 800;
  else if (nameWords.some((w) => w.startsWith(qTrimmed))) score += 750;
  else if (qSpaceless && (nameSpaceless.startsWith(qSpaceless) || nameSpaceless.includes(qSpaceless))) score += 600;
  else if (nameLower.includes(qTrimmed)) score += 450;
  else if (dept.startsWith(qTrimmed) || dept.includes(" " + qTrimmed)) score += 300;
  else if (desig.startsWith(qTrimmed)) score += 250;

  const fullText = [nameLower, dept, desig, bldg, floor, room, type].join(" ");
  const itemTokens = getSearchTokens(fullText);
  let matchedTokens = 0;
  for (const qTok of finalQTokens) {
    if (itemTokens.some((iTok) => iTok.startsWith(qTok) || iTok.includes(qTok))) matchedTokens++;
  }
  if (matchedTokens > 0) {
    score += matchedTokens * 30;
    if (matchedTokens === finalQTokens.length) score += 40;
  }

  return score;
}

// ─── Indoor option builder (mirrors IndoorRoutingCard buildOptions) ────────────
function buildIndoorOptions(activeIndoorNodes, searchItems) {
  const searchOptions = searchItems.map((item) => {
    const indoorNodeId = item.indoorNode || item.id;
    const indoorNode = activeIndoorNodes[indoorNodeId];
    const isInCurrentBuilding = Boolean(indoorNode);
    const isRoom = item.type === "room";
    return {
      id: isInCurrentBuilding ? indoorNodeId : item.id,
      name: item.name,
      roomNumber: item.room || (isRoom ? item.id : null),
      floor: indoorNode?.floor || item.floor,
      kind: item.type === "faculty" ? item.department || "Faculty" : isRoom ? "Room" : "Campus location",
      routeNode: item.routeNode || item.id,
      building: item.building,
      outdoor: !isInCurrentBuilding,
    };
  });

  const representedIds = new Set(
    searchOptions.filter((i) => !i.outdoor).map((i) => i.id).filter(Boolean)
  );

  const namedNodeOptions = Object.entries(activeIndoorNodes)
    .filter(([, node]) => node.label)
    .map(([id, node]) => ({ id, name: node.label, floor: node.floor, kind: "Indoor point" }))
    .filter((item) => !representedIds.has(item.id));

  return [...searchOptions, ...namedNodeOptions]
    .filter((item, index, all) => all.findIndex((o) => o.id === item.id && o.name === item.name) === index)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function findIndoorOption(value, options) {
  if (!value) return null;
  const id = value.nearestNode || value.indoorNode || value.id;
  return (
    options.find((item) => item.name === value.name) ||
    options.find((item) => item.id === id) ||
    (id ? { id, name: value.name || id, floor: value.floor } : null)
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ItemIcon({ item }) {
  if (item.type === "faculty") return <User size={16} />;
  if (item.type === "room") return <DoorOpen size={16} />;
  if (item.building || item.type === "building") return <Building2 size={16} />;
  return <MapPin size={16} />;
}

function itemMeta(item) {
  if (item.type === "faculty") {
    const bName = (item.building || "").toLowerCase().includes("chavara")
      ? "Chavara Block"
      : "St Mary's Block";
    return `${item.designation || "Faculty"} · ${item.department || ""} (${bName})`;
  }
  if (item.type === "room") {
    const bName = (item.building || "").toLowerCase().includes("chavara")
      ? "Chavara Block"
      : "St Mary's Block";
    const roomPart = item.roomNumber || item.id || "";
    return `${bName} · ${roomPart ? roomPart + " · " : ""}Floor ${item.floor || ""}`;
  }
  return item.department || item.building || "Campus Location";
}

// ─── Single editable field with dropdown ─────────────────────────────────────
function SearchField({ id, label, value, onChange, onSelect, results, isReadOnly, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (!focused || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((p) => (p < results.length - 1 ? p + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((p) => (p > 0 ? p - 1 : results.length - 1));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      onSelect(activeIndex >= 0 ? results[activeIndex] : results[0]);
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  if (isReadOnly) {
    return (
      <div className="yd-field">
        <div className="yd-field-inner yd-field-inner--readonly">
          <span className="yd-field-icon"><MapPin size={16} /></span>
          <span className="yd-field-readonly-text">{value || placeholder}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="yd-field">
      <div className={`yd-field-inner${focused ? " yd-field-inner--focused" : ""}`}>
        <span className="yd-field-icon">
          {id === "origin" ? <MapPin size={16} /> : <Search size={16} />}
        </span>
        <input
          ref={inputRef}
          className="yd-field-input"
          type="text"
          placeholder={placeholder || label}
          value={value}
          onChange={(e) => { onChange(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {value && (
          <button
            className="yd-clear-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            aria-label={`Clear ${label}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {focused && value.trim() && results.length > 0 && (
        <div className="yd-dropdown">
          {results.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              className={`yd-dropdown-item${idx === activeIndex ? " yd-dropdown-item--active" : ""}`}
              type="button"
              onMouseDown={() => onSelect(item)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <div className="yd-dropdown-icon"><ItemIcon item={item} /></div>
              <div>
                <div className="yd-dropdown-name">{item.name}</div>
                <div className="yd-dropdown-meta">{itemMeta(item)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {focused && value.trim() && results.length === 0 && (
        <div className="yd-dropdown">
          <div className="yd-dropdown-empty">No locations found</div>
        </div>
      )}
    </div>
  );
}

// ─── Main YDCard component ────────────────────────────────────────────────────
export default function YDCard({
  mode = "outdoor",
  currentFloor = "G",
  gpsLocationLabel = "Your Location",

  // Outdoor
  onOutdoorSelect,
  outdoorDestinationName = "",

  // Indoor
  activeIndoorNodes,
  initialSource,
  initialDestination,
  onRoute,
  onSourceSelect,
  onOutdoorNavigation,
  hintMessage = "Enter your current location",
}) {
  const { searchItems: SEARCH_ITEMS } = useDatabase();

  // ── Outdoor destination search state ────────────────────────────────────────
  const [destQuery, setDestQuery] = useState(outdoorDestinationName || "");

  // Sync the pre-filled destination name when the prop changes
  // (e.g. user navigates from SearchBar result → YD Card appears)
  useEffect(() => {
    if (outdoorDestinationName) {
      setDestQuery(outdoorDestinationName);
    }
  }, [outdoorDestinationName]);

  const outdoorResults = useMemo(() => {
    if (mode !== "outdoor") return [];
    const q = destQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_ITEMS
      .map((item) => ({ item, score: scoreOutdoor(item, q, false, currentFloor) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score !== a.score ? b.score - a.score : a.item.name.length - b.item.name.length)
      .slice(0, 10)
      .map((r) => r.item);
  }, [destQuery, mode, SEARCH_ITEMS, currentFloor]);

  // ── Indoor route state ───────────────────────────────────────────────────────
  const indoorOptions = useMemo(() => {
    if (mode !== "indoor" || !activeIndoorNodes) return [];
    return buildIndoorOptions(activeIndoorNodes, SEARCH_ITEMS);
  }, [mode, activeIndoorNodes, SEARCH_ITEMS]);

  const sourceOptions = useMemo(() => indoorOptions.filter((i) => !i.outdoor), [indoorOptions]);

  const sourceFromProps = useMemo(() => findIndoorOption(initialSource, indoorOptions), [initialSource, indoorOptions]);
  const destFromProps   = useMemo(() => findIndoorOption(initialDestination, indoorOptions), [initialDestination, indoorOptions]);

  const [sourceText, setSourceText] = useState(sourceFromProps?.name || "");
  const [destText, setDestText]     = useState(destFromProps?.name || "");
  const [source, setSource]         = useState(sourceFromProps || null);
  const [dest, setDest]             = useState(destFromProps || null);

  // Sync props → state
  useEffect(() => {
    if (initialSource) {
      const p = findIndoorOption(initialSource, indoorOptions);
      if (p) { setSource(p); setSourceText(p.name); }
    } else {
      setSource(null); setSourceText("");
    }
  }, [initialSource, indoorOptions]);

  useEffect(() => {
    if (initialDestination) {
      const p = findIndoorOption(initialDestination, indoorOptions);
      if (p) { setDest(p); setDestText(p.name); }
    } else {
      setDest(null); setDestText("");
    }
  }, [initialDestination, indoorOptions]);

  // Indoor filtered results
  const indoorSourceResults = useMemo(() => {
    const q = sourceText.trim().toLowerCase();
    return sourceOptions.filter((o) => !q || `${o.name} ${o.roomNumber || o.id} ${o.floor}`.toLowerCase().includes(q));
  }, [sourceText, sourceOptions]);

  const indoorDestResults = useMemo(() => {
    const q = destText.trim().toLowerCase();
    const isToiletQ = getSearchTokens(q).some((t) => TOILET_TERMS.has(t));
    return indoorOptions.filter((o) => {
      if (isToiletQ && isToiletItem(o) && o.floor && o.floor !== currentFloor) return false;
      return !q || `${o.name} ${o.roomNumber || o.id} ${o.floor}`.toLowerCase().includes(q);
    });
  }, [destText, indoorOptions, currentFloor]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleOutdoorDestSelect = useCallback((item) => {
    setDestQuery(item.name);
    if (onOutdoorSelect) onOutdoorSelect(item);
  }, [onOutdoorSelect]);

  const handleIndoorRoute = useCallback(() => {
    if (source && dest && onRoute) onRoute(source, dest);
  }, [source, dest, onRoute]);

  // ─────────────────────────────────────────────────────────────────────────────
  if (mode === "outdoor") {
    return (
      <div className="yd-card-wrapper">
        <div className="yd-card">
          <div className="yd-fields">
            <div className="yd-connector">
              <div className="yd-dot yd-dot--origin" />
              <div className="yd-line" />
              <div className="yd-dot yd-dot--dest" />
            </div>
            <div className="yd-inputs">
              {/* Origin — read-only GPS label */}
              <SearchField
                id="origin"
                label="Your Location"
                value={gpsLocationLabel}
                isReadOnly
                placeholder="Your Location"
              />
              <div className="yd-divider" />
              {/* Destination — full search */}
              <SearchField
                id="dest"
                label="Destination"
                value={destQuery}
                onChange={setDestQuery}
                onSelect={handleOutdoorDestSelect}
                results={outdoorResults}
                placeholder="Search destination…"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Indoor mode
  return (
    <div className="yd-card-wrapper">
      <div className="yd-card">
        <div className="yd-fields">
          <div className="yd-connector">
            <div className="yd-dot yd-dot--origin" />
            <div className="yd-line" />
            <div className="yd-dot yd-dot--dest" />
          </div>
          <div className="yd-inputs">
            <SearchField
              id="origin"
              label="Your Location"
              value={sourceText}
              onChange={(v) => { setSourceText(v); setSource(null); }}
              onSelect={(item) => {
                setSource(item);
                setSourceText(item.name);
                if (onSourceSelect) onSourceSelect(item);
              }}
              results={indoorSourceResults}
              placeholder={hintMessage}
            />
            <div className="yd-divider" />
            <SearchField
              id="dest"
              label="Destination"
              value={destText}
              onChange={(v) => { setDestText(v); setDest(null); }}
              onSelect={(item) => { setDest(item); setDestText(item.name); }}
              results={indoorDestResults}
              placeholder="Search room or faculty…"
            />
          </div>

          {/* Route button */}
          <div style={{ display: "flex", alignItems: "center", marginLeft: 8, flexShrink: 0 }}>
            <button
              className="w-12 h-12 bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-full transition-all shadow-[0_4px_12px_rgb(37,99,235,0.2)] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              style={{ width: 44, height: 44, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
              type="button"
              disabled={!source || !dest}
              onClick={handleIndoorRoute}
              aria-label="Show Indoor Route"
            >
              <Navigation2 size={18} style={{ opacity: !source || !dest ? 0.4 : 1 }} />
            </button>
          </div>
        </div>

        {/* Exit indoor mode */}
        {onOutdoorNavigation && (
          <button
            type="button"
            style={{
              marginTop: 8,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#6b7280",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              borderRadius: 8,
              transition: "color 0.15s",
            }}
            onClick={onOutdoorNavigation}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            <ArrowUpRight size={14} />
            Back to outdoor map
          </button>
        )}
      </div>
    </div>
  );
}
