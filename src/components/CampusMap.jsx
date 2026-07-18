import { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  Tooltip,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotate";
import L from "leaflet";
import { CAMPUS_BOUNDS, LOCATIONS } from "../data/locations";
import { FLOOR_IMAGES, CHAVARA_FLOOR_IMAGES } from "../data/floorImages";
import { INDOOR_NODES } from "../data/indoorNodes";
import { findNearestIndoorNode } from "../utils/findNearestIndoorNode";

// ─── Debug flags ──────────────────────────────────────────────────────────────
const SHOW_INDOOR_DEBUG_MARKERS = true;
const SHOW_INDOOR_DEBUG_TOOLS = false;
const INITIAL_OUTDOOR_MARKER_IDS = [
  "chavara",
  "canteen",
  "st-marys-block",
  "cafe",
  "joseph",
];

// ─── Zoom constants ───────────────────────────────────────────────────────────
const OUTDOOR_ZOOM = {
  default: 18,
  min: 16,
  max: 22,
  maxNative: 19,
};
const INDOOR_ZOOM = {
  min: 18,
  max: 26,
  overview: 22,
};

// ─── Buildings list ───────────────────────────────────────────────────────────
const BUILDINGS = [
  { name: "St Chavara\nBlock", position: [10.355897, 76.212608] },
  { name: "St Mary's\nBlock", position: [10.357831, 76.212684] },
  { name: "Canteen", position: [10.35740, 76.212602] },
  { name: "Open\nAuditorium", position: [10.356543, 76.212435] },
  { name: "Cafe", position: [10.355706, 76.212082] },
  { name: "St Joseph's\nBlock", position: [10.358869, 76.212778] },
  { name: "Amphitheatre", position: [10.358051, 76.213301] },
];

// ─── Campus Feature Data ──────────────────────────────────────────────────────
const GREEN_AREAS = [
  {
    id: "lawn-mid-west",
    positions: [
      [10.358571, 76.21273], [10.358582, 76.213004],
      [10.359046, 76.213009], [10.359094, 76.212601],
      [10.358925, 76.212607], [10.358925, 76.212478],
      [10.358783, 76.212483], [10.358761, 76.212644],
    ],
  },
  {
    id: "lawn-chavara-side",
    positions: [
      [10.355565, 76.212459], [10.35557, 76.212711],
      [10.356272, 76.212716], [10.356282, 76.212443],
    ],
  },
  {
    id: "lawn-north",
    positions: [
      [10.35756, 76.212521], [10.357661, 76.212843],
      [10.357808, 76.212982], [10.358008, 76.21292],
      [10.358076, 76.212748], [10.357992, 76.212367],
    ],
  },
];
const PARKING_AREAS = [
  {
    id: "lawn-stmarys-side",
    positions: [
      [10.355781, 76.212029], [10.35577, 76.212185],
      [10.355596, 76.212169], [10.355612, 76.212013],
    ],
  },
  {
    id: "parking-north",
    positions: [
      [10.357233, 76.212617], [10.357249, 76.212692],
      [10.357502, 76.212639], [10.35745, 76.212456],
    ],
  },
];

// ─── Bearing calculation ──────────────────────────────────────────────────────
/**
 * Returns the compass bearing (degrees, 0 = north, clockwise) from point A to B.
 * Both points are [lat, lng] arrays.
 */
function getBearing(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function makeArrowIcon(bearing, turnDiff = 0) {
  let svgHtml;

  if (Math.abs(turnDiff) < 5) {
    // straight
    svgHtml = `<div class="route-arrow" style="transform: rotate(${bearing}deg); transform-origin: 16px 16px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none">
        <path d="M16 4 L16 28 M11 10 L16 4 L21 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="1"/>
      </svg>
    </div>`;
  } else {
    // Convert angle to radians for math
    const rad = (turnDiff * Math.PI) / 180;

    // Origin/Corner
    const cx = 16, cy = 16;

    // Curve radius
    const R = 5;

    // Incoming line ends at P1 (16, 16 + R)
    const p1y = 16 + R;

    // Outgoing direction vector (0 deg is UP, positive is clockwise)
    const vx = Math.sin(rad);
    const vy = -Math.cos(rad);

    // Curve ends at P2 (distance R along outgoing vector)
    const p2x = cx + R * vx;
    const p2y = cy + R * vy;

    // Outgoing shaft ends at P3 (distance L along outgoing vector)
    const L = 12; // length of outgoing shaft
    const p3x = cx + L * vx;
    const p3y = cy + L * vy;

    // Arrowhead points
    const barbLength = 6.5;
    const barbRad1 = rad + (145 * Math.PI / 180);
    const barbRad2 = rad - (145 * Math.PI / 180);

    const barb1x = p3x + barbLength * Math.sin(barbRad1);
    const barb1y = p3y - Math.cos(barbRad1) * barbLength;

    const barb2x = p3x + barbLength * Math.sin(barbRad2);
    const barb2y = p3y - Math.cos(barbRad2) * barbLength;

    svgHtml = `<div class="route-arrow" style="transform: rotate(${bearing}deg); transform-origin: 16px 16px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none">
        <path d="M 16,28 L 16,${p1y} Q 16,16 ${p2x},${p2y} L ${p3x},${p3y}" stroke="white" stroke-width="3" stroke-linecap="round" fill="none" opacity="1"/>
        <path d="M ${barb1x},${barb1y} L ${p3x},${p3y} L ${barb2x},${barb2y}" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1"/>
      </svg>
    </div>`;
  }

  return L.divIcon({
    className: "route-arrow-icon",
    html: svgHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const destinationIcon = L.divIcon({
  className: "destination-dot",
  html: `<div class="destination-pin-wrap">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="26" height="35">
      <path d="M18 2C10.3 2 4 8.2 4 16c0 10.5 14 28.5 14 28.5S32 26.5 32 16C32 8.2 25.7 2 18 2Z" fill="#e5484d" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="16" r="7" fill="white"/>
      <circle cx="18" cy="16" r="3.2" fill="#e5484d"/>
    </svg>
  </div>`,
  iconSize: [26, 35],
  iconAnchor: [13, 35],
  popupAnchor: [0, -35],
});

function makeUserIcon(heading) {
  const hasHeading = heading !== null && !isNaN(heading);
  return L.divIcon({
    className: "user-location-marker",
    html: `
      <div class="user-dot-wrap">
        ${hasHeading ? `
          <div class="user-heading-beam" style="transform: rotate(${heading}deg)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80" style="display: block;">
              <path d="M 50,100 L 15,10 A 40,40 0 0,1 85,10 Z" fill="url(#beamGradient)"/>
              <defs>
                <linearGradient id="beamGradient" x1="0.5" y1="1" x2="0.5" y2="0">
                  <stop offset="0%" stop-color="#1a73e8" stop-opacity="0.45"/>
                  <stop offset="100%" stop-color="#1a73e8" stop-opacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        ` : ""}
        <div class="user-dot">
          ${hasHeading ? `<div class="user-heading-arrow" style="transform: rotate(${heading}deg)">&#9650;</div>` : ""}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

const indoorUserIcon = L.divIcon({
  className: "indoor-location-marker",
  html: `
    <div class="indoor-user-wrap">
      <div class="indoor-dot"></div>
      <div class="indoor-pulse"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const indoorDestinationIcon = L.divIcon({
  className: "indoor-destination-marker",
  html: `
    <div class="indoor-dest-wrap">
      <div class="indoor-dest-pulse"></div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="26" height="35" class="indoor-dest-svg">
        <path d="M18 2C10.3 2 4 8.2 4 16c0 10.5 14 28.5 14 28.5S32 26.5 32 16C32 8.2 25.7 2 18 2Z" fill="#e5484d" stroke="white" stroke-width="2"/>
        <circle cx="18" cy="16" r="7" fill="white"/>
        <path d="M15 16.2l2.1 2.1 4.2-4.4" fill="none" stroke="#e5484d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `,
  iconSize: [26, 35],
  iconAnchor: [13, 35],
  popupAnchor: [0, -35],
});

const outdoorPointIcon = L.divIcon({
  className: "outdoor-location-marker",
  html: `<div class="outdoor-location-dot"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const routeEndpointIcon = L.divIcon({
  className: "route-endpoint-icon",
  html: '<div class="route-endpoint-dot" aria-label="Route endpoint"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});


// ─── Arrow markers along a path ───────────────────────────────────────────────
// Helper to calculate simple planar distance in meters for path filtering
function getDistance(a, b) {
  const latScale = 111320;
  const lngScale = latScale * Math.cos(a[0] * Math.PI / 180);
  const dy = (b[0] - a[0]) * latScale;
  const dx = (b[1] - a[1]) * lngScale;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generates arrow DivIcon markers only at turnings along a lat/lng path.
 */
function buildArrowMarkers(path, minDistance = 15) {
  if (!path || path.length < 3) return [];
  const arrows = [];
  const start = path[0];
  const end = path[path.length - 1];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const bearing1 = getBearing(prev, curr);
    const bearing2 = getBearing(curr, next);

    // Calculate angle difference
    let diff = Math.abs(bearing2 - bearing1);
    if (diff > 180) diff = 360 - diff;

    // Angle change > 25 degrees defines a turning/bend
    if (diff > 25) {
      // Filter out points too close to user start or destination
      if (getDistance(start, curr) > minDistance && getDistance(end, curr) > minDistance) {
        let turnDiff = bearing2 - bearing1;
        if (turnDiff > 180) turnDiff -= 360;
        if (turnDiff < -180) turnDiff += 360;

        arrows.push({
          position: curr,
          bearing: bearing1, // Align with the incoming path segment
          turnDiff: turnDiff,
          key: `arr-turn-${i}`,
        });
      }
    }
  }

  // If there are no turnings but the path is long, show one arrow in the middle
  if (arrows.length === 0 && path.length >= 2) {
    const midIdx = Math.floor(path.length / 2);
    const a = path[midIdx - 1];
    const b = path[midIdx];
    const midPoint = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (getDistance(start, midPoint) > minDistance && getDistance(end, midPoint) > minDistance) {
      arrows.push({
        position: midPoint,
        bearing: getBearing(a, b),
        turnDiff: 0,
        key: `arr-mid`,
      });
    }
  }

  return arrows;
}

// ─── Main Component ───────────────────────────────────────────────────────
function CampusMap({
  selectedLocation,
  currentLocation,
  heading = null,
  subscribeToLocation,
  route = [],
  indoorRouteNodes = [],
  currentFloor,
  mapMode,
  destination,
  mapCenter,
  indoorUserLocation,
  setIndoorUserLocation,
  setIndoorStart,
  isOutdoorNavigating = false,
  useDebugLocation = false,
  activeFloorImages,
  activeIndoorNodes,
  // activeIndoorEdges,
}) {
  const [liveLocation, setLiveLocation] = useState(currentLocation);
  const [liveHeading, setLiveHeading] = useState(heading);

  useEffect(() => {
    if (!subscribeToLocation) return undefined;
    return subscribeToLocation((position, metadata) => {
      setLiveLocation(position);
      if (metadata?.heading !== null && !Number.isNaN(metadata?.heading)) {
        setLiveHeading(metadata.heading);
      }
    });
  }, [subscribeToLocation]);

  // Compute visible indoor route filtered to current floor
  const visibleIndoorRoute = indoorRouteNodes
    .filter((id) => activeIndoorNodes[id]?.floor === currentFloor)
    .map((id) => activeIndoorNodes[id].position);

  const visibleOutdoorMarkers = LOCATIONS.filter((loc) =>
    INITIAL_OUTDOOR_MARKER_IDS.includes(loc.id)
  );

  // Destination marker: show a pin at the fixed route endpoint (last node
  // of the *full* planned route) so it stays in place while the trimmed
  // route shrinks behind the user. Fall back to the LOCATIONS table for
  // the popup name.
  const routeDestinationPos = route.length > 0 ? route[route.length - 1] : null;
  const destinationMarkerName =
    (selectedLocation && LOCATIONS.find((loc) => loc.id === selectedLocation?.id)?.name) ||
    destination?.name ||
    selectedLocation?.name ||
    null;

  // Keep only the untravelled portion of the route. This is deliberately map
  // state, not navigation state: a GPS fix must never change a card by itself.
  const visibleOutdoorRoute = useMemo(
    () => trimRouteFromLocation(route, liveLocation),
    [route, liveLocation]
  );

  // Build arrow markers
  const outdoorArrows = buildArrowMarkers(visibleOutdoorRoute, 15);
  const indoorArrows = buildArrowMarkers(visibleIndoorRoute, 2);

  // "You are here" toast — shown for 3 s when a new route appears
  const [showYouAreHere, setShowYouAreHere] = useState(false);
  const youAreHereTimer = useRef(null);
  const prevRouteKey = useRef("");
  useEffect(() => {
    let routeKey = "";
    if (mapMode === "INDOOR" && visibleIndoorRoute.length >= 2) {
      routeKey = "indoor_" + visibleIndoorRoute[0].join(",") + "_" + visibleIndoorRoute[visibleIndoorRoute.length - 1].join(",");
    } else if (mapMode === "OUTDOOR" && route.length >= 2) {
      routeKey = "outdoor_" + route[0].join(",") + "_" + route[route.length - 1].join(",");
    }

    if (!routeKey || routeKey === prevRouteKey.current) return;
    prevRouteKey.current = routeKey;
    setShowYouAreHere(true);
    clearTimeout(youAreHereTimer.current);
    youAreHereTimer.current = setTimeout(() => setShowYouAreHere(false), 3000);
  }, [mapMode, visibleIndoorRoute, route]);

  // User icon with heading
  const outdoorUserIconDynamic = makeUserIcon(liveHeading);

  return (
    <MapContainer
      center={[10.354098, 76.212307]}
      zoom={OUTDOOR_ZOOM.default}
      maxBounds={
        mapMode === "OUTDOOR"
          ? CAMPUS_BOUNDS
          : activeFloorImages[currentFloor]?.bounds
      }
      maxBoundsViscosity={mapMode === "OUTDOOR" ? 1 : 0}
      minZoom={OUTDOOR_ZOOM.min}
      maxZoom={OUTDOOR_ZOOM.max}
      zoomControl={mapMode === "INDOOR"}
      attributionControl={false}
      scrollWheelZoom
      doubleClickZoom
      touchZoom
      pinchZoom
      zoomSnap={0.25}
      rotate
      rotateControl={false}
      boxZoom={false}
      bounceAtZoomLimits={false}
      className={`campus-map ${mapMode === "INDOOR" ? "campus-map--indoor" : ""}`}
    >
      {/* Attribution */}
      <div
        style={{
          position: "absolute",
          bottom: "5px",
          right: "5px",
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: "2px 5px",
          fontSize: "11px",
          fontFamily: "sans-serif",
          zIndex: 1000,
          borderRadius: "3px",
        }}
      >
        &copy; OpenStreetMap contributors &copy; CARTO
      </div>

      {/* Map zoom + rotation manager */}
      <MapZoomManager
        mapMode={mapMode}
        currentFloor={currentFloor}
        route={route}
        visibleIndoorRoute={visibleIndoorRoute}
        indoorUserLocation={indoorUserLocation}
        activeFloorImages={activeFloorImages}
        activeIndoorNodes={activeIndoorNodes}
      />
      <MapEventBridge mapMode={mapMode} />
      {/* GPS auto-center on first fix; smooth pan during active navigation */}
      <LocationManager
        subscribeToLocation={subscribeToLocation}
        isOutdoorNavigating={isOutdoorNavigating}
        useDebugLocation={useDebugLocation}
        currentLocation={currentLocation}
        mapMode={mapMode}
      />

      {/* ── OUTDOOR MODE ───────────────────────────────────────────────── */}
      {mapMode === "OUTDOOR" && (
        <>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            maxNativeZoom={OUTDOOR_ZOOM.maxNative}
            maxZoom={OUTDOOR_ZOOM.max}
            keepBuffer={4}
            updateWhenZooming={false}
            updateWhenIdle
          />

          {/* Green lawn zones */}
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

          {/* Route: shadow + main line + arrows */}
          {visibleOutdoorRoute.length > 0 && (
            <>
              {/* Outer Glow / shadow */}
              <Polyline
                positions={visibleOutdoorRoute}
                color="#1E3A8A"
                weight={17}
                opacity={0.15}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                positions={visibleOutdoorRoute}
                color="#1E3A8A"
                weight={12}
                opacity={0.3}
                lineCap="round"
                lineJoin="round"
              />
              {/* Main vibrant blue route */}
              <Polyline
                positions={visibleOutdoorRoute}
                color="#3B82F6"
                weight={9}
                opacity={1}
                lineCap="round"
                lineJoin="round"
              />
              {/* Lighter inner highlight */}
              <Polyline
                positions={visibleOutdoorRoute}
                color="#93C5FD"
                weight={3.5}
                opacity={0.9}
                lineCap="round"
                lineJoin="round"
              />
              {/* Directional arrows */}
              {outdoorArrows.map((a) => (
                <Marker
                  key={a.key}
                  position={a.position}
                  icon={makeArrowIcon(a.bearing, a.turnDiff)}
                  interactive={false}
                />
              ))}
              <Marker position={visibleOutdoorRoute[visibleOutdoorRoute.length - 1]} icon={routeEndpointIcon} interactive={false} zIndexOffset={800} />
            </>
          )}

          {/* Outdoor location dots */}
          {visibleOutdoorMarkers.map((location) => (
            <LocationMarker
              key={location.id}
              location={location}
              selectedLocation={selectedLocation}
              icon={outdoorPointIcon}
            />
          ))}

          {/* Destination marker: fixed pin at route endpoint */}
          {routeDestinationPos && (
            <Marker
              key={`dest-pin-${routeDestinationPos}`}
              position={routeDestinationPos}
              icon={destinationIcon}
              zIndexOffset={900}
            >
              {destinationMarkerName && (
                <Popup><strong>{destinationMarkerName}</strong></Popup>
              )}
            </Marker>
          )}

          {/* Live GPS user dot */}
          {liveLocation && (
            <Marker
              position={[liveLocation.lat, liveLocation.lng]}
              icon={outdoorUserIconDynamic}
              zIndexOffset={1000}
            >
              <Popup>You are here</Popup>
              {showYouAreHere && (
                <Tooltip permanent direction="top" offset={[0, -10]} className="yah-tooltip-container">
                  <div className="yah-toast">
                    <span style={{ fontSize: "18px" }}>📍</span> You are here
                  </div>
                </Tooltip>
              )}
            </Marker>
          )}
        </>
      )}

      {/* Building labels — always visible */}
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

      {/* ── INDOOR MODE ────────────────────────────────────────────────── */}
      {mapMode === "INDOOR" && activeFloorImages[currentFloor] && (
        <>
          <ImageOverlay
            key={currentFloor}
            url={activeFloorImages[currentFloor].url}
            bounds={activeFloorImages[currentFloor].bounds}
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

          {/* Debug node markers */}
          {(SHOW_INDOOR_DEBUG_MARKERS || SHOW_INDOOR_DEBUG_TOOLS) &&
            Object.entries(activeIndoorNodes)
              .filter(
                ([, node]) =>
                  node.floor === currentFloor || node.floor === "ALL"
              )
              .map(([id, node]) => (
                <Marker key={id} position={node.position} opacity={0.85}>
                  <Popup>
                    <strong>{node.label || id}</strong>
                    <br />
                    {node.position[0]}, {node.position[1]}
                  </Popup>
                </Marker>
              ))}

          {/* Indoor route polyline + arrows */}
          {visibleIndoorRoute.length > 1 && (
            <>
              {/* Outer Glow / shadow */}
              <Polyline
                positions={visibleIndoorRoute}
                color="#1E3A8A"
                weight={17}
                opacity={0.15}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                positions={visibleIndoorRoute}
                color="#1E3A8A"
                weight={12}
                opacity={0.3}
                lineCap="round"
                lineJoin="round"
              />
              {/* Main vibrant blue route */}
              <Polyline
                positions={visibleIndoorRoute}
                color="#3B82F6"
                weight={9}
                opacity={1}
                lineCap="round"
                lineJoin="round"
              />
              {/* Lighter inner highlight */}
              <Polyline
                positions={visibleIndoorRoute}
                color="#93C5FD"
                weight={3.5}
                opacity={0.9}
                lineCap="round"
                lineJoin="round"
              />
              {/* Directional arrows */}
              {indoorArrows.map((a) => (
                <Marker
                  key={a.key}
                  position={a.position}
                  icon={makeArrowIcon(a.bearing, a.turnDiff)}
                  interactive={false}
                />
              ))}
              <Marker position={visibleIndoorRoute[visibleIndoorRoute.length - 1]} icon={routeEndpointIcon} interactive={false} zIndexOffset={800} />
            </>
          )}

          {/* Indoor user marker */}
          {indoorUserLocation &&
            indoorUserLocation.floor === currentFloor && (
              <Marker
                position={indoorUserLocation.position}
                icon={indoorUserIcon}
                draggable={true}
                zIndexOffset={1000}
                eventHandlers={{
                  dragend: (e) => {
                    const latlng = e.target.getLatLng();
                    const position = [latlng.lat, latlng.lng];
                    const nearestNode = findNearestIndoorNode(
                      position,
                      currentFloor
                    );
                    setIndoorUserLocation({ position, nearestNode });
                    setIndoorStart({
                      name: activeIndoorNodes[nearestNode]?.label || nearestNode,
                      nearestNode,
                    });
                  },
                }}
              >
                <Popup>You are here</Popup>
                {showYouAreHere && (
                  <Tooltip permanent direction="top" offset={[0, -32]} className="yah-tooltip-container">
                    <div className="yah-toast">
                      <span style={{ fontSize: "18px" }}>📍</span> You are here
                    </div>
                  </Tooltip>
                )}
              </Marker>
            )}

          {/* Indoor destination marker */}
          {destination &&
            destination.floor === currentFloor &&
            activeIndoorNodes[destination.id] && (
              <Marker
                position={activeIndoorNodes[destination.id].position}
                icon={indoorDestinationIcon}
                zIndexOffset={900}
              >
                <Popup>
                  <strong>{destination.name}</strong>
                </Popup>
              </Marker>
            )}
        </>
      )}

      {/* Fly-to helpers */}
      <FlyToLocation location={mapCenter} mapMode={mapMode} />
    </MapContainer>
  );
}

// Finds the closest point on the planned polyline and drops the already passed
// segments. Equirectangular coordinates are accurate at campus scale.
function trimRouteFromLocation(route, location) {
  if (!location || route.length < 2) return route;
  const latScale = 111320;
  const lngScale = latScale * Math.cos(location.lat * Math.PI / 180);
  const point = [location.lat, location.lng];
  let closest = { distanceSquared: Infinity, segment: 0, point: route[0] };

  for (let index = 0; index < route.length - 1; index += 1) {
    const start = route[index];
    const end = route[index + 1];
    const dx = (end[1] - start[1]) * lngScale;
    const dy = (end[0] - start[0]) * latScale;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? Math.max(0, Math.min(1, (((point[1] - start[1]) * lngScale * dx) + ((point[0] - start[0]) * latScale * dy)) / lengthSquared)) : 0;
    const projected = [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
    const distanceSquared = ((point[1] - projected[1]) * lngScale) ** 2 + ((point[0] - projected[0]) * latScale) ** 2;
    if (distanceSquared < closest.distanceSquared) closest = { distanceSquared, segment: index, point: projected };
  }

  // Do not distort the route if the user is far away from it (for example a
  // poor GPS reading or an intentional detour).
  if (closest.distanceSquared > 45 ** 2) return route;
  return [point, closest.point, ...route.slice(closest.segment + 1)];
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function FlyToLocation({ location, mapMode }) {
  const map = useMap();
  useEffect(() => {
    if (mapMode !== "OUTDOOR") return;
    if (!location?.position) return;
    const id = requestAnimationFrame(() => {
      // Never zoom out when the user asks for their location.  This makes the
      // control behave like a native map "my location" FAB.
      map.flyTo(location.position, Math.max(map.getZoom(), OUTDOOR_ZOOM.default), { duration: 0.8 });
    });
    return () => cancelAnimationFrame(id);
  }, [location?.id, location?.position, map, mapMode]);
  return null;
}

function MapZoomManager({
  mapMode,
  currentFloor,
  route,
  visibleIndoorRoute = [],
  indoorUserLocation,
  activeFloorImages,
  activeIndoorNodes,
}) {
  const map = useMap();
  const prevModeRef = useRef(mapMode);
  const prevFloorRef = useRef(currentFloor);

  // Update zoom/bounds when mode or floor changes
  useEffect(() => {
    if (mapMode === "OUTDOOR") {
      map.setMinZoom(OUTDOOR_ZOOM.min);
      map.setMaxZoom(OUTDOOR_ZOOM.max);
      map.setMaxBounds(CAMPUS_BOUNDS);
    } else {
      map.setMinZoom(INDOOR_ZOOM.min);
      map.setMaxZoom(INDOOR_ZOOM.max);
      if (activeFloorImages[currentFloor]) {
        map.setMaxBounds(null);
      }
    }
    requestAnimationFrame(() => map.invalidateSize());
  }, [map, mapMode, currentFloor]);

  // When entering indoor mode or changing floor: fit the full floor image
  useEffect(() => {
    const modeChanged = prevModeRef.current !== mapMode;
    const floorChanged = prevFloorRef.current !== currentFloor;
    prevModeRef.current = mapMode;
    prevFloorRef.current = currentFloor;

    if (mapMode !== "INDOOR") return;
    if (!activeFloorImages[currentFloor]) return;

    if (modeChanged) {
      requestAnimationFrame(() => {
        map.fitBounds(activeFloorImages[currentFloor].bounds, {
          maxZoom: INDOOR_ZOOM.overview + 0.5,
        });
      });
    }
  }, [map, mapMode, currentFloor]);

  // Fit outdoor route bounds
  useEffect(() => {
    if (mapMode !== "OUTDOOR" || route.length < 2) return;
    map.fitBounds(route, {
      paddingTopLeft: [32, 96],
      paddingBottomRight: [32, 160],
      maxZoom: 20,
      animate: true,
      duration: 1.2,
    });
  }, [map, mapMode, route]);

  // Helper to calculate the bounding box center of all nodes on a floor
  const getFloorNodesCenter = (floor) => {
    const floorNodes = Object.values(activeIndoorNodes).filter(
      (n) => n.floor === floor
    );
    if (floorNodes.length === 0) return [10.35789, 76.21293]; // fallback to ST_MARYS_BOUNDS center

    const lats = floorNodes.map((n) => n.position[0]);
    const lngs = floorNodes.map((n) => n.position[1]);

    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  };

  // Indoor rotation — place the user at the BOTTOM of the screen.
  //
  // Rules (based on which side of the floor the user is on):
  //   User at BOTTOM (south)  → no rotation       (setBearing  0°)
  //   User at LEFT   (west)   → rotate 90° right   (setBearing 90°, east at top)
  //   User at TOP    (north)  → rotate 180°         (setBearing 180°)
  //   User at RIGHT  (east)   → rotate 90° left     (setBearing 270°, west at top)
  //
  // We determine the side by computing the bearing from the center of the node grid
  // to the user and splitting into four equal 90° sectors.
  useEffect(() => {
    if (!map.setBearing) return;

    if (mapMode === "INDOOR") {
      const isChavara = activeFloorImages === CHAVARA_FLOOR_IMAGES;
      if (isChavara) {
        map.setBearing(0, { animate: false });

        const userPos = indoorUserLocation?.position || (visibleIndoorRoute.length > 0 ? visibleIndoorRoute[0] : null);
        if (userPos && visibleIndoorRoute.length >= 2) {
          requestAnimationFrame(() => {
            map.setView(userPos, 22, {
              animate: true,
              duration: 1.2,
            });
          });
        } else {
          requestAnimationFrame(() => {
            if (activeFloorImages[currentFloor]) {
              map.fitBounds(activeFloorImages[currentFloor].bounds, {
                maxZoom: INDOOR_ZOOM.overview + 0.5,
                padding: [30, 30],
                animate: true,
                duration: 1.2,
              });
            }
          });
        }
        return;
      }

      const userPos = indoorUserLocation?.position || (visibleIndoorRoute.length > 0 ? visibleIndoorRoute[0] : null);

      if (!userPos) {
        map.setBearing(0, { animate: false });
        return;
      }

      let snapped = 0;

      if (visibleIndoorRoute.length >= 2) {
        // Path-based rotation: put the direction of the next node at the TOP of the screen
        const nextNode = visibleIndoorRoute[1];
        const pathBearing = getBearing(userPos, nextNode);
        snapped = (360 - (Math.round(pathBearing / 90) * 90)) % 360;

        map.setBearing(snapped, { animate: true });

        // Center on the user's location with a high zoom for close-up navigation
        requestAnimationFrame(() => {
          map.setView(userPos, 22, {
            animate: true,
            duration: 1.2,
          });
        });
      } else {
        // Side-based rotation: determine side relative to the nodes center
        const nodeCenter = getFloorNodesCenter(currentFloor);
        const centerToUser = getBearing(nodeCenter, userPos);

        if (centerToUser >= 135 && centerToUser < 225) {
          snapped = 0; // South -> bottom (0)
        } else if (centerToUser >= 225 && centerToUser < 315) {
          snapped = 270; // West -> bottom (270)
        } else if (centerToUser >= 315 || centerToUser < 45) {
          snapped = 180; // North -> bottom (180)
        } else {
          snapped = 90; // East -> bottom (90)
        }

        map.setBearing(snapped, { animate: true });

        // Fit the entire floor plan for overview
        requestAnimationFrame(() => {
          if (activeFloorImages[currentFloor]) {
            map.fitBounds(activeFloorImages[currentFloor].bounds, {
              maxZoom: INDOOR_ZOOM.overview + 0.5,
              padding: [30, 30],
              animate: true,
              duration: 1.2,
            });
          }
        });
      }
    } else {
      // Outdoor — reset to north-up
      map.setBearing(0, { animate: false });
    }
  }, [map, mapMode, visibleIndoorRoute, indoorUserLocation, currentFloor]);

  return null;
}

/** Keeps Leaflet's canvas sized correctly after a mode/overlay transition. */
function MapEventBridge({ mapMode }) {
  const map = useMap();
  useMapEvents({
    load() {
      map.invalidateSize();
    },
  });
  useEffect(() => {
    requestAnimationFrame(() => map.invalidateSize());
  }, [map, mapMode]);
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

/**
 * LocationManager — lives inside MapContainer so it has access to the Leaflet
 * map instance via useMap().
 *
 * Behaviour:
 *  1. On the very first GPS fix, fly the outdoor map to the user's position
 *     so the blue dot is immediately visible (even at the default campus zoom).
 *  2. While isOutdoorNavigating is true, softly pan the map on every
 *     subsequent fix so the user stays centred during active navigation.
 *
 * The isNavigating ref pattern prevents stale closures inside the long-lived
 * subscribeToLocation callback.
 */
function LocationManager({ subscribeToLocation, isOutdoorNavigating, useDebugLocation, currentLocation, mapMode }) {
  const map = useMap();
  const initializedRef = useRef(false);
  const isNavigatingRef = useRef(isOutdoorNavigating);
  const mapModeRef = useRef(mapMode);

  // Keep refs current on every render without re-subscribing
  useEffect(() => { isNavigatingRef.current = isOutdoorNavigating; }, [isOutdoorNavigating]);
  useEffect(() => { mapModeRef.current = mapMode; }, [mapMode]);

  // For debug mode, auto-center once on the fixed location
  useEffect(() => {
    if (!useDebugLocation || !currentLocation || initializedRef.current) return;
    if (mapModeRef.current !== "OUTDOOR") return;
    initializedRef.current = true;
    requestAnimationFrame(() => {
      map.flyTo(
        [currentLocation.lat, currentLocation.lng],
        Math.max(map.getZoom(), OUTDOOR_ZOOM.default),
        { duration: 1.0 }
      );
    });
  }, [map, useDebugLocation, currentLocation]);

  // For live GPS, auto-center on first fix and pan during navigation
  useEffect(() => {
    if (!subscribeToLocation || useDebugLocation) return undefined;
    const unsubscribe = subscribeToLocation((position) => {
      if (mapModeRef.current !== "OUTDOOR") return;

      if (!initializedRef.current) {
        // First ever fix — fly to user so the blue dot is visible
        initializedRef.current = true;
        map.flyTo(
          [position.lat, position.lng],
          Math.max(map.getZoom(), OUTDOOR_ZOOM.default),
          { duration: 1.2 }
        );
      } else if (isNavigatingRef.current) {
        // Active navigation — keep user centred with a gentle pan
        map.panTo([position.lat, position.lng], { animate: true, duration: 0.4 });
      }
    });
    return unsubscribe;
    // subscribeToLocation and useDebugLocation are stable refs — intentionally
    // omitting them from the dep array to avoid re-subscribing on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

export default CampusMap;
