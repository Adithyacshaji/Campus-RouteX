import { useState, useEffect } from "react";
import "./FloorSelector.css";

export default function FloorSelector({
  currentFloor,
  setCurrentFloor,
  mapMode,
  destination,
  activeFloorImages = {},
}) {
  const [expanded, setExpanded] = useState(false);
  const floors = Object.keys(activeFloorImages).reverse();

  useEffect(() => {
    if (mapMode !== "INDOOR") return;

    setExpanded(true);

    const timer = setTimeout(() => {
      setExpanded(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [mapMode]);

  if (mapMode !== "INDOOR") return null;

function normalizeFloor(floor) {
  if (!floor) return "G";
  const match = floor.toString().match(/^(\d+)/);
  if (match) return match[1];
  if (floor.toString().toUpperCase().startsWith("G")) return "G";
  return floor;
}

  return (
    <div className={`floor-picker ${expanded ? "expanded" : ""}`}>
      <button
        className="floor-current"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{currentFloor}</span>
        <span className={`arrow ${expanded ? "rotate" : ""}`}>
          ▼
        </span>
      </button>
 
      <div className="floor-list">
        {floors.map((floor) => (
          <button
            key={floor}
            className={`floor-item
              ${currentFloor === floor ? "active" : ""}
              ${normalizeFloor(destination?.floor) === floor ? "destination" : ""}
            `}
            onClick={() => {
              setCurrentFloor(floor);
              setExpanded(false);
            }}
          >
            {floor}
          </button>
        ))}
      </div>
    </div>
  );
}