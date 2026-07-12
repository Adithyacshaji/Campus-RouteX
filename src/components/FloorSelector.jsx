import { useState, useEffect } from "react";
import "./FloorSelector.css";
import { FLOOR_IMAGES } from "../data/floorImages";

const FLOORS = Object.keys(FLOOR_IMAGES).reverse();

export default function FloorSelector({
  currentFloor,
  setCurrentFloor,
  mapMode,
  destination,
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (mapMode !== "INDOOR") return;

    setExpanded(true);

    const timer = setTimeout(() => {
      setExpanded(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [mapMode]);

  if (mapMode !== "INDOOR") return null;

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
        {FLOORS.map((floor) => (
          <button
            key={floor}
            className={`floor-item
              ${currentFloor === floor ? "active" : ""}
              ${destination?.floor === floor ? "destination" : ""}
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