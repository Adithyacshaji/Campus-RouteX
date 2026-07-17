import { useState, useRef } from "react";
import { SEARCH_ITEMS } from "../data/searchData";
import { Search, X } from "lucide-react";
import "./SearchBar.css";
function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const normalizeText = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, ""); // removes all spaces


  const normalizedQuery = normalizeText(query.trim());


  const results = normalizedQuery
    ? SEARCH_ITEMS.filter((location) => normalizeText(location.name ?? "").includes(normalizedQuery))
    : [];

  const handleSelect = (location) => {
    onSelect(location);

    setQuery(location.name);
    setShowResults(false);

    // Remove focus from the input
    document.activeElement.blur();

  };
  const inputRef = useRef(null);

  return (
    <div className="top-header">
        <div className="search-panel">

          <Search className="search-icon" size={18} />
          <input
            ref={inputRef}
            className="search-input"
            type="search"
            placeholder="Search Departments,Faculty,Classroom"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              setShowResults(value.trim() !== "");
            }}
          />

          {query && (
            <button
              className="clear-btn"
              onClick={() => {
                setQuery("");
                setShowResults(false);
                inputRef.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          )}

          <div className="divider"></div>

        </div>

      {showResults && query.trim() !== "" && results.length > 0 && (
        <div className="search-results">
          {results.map((location) => (
            <button
              className="search-result"
              key={location.id}
              onClick={() => handleSelect(location)}
            >
              <span className="search-result-name">{location.name}</span>
              {location.type === "room" && (
                <span className="search-result-meta">
                  {location.building} · Floor {location.floor}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

export default SearchBar;
