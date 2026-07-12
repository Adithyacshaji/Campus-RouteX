import { useEffect, useRef } from "react";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { CAMPUS_BOUNDS, LOCATIONS } from "../data/locations";
import { EDGES, NODES } from "../data/graph";
import { FLOOR_IMAGES } from "../data/floorImages";
import { INDOOR_NODES } from "../data/indoorNodes";
import L from "leaflet";
import { findNearestIndoorNode } from "../utils/findNearestIndoorNode";
import { MdElevator, MdStairs } from "react-icons/md";
import { renderToStaticMarkup } from "react-dom/server";
const SHOW_INDOOR_DEBUG_MARKERS = false;
const SHOW_INDOOR_DEBUG_TOOLS = false;
const INITIAL_OUTDOOR_MARKER_IDS = ["chavara", "canteen", "st-marys-block", "cafe", "joseph"];
const OUTDOOR_ZOOM = {
  default: 18,
  min: 16,
  max: 22,
  maxNative: 19,
};
const INDOOR_ZOOM = {
  min: 19,
  max: 25,
  overview: 22,
};
const BUILDINGS = [
  {
    name: "St Chavara\nBlock",
    position: [10.355897, 76.212608],
  },
  {
    name: "St Mary's\nBlock",
    position: [10.357831, 76.212684],
  },
  {
    name: "Canteen",
    position: [10.357400, 76.212602],
  },
  {
    name: "Open\nAuditorium",
    position: [10.356543, 76.212435],
  },
  {
    name: "Cafe",
    position: [10.355706, 76.212082],
  },
  {
    name: "St Joseph's\nBlock",
    position: [10.358869, 76.212778],
  },
  {
    name: "Amphitheatre",
    position: [10.358051, 76.213301],
  },

];
// ─── Campus Feature Data ──────────────────────────────────────────────────────

