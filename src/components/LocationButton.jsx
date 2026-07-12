import { LocateFixed } from "lucide-react";
import "./LocationButton.css";

function LocationButton({ onClick }) {
  return (
    <button
      className="location-btn"
      onClick={onClick}
      title="My Location"
    >
      <LocateFixed size={22} />
    </button>
  );
}

export default LocationButton;