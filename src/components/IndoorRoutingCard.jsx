import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { INDOOR_NODES } from "../data/indoorNodes";
import { SEARCH_ITEMS } from "../data/searchData";
import { bottomSheetData } from "../data/bottomSheetData";
import "./IndoorRoutingCard.css";

const namedNodeOptions = Object.entries(INDOOR_NODES)
  .filter(([, node]) => node.label)
  .map(([id, node]) => ({ id, name: node.label, floor: node.floor }));
const roomOptions = SEARCH_ITEMS
  .filter((item) => item.type === "room" && INDOOR_NODES[item.id])
  .map((item) => ({ id: item.id, name: item.name, roomNumber: item.id, floor: item.floor, kind: "Room" }));
const facultyOptions = bottomSheetData.departments.flatMap((department) => department.faculties
  .filter((faculty) => faculty.indoorNode && INDOOR_NODES[faculty.indoorNode])
  .map((faculty) => ({ id: faculty.indoorNode, name: faculty.name, roomNumber: faculty.room, floor: faculty.floor, kind: department.name })));
const departmentOptions = bottomSheetData.departments
  .map((department) => ({ department, destination: department.faculties.find((faculty) => faculty.indoorNode && INDOOR_NODES[faculty.indoorNode]) }))
  .filter(({ destination }) => destination)
  .map(({ department, destination }) => ({ id: destination.indoorNode, name: department.name, roomNumber: destination.room, floor: destination.floor, kind: "Department" }));
const outdoorOptions = SEARCH_ITEMS
  .filter((item) => !item.type && item.routeNode !== "g" && item.id !== "st-marys-block")
  .map((item) => ({ id: item.id, name: item.name, routeNode: item.routeNode || item.id, kind: "Outdoor destination", outdoor: true }));
// Prefer human-readable room, faculty, and department names over node IDs.
const OPTIONS = [...roomOptions, ...facultyOptions, ...departmentOptions, ...outdoorOptions, ...namedNodeOptions]
  .filter((item, index, all) => all.findIndex((other) => other.id === item.id && other.name === item.name) === index)
  .sort((a, b) => a.name.localeCompare(b.name));

const findOption = (value) => {
  if (!value) return null;
  const id = value.nearestNode || value.indoorNode || value.id;
  return OPTIONS.find((item) => item.name === value.name) || OPTIONS.find((item) => item.id === id) || (id ? { id, name: value.name || id, floor: value.floor } : null);
};

function RouteField({ label, value, onChange, onSelect, showHint = false, onHintDismiss }) {
  const [focused, setFocused] = useState(false);
  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    return OPTIONS.filter((item) => !query || `${item.name} ${item.roomNumber || item.id} ${item.floor}`.toLowerCase().includes(query));
  }, [value]);

  const handleFocus = () => {
    setFocused(true);
    if (onHintDismiss) onHintDismiss();
  };

  return (
    <label className="indoor-route-field">
      <span>{label}</span>
      <div className="indoor-route-input-wrap">
        <MapPin size={16} aria-hidden="true" />
        <input
          value={value}
          placeholder={`Select ${label.toLowerCase()}`}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        />
        {value && (
          <button
            className="indoor-field-clear"
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => { onChange(""); setFocused(true); }}
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            <X size={16} />
          </button>
        )}
      </div>
      {showHint && !focused && !value && (
        <div className="indoor-location-hint" aria-live="polite">
          <span className="hint-icon">📍</span>
          <span>Tap here to set your start location</span>
        </div>
      )}
      {focused && (
        <ul className="indoor-route-suggestions" role="listbox">
          {matches.length
            ? matches.map((item) => (
                <li key={`${label}-${item.id}-${item.name}`}>
                  <button type="button" onMouseDown={() => onSelect(item)}>
                    <strong>{item.name}</strong>
                    <small>
                      {item.roomNumber ? `Room ${item.roomNumber}` : item.id}
                      {item.floor ? ` · Floor ${item.floor}` : ""}
                      {item.kind ? ` · ${item.kind}` : ""}
                    </small>
                  </button>
                </li>
              ))
            : <li className="indoor-no-results">No locations match this search.</li>
          }
        </ul>
      )}
    </label>
  );
}

export default function IndoorRoutingCard({ onRoute, onOutdoorNavigation, initialSource, initialDestination }) {
  const sourceFromProps = findOption(initialSource);
  const destinationFromProps = findOption(initialDestination);
  const [sourceText, setSourceText] = useState(sourceFromProps?.name || "");
  const [destinationText, setDestinationText] = useState(destinationFromProps?.name || "");
  const [source, setSource] = useState(sourceFromProps);
  const [destination, setDestination] = useState(destinationFromProps);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    if (sourceFromProps?.id && sourceFromProps.id !== source?.id) {
      setSource(sourceFromProps);
      setSourceText(sourceFromProps.name);
      setHintVisible(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFromProps?.id]);

  useEffect(() => {
    if (destinationFromProps?.id && destinationFromProps.id !== destination?.id) {
      setDestination(destinationFromProps);
      setDestinationText(destinationFromProps.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationFromProps?.id]);

  const updateSource = (text) => { setSourceText(text); setSource(null); };
  const updateDestination = (text) => { setDestinationText(text); setDestination(null); };

  return (
    <section className="indoor-routing-card" aria-label="Indoor route planner">
      <div className="indoor-route-fields">
        <RouteField
          label="Your Location"
          value={sourceText}
          onChange={updateSource}
          onSelect={(item) => { setSource(item); setSourceText(item.name); setHintVisible(false); }}
          showHint={hintVisible && !source}
          onHintDismiss={() => setHintVisible(false)}
        />
        <RouteField
          label="Destination"
          value={destinationText}
          onChange={updateDestination}
          onSelect={(item) => { setDestination(item); setDestinationText(item.name); }}
        />
      </div>
      <div className="indoor-route-actions">
        <button
          className="indoor-route-go"
          type="button"
          onClick={() => source && destination && onRoute(source, destination)}
          disabled={!source || !destination}
        >
          <Navigation size={17} /> Show Route
        </button>
      </div>
    </section>
  );
}