const GREEN_AREAS = [
  {
    id: "lawn-mid-west",
    positions: [
      [10.358571, 76.212730],
      [10.358582, 76.213004],
      [10.359046, 76.213009],
      [10.359094, 76.212601],
      [10.358925, 76.212607],
      [10.358925, 76.212478],
      [10.358783, 76.212483],
      [10.358761, 76.212644],
    ],
  },
  {
    id: "lawn-chavara-side",
    positions: [
      [10.355565, 76.212459],
      [10.355570, 76.212711],
      [10.356272, 76.212716],
      [10.356282, 76.212443],

    ],
  },
  {
    id: "lawn-north",
    positions: [
      [10.357560, 76.212521],
      [10.357661, 76.212843],
      [10.357808, 76.212982],
      [10.358008, 76.212920],
      [10.358076, 76.212748],
      [10.357992, 76.212367],

    ],
  },

];
// // Small parking areas
const PARKING_AREAS = [
  {
    id: "lawn-stmarys-side",
    positions: [
      [10.355781, 76.212029],
      [10.355770, 76.212185],
      [10.355596, 76.212169],
      [10.355612, 76.212013],

    ],
  },
  {
    id: "parking-north",
    positions: [
      [10.357233, 76.212617],
      [10.357249, 76.212692],
      [10.357502, 76.212639],
      [10.357450, 76.212456],
    ],
  },
];
// ─── Icon helpers ─────────────────────────────────────────────────────────────
const destinationIcon = L.divIcon({
  className: "destination-dot",
  html: "<div></div>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
const outdoorUserIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div class="user-dot">
      <div class="user-pulse"></div>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
const outdoorPointIcon = L.divIcon({
  className: "outdoor-location-marker",
  html: `<div class="outdoor-location-dot"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});
const outdoorDestinationIcon = L.divIcon({
  className: "destination-dot",
  html: `<div class="outdoor-location-dot" style="background:#1a73e8;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});
const indoorUserIcon = L.divIcon({
  className: "indoor-location-marker",
  html: `<div class="indoor-dot"></div>`,
});
const liftIcon = L.divIcon({
  className: "",
  html: `
    <div class="facility-marker">
      ${renderToStaticMarkup(<MdElevator size={22} color="#1a73e8" />)}
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});
const stairsIcon = L.divIcon({
  className: "",
  html: `
    <div class="facility-marker">
      ${renderToStaticMarkup(<MdStairs size={22} color="#f57c00" />)}
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});
// Build a DivIcon for each building illustration
function makeBuildingIcon(fp) {
  const s = fp.imgSize;
  const labelBg = fp.fillColor;
  const labelCol = fp.labelColor;
  return L.divIcon({
    className: "bld-iso-outer",
    html: `
      <div class="bld-iso-wrap">
        <img
          src="${fp.image}"
          class="bld-iso-img"
          width="${s}"
          height="${s}"
          draggable="false"
        />
        <span class="bld-iso-chip" style="background:${labelBg};color:${labelCol};border-color:${fp.color}">
          ${fp.label}
        </span>
      </div>
    `,
    // icon bottom-center sits exactly on the building's footprint center
    iconSize: [s, s + 24],
    iconAnchor: [s / 2, s + 24],
    popupAnchor: [0, -(s + 24)],
  });
}
// Compute centre of a polygon
function polygonCentre(positions) {
  const lat = positions.reduce((s, p) => s + p[0], 0) / positions.length;
  const lng = positions.reduce((s, p) => s + p[1], 0) / positions.length;
  return [lat, lng];
}
// ─── Main Component ───────────────────────────────────────────────────────────
function CampusMap({
  selectedLocation,
  currentLocation,
  route = [],
  indoorRoute = [],
  indoorRouteNodes = [],
  currentFloor,
  mapMode,
  destination,
  mapCenter,
  indoorUserLocation,
  indoorLocationMode,
  setIndoorUserLocation,
  setIndoorStart,
  indoorStart,
}) {
  const edgeLines = EDGES.map(([from, to]) => [NODES[from], NODES[to]]).filter(
    ([from, to]) => from && to
  );
  const visibleIndoorRoute = indoorRouteNodes
    .filter((id) => INDOOR_NODES[id]?.floor === currentFloor)
    .map((id) => INDOOR_NODES[id].position);
  const visibleOutdoorMarkers = LOCATIONS.filter((location) =>
    INITIAL_OUTDOOR_MARKER_IDS.includes(location.id)
  );
  const shouldShowDestinationMarker = route.length > 0 && selectedLocation;
  const destinationMarker = shouldShowDestinationMarker
    ? LOCATIONS.find((location) => location.id === selectedLocation?.id)
    : null;
  return (
    <MapContainer
      center={[10.354098, 76.212307]}
      zoom={OUTDOOR_ZOOM.default}
      maxBounds={mapMode === "OUTDOOR" ? CAMPUS_BOUNDS : FLOOR_IMAGES[currentFloor]?.bounds}
      maxBoundsViscosity={mapMode === "OUTDOOR" ? 1 : 0}
      minZoom={OUTDOOR_ZOOM.min}
      maxZoom={OUTDOOR_ZOOM.max}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom
      doubleClickZoom
      touchZoom
      boxZoom={false}
      bounceAtZoomLimits={false}
      className="campus-map"
    >
      {/* Add this div somewhere inside your map component layout */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: '2px 5px',
        fontSize: '11px',
        fontFamily: 'sans-serif',
        zIndex: 1000,
        borderRadius: '3px'
      }}>
        &copy; OpenStreetMap contributors <br /> &copy; CARTO
      </div>
      <ZoomControl position="bottomright" />
      <MapZoomManager
        mapMode={mapMode}
        currentFloor={currentFloor}
        route={route}
        indoorRoute={visibleIndoorRoute}
      />
      {/* ── OUTDOOR MODE ─────────────────────────────────────────────────── */}
      {mapMode === "OUTDOOR" && (
        <>
          {/* Base tile layer */}
          <TileLayer
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            maxNativeZoom={OUTDOOR_ZOOM.maxNative}
            maxZoom={OUTDOOR_ZOOM.max}
            keepBuffer={4}
            updateWhenZooming={false}
            updateWhenIdle
          />
          {/* Green lawn / garden zones */}
          {GREEN_AREAS.map((area) => (
            <Polygon
              key={area.id}
              positions={area.positions}
              color="#2e7d32"
              weight={1}
              opacity={0.35}
              fillColor="#a5d6a7"
              fillOpacity={0.42}
            />
          ))}
          {/* Parking areas */}
          {PARKING_AREAS.map((p) => (
            <Polygon
              key={p.id}
              positions={p.positions}
              color="#78909c"
              weight={1}
              opacity={0.5}
              fillColor="#78909c"
              fillOpacity={0.5}
            />
          ))}
          {/* Active navigation route */}
          {route.length > 0 && (
            <>
              {/* Main route line */}
              <Polyline
                positions={route}
                color="#1a73e8"
                weight={7}
                opacity={0.95}
                lineCap="round"
                lineJoin="round"
              />
            </>
          )}
          {/* Outdoor location dot markers */}
          {visibleOutdoorMarkers.map((location) => (
            <LocationMarker
              key={location.id}
              location={location}
              selectedLocation={selectedLocation}
              icon={outdoorPointIcon}
            />
          ))}
          {destinationMarker && (
            <LocationMarker
              key={`destination-${destinationMarker.id}`}
              location={destinationMarker}
              selectedLocation={selectedLocation}
              icon={outdoorDestinationIcon}
            />
          )}
          {/* Current (GPS / snapped) user position */}
          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={outdoorUserIcon}
            >
              <Popup>You are here</Popup>
            </Marker>
          )}
        </>
      )}
      {BUILDINGS.map((building, index) => (
        <Marker
          key={index}
          position={building.position}
          icon={L.divIcon({
            className: "building-label",
            html: `<div>${building.name}</div>`,
            iconSize: [120, 25],
            iconAnchor: [60, 12],
          })}
        />
      ))}
      {/* ── INDOOR MODE ──────────────────────────────────────────────────── */}
      {mapMode === "INDOOR" && FLOOR_IMAGES[currentFloor] && (
        <>
          <ImageOverlay
            key={currentFloor}
            url={FLOOR_IMAGES[currentFloor].url}
            bounds={FLOOR_IMAGES[currentFloor].bounds}
            opacity={1}
            interactive
            eventHandlers={{
              click: ({ latlng }) => {
                console.log(
                  `[${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}]`
                );
              },
            }}
          />
          {(SHOW_INDOOR_DEBUG_MARKERS || SHOW_INDOOR_DEBUG_TOOLS) &&
            Object.entries(INDOOR_NODES)
              .filter(([, node]) => node.floor === currentFloor || node.floor === "ALL")
              .map(([id, node]) => (
                <Marker key={id} position={node.position} opacity={0.85}>
                  <Popup>
                    <strong>{node.label || id}</strong>
                    <br />
                    {node.position[0]}, {node.position[1]}
                  </Popup>
                </Marker>
              ))}
          {visibleIndoorRoute.length > 1 && (
            <>
              <Polyline
                positions={visibleIndoorRoute}
                color="#1d2229"
                weight={9}
                opacity={0.3}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                positions={visibleIndoorRoute}
                color="#0682ee"
                weight={5}
                opacity={0.95}
                lineCap="round"
                lineJoin="round"
              />
            </>
          )}
          {indoorUserLocation &&
            indoorUserLocation.floor === currentFloor && (
              <Marker
                position={indoorUserLocation.position}
                icon={indoorUserIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const latlng = e.target.getLatLng();
                    const position = [latlng.lat, latlng.lng];
                    const nearestNode = findNearestIndoorNode(position, currentFloor);
                    setIndoorUserLocation({ position, nearestNode });
                    setIndoorStart({
                      name: INDOOR_NODES[nearestNode]?.label || nearestNode,
                      nearestNode,
                    });
                  },
                }}
              >
                <Popup>You are here</Popup>
              </Marker>
            )}
          {destination &&
            destination.floor === currentFloor &&
            INDOOR_NODES[destination.id] && (
              <Marker
                position={INDOOR_NODES[destination.id].position}
                icon={destinationIcon}
              >
                <Popup>{destination.name}</Popup>
              </Marker>
            )}
        </>
      )}
      <FlyToLocation location={mapCenter} mapMode={mapMode} />
      <FollowCurrentLocation currentLocation={currentLocation} mapMode={mapMode} />
      {!indoorStart && (
        <IndoorLocationPicker
          indoorLocationMode={indoorLocationMode}
          indoorUserLocation={indoorUserLocation}
          setIndoorUserLocation={setIndoorUserLocation}
          currentFloor={currentFloor}
          setIndoorStart={setIndoorStart}
        />
      )}
      {SHOW_INDOOR_DEBUG_TOOLS && (
        <IndoorClickDebugger mapMode={mapMode} currentFloor={currentFloor} />
      )}
    </MapContainer>
  );
}
// ─── Helper sub-components ────────────────────────────────────────────────────
function FlyToLocation({ location, mapMode }) {
  const map = useMap();
  useEffect(() => {
    if (mapMode !== "OUTDOOR") return;
    if (!location?.position) return;
    const id = requestAnimationFrame(() => {
      map.flyTo(location.position, OUTDOOR_ZOOM.default, { duration: 0.8 });
    });
    return () => cancelAnimationFrame(id);
  }, [location?.id, location?.position, map, mapMode]);
  return null;
}
function MapZoomManager({ mapMode, currentFloor, route, indoorRoute }) {
  const map = useMap();
  useEffect(() => {
    if (mapMode === "OUTDOOR") {
      map.setMinZoom(OUTDOOR_ZOOM.min);
      map.setMaxZoom(OUTDOOR_ZOOM.max);
      map.setMaxBounds(CAMPUS_BOUNDS);
    } else {
      map.setMinZoom(INDOOR_ZOOM.min);
      map.setMaxZoom(INDOOR_ZOOM.max);
      map.setMaxBounds(FLOOR_IMAGES[currentFloor].bounds);
    }
    requestAnimationFrame(() => map.invalidateSize());
  }, [map, mapMode, currentFloor]);
  useEffect(() => {
    if (mapMode !== "OUTDOOR" || route.length < 2) return;
    map.flyToBounds(route, {
      paddingTopLeft: [32, 96],
      paddingBottomRight: [32, 160],
      maxZoom: 20,
      duration: 0.8,
    });
  }, [map, mapMode, route]);
  useEffect(() => {
    if (mapMode !== "INDOOR" || indoorRoute.length < 2) return;
    requestAnimationFrame(() => {
      map.flyToBounds(indoorRoute, {
        paddingTopLeft: [42, 92],
        paddingBottomRight: [42, 180],
        maxZoom: 24,
        duration: 0.6,
      });
    });
  }, [map, mapMode, indoorRoute]);
  return null;
}
function LocationMarker({ location, selectedLocation, icon }) {
  const markerRef = useRef(null);
  useEffect(() => {
    if (selectedLocation?.id === location.id) {
      markerRef.current?.openPopup();
    }
  }, [selectedLocation, location.id]);
  return (
    <Marker ref={markerRef} position={location.position} icon={icon}>
      <Popup>{location.name}</Popup>
    </Marker>
  );
}
function IndoorClickDebugger({ mapMode, currentFloor }) {
  const map = useMap();
  useEffect(() => {
    if (mapMode !== "INDOOR") return;
    const handleClick = (event) => {
      console.log({ floor: currentFloor, position: [event.latlng.lat, event.latlng.lng] });
    };
    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, mapMode, currentFloor]);
  return null;
}
function FollowCurrentLocation({ currentLocation, mapMode }) {
  const map = useMap();
  useEffect(() => {
    if (mapMode !== "OUTDOOR" || !currentLocation) return;
    map.flyTo([currentLocation.lat, currentLocation.lng], map.getZoom(), { duration: 0.8 });
  }, [currentLocation, mapMode, map]);
  return null;
}
function IndoorLocationPicker({
  indoorLocationMode,
  indoorUserLocation,
  setIndoorUserLocation,
  currentFloor,
  setIndoorStart,
}) {
  useMapEvents({
    click(e) {
      if (!indoorLocationMode) return;
      if (!indoorUserLocation) {
        const position = [e.latlng.lat, e.latlng.lng];
        const nearestNode = findNearestIndoorNode(position, currentFloor);
        setIndoorUserLocation({ position, nearestNode });
        setIndoorStart({
          name: INDOOR_NODES[nearestNode]?.label || nearestNode,
          nearestNode,
        });
      }
    },
  });
  return null;
}
export default CampusMap;