import { useState, useEffect, useRef } from "react";

import CampusMap from "./components/CampusMap";

import SearchBar from "./components/SearchBar";

import { findPath } from "./utils/findPath";
import { openGoogleMapsNavigation } from "./utils/openGoogleMaps";

import { EDGES, NODES } from "./data/graph";

import { INDOOR_EDGES } from "./data/indoorGraph";

import { INDOOR_NODES } from "./data/indoorNodes";

import "./App.css";

import FloorSelector from "./components/FloorSelector";

import useCurrentLocation from "./hooks/useCurrentLocation";

import SearchChips from "./components/SearchChips";

import BottomSheet from "./components/BottomSheet";

import { bottomSheetData } from "./data/bottomSheetData";

import { isInsideCampus } from "./utils/isInsideCampus";

import { CAMPUS_ENTRANCE } from "./data/campus";

import { findNearestNode } from "./utils/findNearestNode";

import IndoorRoutingCard from "./components/IndoorRoutingCard";

import { findNearestLocation } from "./utils/findNearestLocation";
import { findNearestQRLocation } from "./utils/findNearestQRLocation";
import { findNearestStMarysEntrance } from "./utils/findNearestEntrance";
import { calculateHaversineDistance } from "./utils/haversine";
import { QR_LOCATIONS } from "./data/qrLocations";
import { CHAVARA_INDOOR_NODES } from "./data/chavaraIndoorNodes";
import { CHAVARA_INDOOR_EDGES } from "./data/chavaraIndoorGraph";
import { FLOOR_IMAGES, CHAVARA_FLOOR_IMAGES } from "./data/floorImages";


const STEPS = {

  IDLE: "IDLE",

  OUTDOOR_ROUTE: "OUTDOOR_ROUTE",

  OUTDOOR_NAVIGATING: "OUTDOOR_NAVIGATING",

  GO_TO_ENTRANCE: "GO_TO_ENTRANCE",

  AT_BUILDING: "AT_BUILDING",

  FLOOR_CHOICE: "FLOOR_CHOICE",

  FLOOR_NAVIGATION: "FLOOR_NAVIGATION",

  COMPLETED: "COMPLETED",

  GO_TO_FLOOR: "GO_TO_FLOOR",

  REACHED_EXIT: "REACHED_EXIT",

  ASK_INSIDE_BUILDING: "ASK_INSIDE_BUILDING",

  SELECT_CURRENT_FLOOR: "SELECT_CURRENT_FLOOR",

  PICK_INDOOR_LOCATION: "PICK_INDOOR_LOCATION",

  INDOOR_SEARCH: "INDOOR_SEARCH",

  INDOOR_READY: "INDOOR_READY",

  OUTDOOR_REACHED: "OUTDOOR_REACHED",

};

const floorEntryMap = {

  B2: "b2",

  B1: "b1",

  G: "g",

  1: "g",

  2: "g",

};

const indoorEntranceByFloor = {

  B2: "entrance_B2",

  B1: "entrance_B1",

  G: "entrance_G",

};

const outdoorEntranceFloor = {
  b2: "B2",
  b1: "B1",
  g: "G",
  chavara: "G",
};

function normalizeFloor(floor) {
  if (!floor) return "G";
  const fStr = floor.toString().toUpperCase().trim();
  if (fStr.startsWith("B")) return fStr; // Keep "B1", "B2" intact
  if (fStr.startsWith("G")) return "G";
  const match = fStr.match(/(\d+)/);
  if (match) return match[1]; // Extracts "1" from "F1", "5" from "5th Floor", etc.
  return floor;
}

// ── GPS debug toggle ─────────────────────────────────────────────────────────
// Set to true while testing away from campus; set it back to false for real GPS.
const USE_DEBUG_LOCATION = true;
const USER_LOCATION = {
  lat: 10.358006,
  lng: 76.213215,
};

// St Mary's Block main entrance – used for geofence proximity check
// Trigger "arrived at St Mary's?" prompt when within this many metres
const ST_MARYS_GEOFENCE_METERS = 30;
const ENTRANCE_CONFIRMATION_FIXES = 2;
const ST_MARYS_GPS_FALLBACK_METERS = 120;

// Outdoor destination proximity: show arrival card when this close to dest node
const OUTDOOR_ARRIVAL_GEOFENCE_METERS = 35;
const OUTDOOR_ARRIVAL_CONFIRMATION_FIXES = 2;

// Paste the published feedback form URL here when it is ready.
const FEEDBACK_FORM_URL = "https://docs.google.com/forms/d/1jv572SGp3e17tpvQmM-w1_EVgCc7j7MyJ1QrAQdf_zI/viewform";

function getPathCoordinates(path, nodes) {

  return path.map((node) => nodes[node]?.position || nodes[node]).filter(Boolean);

}

const routeLengthMeters = (path) => path.slice(1).reduce(
  (total, point, index) => total + calculateHaversineDistance(path[index][0], path[index][1], point[0], point[1]),
  0
);

function App() {

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [route, setRoute] = useState([]);

  const [destination, setDestination] = useState(null);

  const [currentFloor, setCurrentFloor] = useState("G");

  const [transportMode, setTransportMode] = useState(null);

  const [navStep, setNavStep] = useState(STEPS.IDLE);

  const [mapMode, setMapMode] = useState("OUTDOOR");

  // const [usingGoogleMaps, setUsingGoogleMaps] = useState(false);

  const [indoorRoute, setIndoorRoute] = useState([]);

  const [indoorRouteNodes, setIndoorRouteNodes] = useState([]);


  const {
    location,
    gpsStatus,        // ← add this
    getOneShotLocation,
    startTracking,
    stopTracking,
    subscribeToLocation,
    getLatestLocation,
    getApproximateLocation,
    gpsDistanceMeters,
  } = useCurrentLocation();

  useEffect(() => {
    console.log("Current Location:", location);
  }, [location]);

  // console.log("Current Location:", currentLocation);

  const [sheetOpen, setSheetOpen] = useState(false);

  const [sheetTitle, setSheetTitle] = useState("");

  const [sheetData, setSheetData] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [indoorUserLocation, setIndoorUserLocation] = useState(null);

  const [indoorStart, setIndoorStart] = useState(null);

  const [indoorDestination, setIndoorDestination] = useState(null);

  const [isOutdoorNavigating, setIsOutdoorNavigating] = useState(false);

  const [lastNearestNode, setLastNearestNode] = useState(null);

  const [scannedQR, setScannedQR] = useState(null);

  const [outdoorStartNode, setOutdoorStartNode] = useState(null);


  const getExitNode = (floor) => `entrance_${floor}`;

  const [remainingRoute, setRemainingRoute] = useState([]);
  const [nearestDebugNode, setNearestDebugNode] = useState(null);
  const [navigationMessage, setNavigationMessage] = useState("");
  const [fixedUserLocation, setFixedUserLocation] = useState(null);
  const [snappedLocation, setSnappedLocation] = useState(null);
  const [outdoorTarget, setOutdoorTarget] = useState(null);
  const [showNavigationCard, setShowNavigationCard] = useState(false);
  const [manualIndoorMode, setManualIndoorMode] = useState(false);
  const [selectedEntrance, setSelectedEntrance] = useState(null);
  const [indoorArrivalReady, setIndoorArrivalReady] = useState(false);
  const [indoorEtaSeconds, setIndoorEtaSeconds] = useState(0);
  const gpsFallbackShown = useRef(false);
  const navigationSession = useRef(false);
  const navigationStateRef = useRef({ navStep, destination, selectedEntrance });
  const entranceMilestoneRef = useRef({ reached: false, consecutiveFixes: 0 });
  const outdoorArrivalRef = useRef({ reached: false, consecutiveFixes: 0 });
  const [qrSimOpen, setQrSimOpen] = useState(false);


  // When debug mode is on, use fixed campus location; otherwise live GPS
  const locationToUse = USE_DEBUG_LOCATION
    ? USER_LOCATION
    : snappedLocation || location;
  const [currentBuilding, setCurrentBuilding] = useState("stmarys");

  useEffect(() => {
    if (destination?.building) {
      setCurrentBuilding(destination.building === "chavara" ? "chavara" : "stmarys");
    }
  }, [destination]);

  const ACTIVE_INDOOR_NODES =
    currentBuilding === "chavara"
      ? CHAVARA_INDOOR_NODES
      : INDOOR_NODES;

  const ACTIVE_INDOOR_EDGES =
    currentBuilding === "chavara"
      ? CHAVARA_INDOOR_EDGES
      : INDOOR_EDGES;

  const ACTIVE_FLOOR_IMAGES =
    currentBuilding === "chavara"
      ? CHAVARA_FLOOR_IMAGES
      : FLOOR_IMAGES;

  // Keep the stream-facing state machine in refs. A live fix can update the
  // marker every time, but it only updates the app after a debounced milestone.
  useEffect(() => {
    navigationStateRef.current = { navStep, destination, selectedEntrance };
  }, [navStep, destination, selectedEntrance]);

  useEffect(() => subscribeToLocation((position) => {
    const state = navigationStateRef.current;
    if (entranceMilestoneRef.current.reached || state.navStep !== STEPS.OUTDOOR_NAVIGATING || !isIndoorDestination(state.destination) || !state.selectedEntrance || !NODES[state.selectedEntrance]) return;

    const [lat, lng] = NODES[state.selectedEntrance];
    const distance = gpsDistanceMeters(position, { lat, lng });
    entranceMilestoneRef.current.consecutiveFixes = distance <= ST_MARYS_GEOFENCE_METERS
      ? entranceMilestoneRef.current.consecutiveFixes + 1
      : 0;

    if (entranceMilestoneRef.current.consecutiveFixes < ENTRANCE_CONFIRMATION_FIXES) return;
    entranceMilestoneRef.current.reached = true;
    setNavStep((step) => step === STEPS.OUTDOOR_NAVIGATING ? STEPS.AT_BUILDING : step);
    setShowNavigationCard(true);
  }), [subscribeToLocation, gpsDistanceMeters]);

  // Outdoor destination proximity — automatically show the arrival card when
  // the user walks within OUTDOOR_ARRIVAL_GEOFENCE_METERS of the destination.
  useEffect(() => subscribeToLocation((position) => {
    const state = navigationStateRef.current;
    if (outdoorArrivalRef.current.reached) return;
    if (state.navStep !== STEPS.OUTDOOR_NAVIGATING) return;
    if (isIndoorDestination(state.destination)) return; // handled by the indoor geofence above
    if (!state.destination) return;

    const destNodeId = state.destination.routeNode || state.destination.id;
    const destNode = destNodeId ? NODES[destNodeId] : null;
    if (!destNode) return;

    const [lat, lng] = destNode;
    const distance = gpsDistanceMeters(position, { lat, lng });
    outdoorArrivalRef.current.consecutiveFixes = distance <= OUTDOOR_ARRIVAL_GEOFENCE_METERS
      ? outdoorArrivalRef.current.consecutiveFixes + 1
      : 0;

    if (outdoorArrivalRef.current.consecutiveFixes < OUTDOOR_ARRIVAL_CONFIRMATION_FIXES) return;
    outdoorArrivalRef.current.reached = true;
    setNavStep((step) => step === STEPS.OUTDOOR_NAVIGATING ? STEPS.OUTDOOR_REACHED : step);
    setShowNavigationCard(true);
  }), [subscribeToLocation, gpsDistanceMeters]);

  // St Mary's is the only mapped indoor building. Everywhere else falls back
  // to the nearest outdoor graph node instead of opening an indoor prompt.
  useEffect(() => {
    if (USE_DEBUG_LOCATION || gpsFallbackShown.current || mapMode === "INDOOR") return;
    if (!['timeout', 'failed'].includes(gpsStatus)) return;
    gpsFallbackShown.current = true;
    const approximateLocation = getApproximateLocation() || getLatestLocation() || location || {
      lat: NODES.entrance[0],
      lng: NODES.entrance[1],
    };
    const nearestNode = findNearestNode(approximateLocation);
    const nearestStMarysEntrance = findNearestStMarysEntrance(approximateLocation);
    const nearStMarys = nearestStMarysEntrance.distanceMeters <= ST_MARYS_GPS_FALLBACK_METERS;

    setSnappedLocation(approximateLocation);
    setOutdoorStartNode(nearestNode);
    if (nearStMarys && (!destination || isIndoorDestination(destination))) {
      setSelectedEntrance(nearestStMarysEntrance.nodeId);
      setNavStep(STEPS.ASK_INSIDE_BUILDING);
    } else if (destination && navStep === STEPS.OUTDOOR_ROUTE) {
      // A destination is already selected: continue outdoors from the nearest
      // known graph node without making the user restart navigation.
      startOutdoorNavigation(nearestNode, approximateLocation);
    }
  }, [gpsStatus, mapMode, destination, navStep, getApproximateLocation, getLatestLocation, location]);

  // Indoor routes cannot depend on GPS. Use the graph path length and a
  // conservative walking speed (1.2 m/s) to show the arrival confirmation at
  // a plausible time rather than immediately.
  useEffect(() => {
    const isIndoorRoute = mapMode === "INDOOR" && navStep === STEPS.FLOOR_NAVIGATION && indoorRoute.length > 1;
    if (!isIndoorRoute) {
      setIndoorArrivalReady(false);
      setIndoorEtaSeconds(0);
      return undefined;
    }
    const estimatedSeconds = Math.min(120, Math.max(8, Math.round(routeLengthMeters(indoorRoute) / 1.2)));
    setIndoorArrivalReady(false);
    setIndoorEtaSeconds(estimatedSeconds);
    const timer = window.setTimeout(() => setIndoorArrivalReady(true), estimatedSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [mapMode, navStep, indoorRoute]);

  useEffect(() => {
    const onPopState = () => {
      // A system Back press ends the active route and returns to the clean
      // outdoor map. The next Back press is then handled by the browser/app
      // shell and returns to the page from which Campus RouteX was opened.
      if (sheetOpen) {
        setSheetOpen(false);
        setSelectedDepartment(null);
        return;
      }
      // The first Back press while following an indoor route returns to the
      // indoor route selector. A subsequent Back press can then leave the
      // building and return to the outdoor map.
      if (mapMode === "INDOOR" && navStep !== STEPS.INDOOR_READY) {
        setIndoorRoute([]);
        setIndoorRouteNodes([]);
        setIndoorDestination(null);
        setDestination(null);
        setShowNavigationCard(false);
        setNavStep(STEPS.INDOOR_READY);
        return;
      }
      if (navigationSession.current) {
        navigationSession.current = false;
        resetNavigation();
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [sheetOpen, mapMode, navStep]);

  useEffect(() => {

    if (!fixedUserLocation && location) {

      setFixedUserLocation(location);

      console.log(
        "Fixed user location:",
        location
      );

    }

  }, [location]);
  useEffect(() => {
    if (!locationToUse) return;

    const nearest = findNearestLocation(locationToUse);

    console.log("Nearest location:", nearest);

    setNearestDebugNode(nearest);

  }, [locationToUse]);
  const pushState = (newStep) => {
    // One browser entry represents the whole route, rather than every button
    // press. This mirrors native map apps and keeps Back predictable.
    if (!navigationSession.current) {
      navigationSession.current = true;
      if (window.history.state?.campusRouteX === "sheet") {
        window.history.replaceState({ campusRouteX: "navigation" }, "", window.location.pathname);
      } else {
        window.history.pushState({ campusRouteX: "navigation" }, "", window.location.pathname);
      }
    }
    setNavStep(newStep);
  };

  const resetNavigation = () => {
    entranceMilestoneRef.current = { reached: false, consecutiveFixes: 0 };
    outdoorArrivalRef.current = { reached: false, consecutiveFixes: 0 };

    setSelectedLocation(null);

    setRoute([]);

    setRemainingRoute([]);

    setDestination(null);

    setIndoorDestination(null);

    setCurrentFloor("G");

    setTransportMode(null);

    setNavStep(STEPS.IDLE);

    setMapMode("OUTDOOR");

    setIndoorRoute([]);

    setIndoorRouteNodes([]);

    setIndoorStart(null);

    setIndoorUserLocation(null);

    setIsOutdoorNavigating(false);

    setLastNearestNode(null);

    setScannedQR(null);

    setOutdoorStartNode(null);


  };

  const finishNavigation = () => {
    // Keep the indoor floor plan open after completion. The active navigation
    // history entry remains, so the system Back button is what returns the
    // user to the clean outdoor map.
    setShowNavigationCard(false);
    setIndoorRoute([]);
    setIndoorRouteNodes([]);
    setIndoorDestination(null);
    if (mapMode === "INDOOR") {
      setDestination(null);
      setNavStep(STEPS.INDOOR_READY);
      return;
    }
    setRoute([]);
    setRemainingRoute([]);
    setDestination(null);
    setIsOutdoorNavigating(false);
    setOutdoorStartNode(null);
    setNavStep(STEPS.IDLE);
  };

  const openFeedbackForm = () => {
    if (FEEDBACK_FORM_URL) window.open(FEEDBACK_FORM_URL, "_blank", "noopener,noreferrer");
  };

  const previewOutdoorRoute = (target) => {
    const startLocation = USE_DEBUG_LOCATION
      ? USER_LOCATION
      : snappedLocation || fixedUserLocation || locationToUse;
    const startNode = outdoorStartNode || (startLocation ? findNearestNode(startLocation) : "entrance");
    let endNode = target?.routeNode || target?.id;

    if (target?.location === "chavara") endNode = "chavara";
    if (isIndoorDestination(target)) {
      endNode = findNearestStMarysEntrance(startLocation || { lat: NODES.entrance[0], lng: NODES.entrance[1] }).nodeId;
      setSelectedEntrance(endNode);
    }
    if (!startNode || !endNode || !NODES[endNode]) return;

    const graphRoute = getPathCoordinates(findPath(startNode, endNode, EDGES, NODES), NODES);
    const startPosition = startLocation
      ? [startLocation.lat, startLocation.lng]
      : NODES[startNode];
    setRoute(graphRoute.length ? [startPosition, ...graphRoute] : []);
  };

  const startOutdoorNavigation = (startNode = null, startLocation = null) => {
    entranceMilestoneRef.current = { reached: false, consecutiveFixes: 0 };
    outdoorArrivalRef.current = { reached: false, consecutiveFixes: 0 };

    console.log("START CLICKED");
    console.log("locationToUse:", locationToUse);
    console.log("destination:", destination);
    console.log("outdoorStartNode:", outdoorStartNode);
    const routeStartLocation = startLocation || (USE_DEBUG_LOCATION
      ? locationToUse
      : snappedLocation || fixedUserLocation || locationToUse);
    // console.log("Inside campus:", isInsideCampus(routeStartLocation));
    if (!startNode && !routeStartLocation) {

      alert("Location unavailable. Please enable GPS.");

      return;

    }



    if (!startNode && !isInsideCampus(routeStartLocation)) {
      // Off-campus: no polyline on our map — user should use External GPS
      setRoute([]);
      setIsOutdoorNavigating(true);
      pushState(STEPS.OUTDOOR_NAVIGATING);
      return;
    }



    // User is inside campus

    // User is inside campus

    const nearestNode =
      startNode ||
      outdoorStartNode ||
      findNearestNode(routeStartLocation);


    console.log("nearestNode:", nearestNode);


    console.log("Destination:", destination);
    console.log("Nearest Node:", nearestNode);


    let end;

    if (
      destination?.type === "faculty" ||
      destination?.type === "location"
    ) {

      if (destination.location === "chavara") {

        end = "chavara";
        setNavigationMessage(
          `${destination.name || destination.title || destination.department} is located in Chavara Block, ${destination.floor}`
        );



      } else {
        end = destination.routeNode;
      }

    } else if (destination?.type === "room") {
      if (destination.building === "chavara" || destination.routeNode === "chavara") {
        end = "chavara";
        setSelectedEntrance("chavara");
      } else {
        end = findNearestStMarysEntrance(routeStartLocation).nodeId;
        setSelectedEntrance(end);
      }

    } else {

      end = destination?.routeNode || destination?.id;

    }

    // Apply the multi-entrance rule to every St Mary's indoor destination,
    // including faculty items that originated in the shared search dataset.
    if (isIndoorDestination(destination) && routeStartLocation) {
      if (destination.building === "chavara" || destination.routeNode === "chavara") {
        end = "chavara";
        setSelectedEntrance("chavara");
      } else {
        end = findNearestStMarysEntrance(routeStartLocation).nodeId;
        setSelectedEntrance(end);
      }
    }

    console.log("End node:", end);

    const nodePath = findPath(nearestNode, end, EDGES, NODES);
    console.log("PATH RESULT:", nodePath);

    const graphRoute = getPathCoordinates(nodePath, NODES);
    console.log("graphRoute:", graphRoute);

    // Prepend user's actual position so the route line starts exactly at the user dot
    const userPos = routeStartLocation
      ? [routeStartLocation.lat, routeStartLocation.lng]
      : null;
    const fullRoute = userPos && graphRoute.length > 0
      ? [userPos, ...graphRoute]
      : graphRoute;

    setRoute(fullRoute);
    if (userPos) {
      // Starting navigation intentionally focuses the user; route preview does
      // not move the map away from the destination/path overview.
      setMapCenter({ id: `user-focus-${Date.now()}`, position: userPos });
    }
    setIsOutdoorNavigating(true);
    pushState(STEPS.OUTDOOR_NAVIGATING);
  };

  const continueFromOutdoorEntrance = () => {
    const entryFloor = outdoorEntranceFloor[selectedEntrance] || "G";
    const startNode = indoorEntranceByFloor[entryFloor];
    const endNode = destination?.indoorNode || destination?.id;
    if (!startNode || !endNode) return;

    const start = {
      name: ACTIVE_INDOOR_NODES[startNode]?.label || `${entryFloor} entrance`,
      nearestNode: startNode,
      floor: entryFloor,
    };
    setIndoorStart(start);
    setIndoorUserLocation({
      position: ACTIVE_INDOOR_NODES[startNode].position,
      nearestNode: startNode,
      floor: entryFloor,
    });
    setCurrentFloor(entryFloor);
    setMapMode("INDOOR");

    // Stay on the entrance floor if the destination is there; otherwise use
    // the existing stairs/lift workflow from this exact entrance.
    if (entryFloor !== normalizeFloor(destination?.floor)) {
      pushState(STEPS.FLOOR_CHOICE);
      return;
    }

    const indoorPath = findPath(
      startNode,
      endNode,
      ACTIVE_INDOOR_EDGES,
      ACTIVE_INDOOR_NODES
    );

    setIndoorRouteNodes(indoorPath);
    setIndoorRoute(getPathCoordinates(indoorPath, ACTIVE_INDOOR_NODES));
    pushState(STEPS.FLOOR_NAVIGATION);
  };

  const startVerticalNavigation = (mode) => {
    console.log("startVerticalNavigation");
    console.log("mode:", mode);
    console.log("indoorStart:", indoorStart);
    console.log("currentFloor:", currentFloor);
    const startNode = indoorStart?.nearestNode;

    if (!startNode) return;

    setTransportMode(mode);

    // Determine target floor:
    // - If going to an indoor room/faculty destination, target that destination floor
    // - If going outdoors (no indoor floor on destination), always target Ground ("G")
    const activeIndoorDestination = indoorDestination || destination;
    const isIndoorDest = Boolean(activeIndoorDestination?.floor);
    const targetFloor = isIndoorDest ? normalizeFloor(activeIndoorDestination.floor) : "G";

    const endNode =
      mode === "lift"
        ? `lift_${currentFloor}`
        : getStairNode(currentFloor, targetFloor);

    const path = findPath(
      startNode,
      endNode,
      ACTIVE_INDOOR_EDGES,
      ACTIVE_INDOOR_NODES
    );
    console.log("PATH:", path);

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));
    setMapMode("INDOOR");

    pushState(STEPS.GO_TO_FLOOR);
  };

  const continueOnDestinationFloor = () => {
    const activeIndoorDestination = indoorDestination || destination;
    if (!activeIndoorDestination) return;

    // Outdoor destination
    const isIndoorDestination = Boolean(activeIndoorDestination.floor);

    if (!isIndoorDestination) {
      // Outdoor destination
      // We came from F1/F2
      const startNode =
        transportMode === "lift"
          ? `lift_G`
          : getStairNode("G", "G");

      // User has reached Ground Floor
      setCurrentFloor("G");

      setIndoorStart({
        name: ACTIVE_INDOOR_NODES[startNode]?.label || startNode,
        nearestNode: startNode,
      });

      setIndoorUserLocation({
        position: ACTIVE_INDOOR_NODES[startNode].position,
        nearestNode: startNode,
        floor: "G",
      });

      const path = findPath(
        startNode,
        "entrance_G",
        ACTIVE_INDOOR_EDGES,
        ACTIVE_INDOOR_NODES
      );

      setIndoorRouteNodes(path);
      setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));
      setMapMode("INDOOR");

      pushState(STEPS.FLOOR_NAVIGATION);

      return;
    }
    console.log("transportMode:", transportMode);
    console.log("currentFloor:", currentFloor);
    console.log("destination.floor:", activeIndoorDestination.floor);

    const targetFloor = normalizeFloor(activeIndoorDestination.floor);

    // Existing room navigation
    const startNode =
      transportMode === "lift"
        ? `lift_${targetFloor}`
        : getStairNode(targetFloor, currentFloor);

    setCurrentFloor(targetFloor);
    console.log("Chosen start node:", startNode);

    setIndoorStart({
      name: ACTIVE_INDOOR_NODES[startNode]?.label || startNode,
      nearestNode: startNode,
      floor: targetFloor,
    });
    const path = findPath(
      startNode,
      activeIndoorDestination.id,
      ACTIVE_INDOOR_EDGES,
      ACTIVE_INDOOR_NODES
    );

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));
    setMapMode("INDOOR");

    pushState(STEPS.FLOOR_NAVIGATION);
  };

  const [mapCenter, setMapCenter] = useState(null);
  const openBottomSheet = (title, data) => {
    setSheetTitle(title);
    setSheetData(data);
    setSelectedDepartment(null);
    setSheetOpen(true);

    window.history.pushState(
      { campusRouteX: "sheet" },
      "",
      window.location.pathname
    );
  };

  const closeBottomSheet = () => {
    setSheetOpen(false);
    setSelectedDepartment(null);
    if (window.history.state?.campusRouteX === "sheet") window.history.back();
  };

  // GPS changes only move the live marker. They deliberately do not recreate
  // the route or reset any selection/search state while the user is navigating.

  const runManualIndoorRoute = (source, target) => {
    if (target.outdoor) {
      const outdoorDestination = {
        id: target.id,
        name: target.name,
        type: "location",
        routeNode: target.routeNode || target.id,
      };
      const srcFloor = source.floor || "G";
      setIndoorStart({ name: source.name, nearestNode: source.id, floor: srcFloor });
      setIndoorUserLocation({
        position: ACTIVE_INDOOR_NODES[source.id].position,
        nearestNode: source.id,
        floor: srcFloor,
      });
      setDestination(outdoorDestination);
      setIndoorDestination(outdoorDestination);
      setCurrentFloor(srcFloor);
      setMapMode("INDOOR");

      // If on an upper/lower floor, ask lift/stairs first
      if (["1", "2", "B1", "B2"].includes(srcFloor)) {
        pushState(STEPS.FLOOR_CHOICE);
        return;
      }

      // Ground floor — calculate indoor path to exit and jump straight to REACHED_EXIT
      const exitNode = getExitNode(srcFloor); // "entrance_G"
      if (source.id === exitNode) {
        // Already at exit
        setIndoorRouteNodes([]);
        setIndoorRoute([]);
        pushState(STEPS.REACHED_EXIT);
        return;
      }

      const pathToExit = findPath(
        source.id,
        exitNode,
        ACTIVE_INDOOR_EDGES,
        ACTIVE_INDOOR_NODES
      );

      if (pathToExit.length) {
        setIndoorRouteNodes(pathToExit);
        setIndoorRoute(getPathCoordinates(pathToExit, ACTIVE_INDOOR_NODES));
      }
      // Show the path on the map and immediately present the exit confirmation
      pushState(STEPS.REACHED_EXIT);
      return;
    }

    const selectedTarget = { ...target, type: "room" };
    setIndoorStart({ name: source.name, nearestNode: source.id, floor: source.floor });
    setIndoorDestination(selectedTarget);
    setIndoorUserLocation({
      position: ACTIVE_INDOOR_NODES[source.id].position,
      nearestNode: source.id,
      floor: source.floor
    });
    setCurrentFloor(source.floor);
    setMapMode("INDOOR");

    // Preserve the multi-floor flow: users choose stairs or lift before the
    // destination-floor leg is drawn.
    if (source.floor !== target.floor) {
      setIndoorRouteNodes([]);
      setIndoorRoute([]);
      pushState(STEPS.FLOOR_CHOICE);
      return;
    }

    const path = findPath(
      source.id,
      target.id,
      ACTIVE_INDOOR_EDGES,
      ACTIVE_INDOOR_NODES
    );

    if (!path.length) return;

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));
    setNavStep(STEPS.FLOOR_NAVIGATION);
  };

  const markIndoorDestinationReached = (reachedNode) => {
    setIndoorStart({ name: reachedNode.name, nearestNode: reachedNode.id, floor: reachedNode.floor });
    setIndoorUserLocation({ position: ACTIVE_INDOOR_NODES[reachedNode.id].position, nearestNode: reachedNode.id, floor: reachedNode.floor });
    setIndoorDestination(null);
    setDestination({ id: reachedNode.id, name: reachedNode.name, floor: reachedNode.floor, type: "room" });
    setIndoorRoute([]);
    setIndoorRouteNodes([]);
    setCurrentFloor(reachedNode.floor);
    setShowNavigationCard(true);
    pushState(STEPS.COMPLETED);
  };

  console.log(indoorUserLocation);

  const startIndoorNavigation = () => {

    if (!indoorStart || !indoorDestination) return;



    // Destination is on the same floor

    if (currentFloor === indoorDestination.floor) {

      const path = findPath(
        indoorStart.nearestNode,
        indoorDestination.id,
        ACTIVE_INDOOR_EDGES,
        ACTIVE_INDOOR_NODES
      );



      setIndoorRouteNodes(path);

      setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));



      pushState(STEPS.FLOOR_NAVIGATION);

      return;

    }



    // Destination is on another floor

    pushState(STEPS.FLOOR_CHOICE);

  };

  const startIndoorToOutdoorNavigation = () => {
    console.log("Indoor -> Outdoor");
    console.log("Current floor:", currentFloor);

    if (!indoorStart || !destination) {
      console.log("Missing indoorStart or destination");
      return;
    }
    if (["1", "2"].includes(currentFloor)) {
      pushState(STEPS.FLOOR_CHOICE);
      return;
    }

    const exitNode = getExitNode(currentFloor);
    console.log("Exit node:", exitNode);

    if (indoorStart.nearestNode === exitNode) {
      console.log("Already at exit");
      pushState(STEPS.REACHED_EXIT);
      return;
    }

    const path = findPath(
      indoorStart.nearestNode,
      exitNode,
      ACTIVE_INDOOR_EDGES,
      ACTIVE_INDOOR_NODES
    );

    console.log("Indoor path:", path);

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));

    const startPosition = ACTIVE_INDOOR_NODES[indoorStart.nearestNode]?.position;
    if (startPosition) {
      setIndoorUserLocation({
        position: startPosition,
        nearestNode: indoorStart.nearestNode,
        floor: currentFloor,
      });
    }

    pushState(STEPS.FLOOR_NAVIGATION);
  };

  const switchToOutdoorNavigation = () => {
    setIndoorRoute([]);
    setIndoorRouteNodes([]);
    setMapMode("OUTDOOR");

    // floorEntryMap maps floor names to the outdoor NODES key that
    // corresponds to the building entrance on that floor.
    const exitNode = floorEntryMap[currentFloor];
    console.log("switchToOutdoorNavigation: exitNode =", exitNode, "destination =", destination);

    // Build the outdoor route. We pass the exitNode as the start so the
    // pathfinder begins at the building exit rather than the GPS position.
    // startOutdoorNavigation calls pushState(STEPS.AT_BUILDING) internally,
    // so we do NOT override navStep here.
    startOutdoorNavigation(exitNode);
  };

  useEffect(() => {
    if (mapMode !== "INDOOR" || !indoorRouteNodes?.length || !indoorStart?.nearestNode) return;

    const activeNodeId = indoorRouteNodes[0];
    const activeNode = ACTIVE_INDOOR_NODES[activeNodeId];

    if (!activeNode?.position) return;

    const currentNodeId = indoorUserLocation?.nearestNode;
    if (!currentNodeId || currentNodeId !== activeNodeId) {
      setIndoorUserLocation({
        position: activeNode.position,
        nearestNode: activeNodeId,
        floor: activeNode.floor,
      });
    }
  }, [mapMode, indoorRouteNodes, indoorStart?.nearestNode, indoorUserLocation?.nearestNode]);

  const areSamePosition = (a, b) => {
    if (!a || !b) return true;
    return Math.abs(a[0] - b[0]) < 0.000001 && Math.abs(a[1] - b[1]) < 0.000001;
  };
  const handleQRScan = (qrData) => {
    pushState(navStep);

    setScannedQR(qrData);


    // Outdoor QR
    if (qrData.type === "OUTDOOR") {

      setMapMode("OUTDOOR");

      setOutdoorStartNode(qrData.startNode);


      // Fix user location at QR position
      const qrNode = NODES[qrData.startNode];

      if (qrNode) {

        const position = qrNode.position || qrNode;

        setSnappedLocation({
          lat: position[0],
          lng: position[1],
        });


        setMapCenter({
          id: qrData.id,
          position: position,
        });

      }


      if (destination) {
        setNavStep(STEPS.OUTDOOR_ROUTE);
      } else {
        setNavStep(STEPS.IDLE);
      }

      return;
    }



    // Indoor QR
    const qrBuilding = qrData.building || (qrData.id?.includes("chavara") ? "chavara" : "stmarys");
    setCurrentBuilding(qrBuilding);

    setMapMode("INDOOR");

    setCurrentFloor(qrData.floor);


    setIndoorStart({

      name: qrData.name,

      nearestNode: qrData.startNode,

      floor: qrData.floor,

    });



    const targetNodes = qrBuilding === "chavara" ? CHAVARA_INDOOR_NODES : INDOOR_NODES;
    const indoorPosition =
      targetNodes[qrData.startNode].position;


    setIndoorUserLocation({

      position: indoorPosition,

      nearestNode: qrData.startNode,

      floor: qrData.floor,

    });


    setMapCenter({

      id: qrData.id,

      position: indoorPosition,

    });

    setNavStep(STEPS.INDOOR_READY);
  };


  console.log("indoorStart:", indoorStart);

  useEffect(() => {
    window.history.replaceState(
      { campusRouteX: "outdoor" },
      "",
      window.location.pathname
    );
  }, []);
  const changeFloor = (floor) => {
    pushState(navStep);
    setCurrentFloor(floor);
  };

  const isUserFloor =
    indoorUserLocation?.floor === currentFloor;

  const isDestinationFloor =
    normalizeFloor(destination?.floor) === currentFloor;


  const detectQRLocation = async () => {

    try {

      const gpsLocation = await getOneShotLocation();

      console.log("REAL GPS:", gpsLocation);


      const nearestQR =
        findNearestQRLocation(gpsLocation);


      console.log("Nearest QR:", nearestQR);


      if (nearestQR) {

        const snapped = {
          lat: nearestQR.position[0],
          lng: nearestQR.position[1]
        };


        console.log("Snapped user location:", snapped);


        // show user at QR position
        setSnappedLocation(snapped);


        // use this node for routing
        setOutdoorStartNode(
          nearestQR.startNode
        );


        setMapCenter({
          id: nearestQR.id,
          position: [
            nearestQR.position[0],
            nearestQR.position[1]
          ]
        });


        // stop GPS only after QR detection
        stopTracking();

      }

    }
    catch (error) {
      console.log(error);
    }

  };

  useEffect(() => {
    console.log("UPDATED SNAPPED LOCATION:", snappedLocation);
  }, [snappedLocation]);

  // QR detection is triggered only by explicit QR code scans (handleQRScan),
  // NOT on mount — auto-running it snaps the user dot to a QR position and
  // stops the GPS watch, preventing real location tracking.
  // useEffect(() => {
  //   if (USE_DEBUG_LOCATION) return;
  //   detectQRLocation();
  // }, []);
  console.log({
    navStep,
    OUTDOOR_ROUTE: STEPS.OUTDOOR_ROUTE,
    isOutdoorNavigating,
    mapMode,
    destination,
  });




  return (

    <main className="app-shell">

      {/* ── QR Simulator (dev/testing) ───────────────────────────────────── */}
      <div className="qr-simulator-container">
        <button
          className="qr-simulator-toggle"
          onClick={() => setQrSimOpen((o) => !o)}
          title="QR location simulator"
          aria-label="Toggle QR location simulator"
        >
          📍 {qrSimOpen ? "Close" : "Simulate QR"}
        </button>

        {qrSimOpen && (
          <div className="qr-simulator-panel">
            <h4>📱 Simulate QR Scan</h4>
            <p className="panel-desc">
              Tap a location to jump there instantly — same as scanning a physical QR code on campus.
            </p>
            <div className="qr-buttons">
              {QR_LOCATIONS.map((qr) => (
                <button
                  key={qr.id}
                  className="qr-simulate-btn"
                  onClick={() => {
                    setQrSimOpen(false);
                    handleQRScan(qr);
                  }}
                >
                  <span className="qr-icon">
                    {qr.type === "INDOOR" ? "🏢" : "🗺️"}
                  </span>
                  <span className="qr-btn-text">
                    <strong>{qr.name}</strong>
                    <small>
                      {qr.type === "INDOOR"
                        ? `Indoor · Floor ${qr.floor}`
                        : "Outdoor"
                      } · node: {qr.startNode}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="top-controls">

        {(mapMode !== "INDOOR" || navStep === STEPS.IDLE || navStep === STEPS.COMPLETED) && <SearchBar

          onSelect={(location) => {
            pushState(navStep);
            setShowNavigationCard(true);
            if (
              mapMode === "INDOOR" &&
              indoorUserLocation &&
              currentFloor !== indoorUserLocation.floor
            ) {
              setCurrentFloor(indoorUserLocation.floor);
            }


            // Faculty selected from search
            if (location.type === "faculty") {


              const department =
                bottomSheetData.departments.find(
                  dept => dept.name === location.department
                );


              const faculty =
                department?.faculties.find(
                  f => f.name === location.name
                );


              if (!faculty) return;


              // Faculty without room number
              if (!faculty.room) {

                const chavaraLocation = {
                  id: "chavara",
                  name: location.department,
                  type: "location",
                  routeNode: "chavara",
                  block: "Chavara Block",
                  message: "This department is located on the 2nd floor of Chavara Block.",
                };

                setSelectedLocation(chavaraLocation);
                setDestination(chavaraLocation);

                // Only switch to outdoor mode if user is not already indoors
                if (mapMode !== "INDOOR") {
                  setMapMode("OUTDOOR");
                  setNavStep(STEPS.OUTDOOR_ROUTE);
                } else {
                  // Keep indoor context, just show the outdoor route card
                  setNavStep(STEPS.OUTDOOR_ROUTE);
                }

                return;
              }




              // Faculty with room number
              setSheetTitle("Faculty");
              openBottomSheet("Faculty", bottomSheetData.departments);
              setSheetOpen(true);

              setSelectedDepartment({

                ...department,

                faculties: [faculty],

              });


              return;

            }



            // Existing search logic

            // setHistory([
            //   {
            //     navStep: STEPS.IDLE,
            //     mapMode: "OUTDOOR",
            //     currentFloor: "G",
            //     route: [],
            //     indoorRoute: [],
            //     transportMode: null,
            //     destination: null,
            //     selectedLocation: null,
            //   }
            // ]);



            setSelectedLocation(location);

            setDestination(location);

            setIndoorDestination(location);

            setNavStep(STEPS.OUTDOOR_ROUTE);
            setRoute([]);

            setIndoorRoute([]);

            setIndoorRouteNodes([]);

            setIsOutdoorNavigating(false);

            setLastNearestNode(null);



            const shouldUseIndoorFlow =
              mapMode === "INDOOR" ||
              scannedQR?.type === "INDOOR";
            console.log({
              mapMode,
              scannedQR,
              shouldUseIndoorFlow,
            });

            if (shouldUseIndoorFlow) {

              setMapMode("INDOOR");

              setNavStep(STEPS.INDOOR_READY);

            } else {

              setMapMode("OUTDOOR");
              // Show the route preview immediately so bounds fit to user + destination
              previewOutdoorRoute(location);

            }

          }}

        />}


        {mapMode === "OUTDOOR" && navStep === STEPS.IDLE && (

          <SearchChips

            onDepartmentClick={() => {
              setSheetData(bottomSheetData.departments);
              setSelectedDepartment(null);
              openBottomSheet("Department", bottomSheetData.departments);
            }}

            onFacultyClick={() => {
              setSheetData(bottomSheetData.departments);
              setSelectedDepartment(null);
              openBottomSheet("Faculty", bottomSheetData.departments);
            }}



            onLibraryClick={() => {
              setSheetData(bottomSheetData.library);
              openBottomSheet("Library", bottomSheetData.library);
            }}

            onCafeteriaClick={() => {
              setSheetData(bottomSheetData.cafeteria);
              openBottomSheet("Cafeteria", bottomSheetData.cafeteria);
            }}

            onBuildingsClick={() => {
              setSheetData(bottomSheetData.buildings);
              openBottomSheet("Buildings", bottomSheetData.buildings);
            }}



          // onLabsClick={() => {

          //   setSheetData(bottomSheetData.labs);

          //   setSheetTitle("Labs");

          //   setSheetOpen(true);

          // }}



          />

        )}

      </div>






      <CampusMap
        selectedLocation={selectedLocation}
        currentLocation={locationToUse}
        subscribeToLocation={subscribeToLocation}
        route={route}
        indoorRouteNodes={indoorRouteNodes}
        currentFloor={currentFloor}
        mapMode={mapMode}
        destination={destination}
        mapCenter={mapCenter}
        indoorUserLocation={indoorUserLocation}
        setIndoorUserLocation={setIndoorUserLocation}
        indoorStart={indoorStart}
        setIndoorStart={setIndoorStart}
        isOutdoorNavigating={isOutdoorNavigating}
        useDebugLocation={USE_DEBUG_LOCATION}
        activeFloorImages={ACTIVE_FLOOR_IMAGES}
        activeIndoorNodes={ACTIVE_INDOOR_NODES}
      />

      {mapMode === "INDOOR" && [STEPS.IDLE, STEPS.INDOOR_READY, STEPS.COMPLETED].includes(navStep) && (
        <IndoorRoutingCard
          onRoute={runManualIndoorRoute}
          onOutdoorNavigation={() => {
            if (destination && !isIndoorDestination(destination)) {
              startIndoorToOutdoorNavigation();
              return;
            }
            setIndoorRoute([]);
            setIndoorRouteNodes([]);
            setMapMode("OUTDOOR");
            setNavStep(STEPS.IDLE);
          }}
          initialSource={indoorStart || indoorUserLocation}
          initialDestination={indoorDestination}
        />
      )}

      {navStep === STEPS.ASK_INSIDE_BUILDING && (
        <NavigationCard>
          <p>We could not establish a reliable GPS location. Are you currently inside the building?</p>
          <div className="button-row">
            <button className="primary-action" onClick={() => {
              stopTracking();
              const entryFloor = outdoorEntranceFloor[selectedEntrance] || "G";
              const entranceNode = indoorEntranceByFloor[entryFloor];
              const entrance = ACTIVE_INDOOR_NODES[entranceNode];
              if (entrance) {
                setIndoorStart({
                  name: entrance.label || `${entryFloor} entrance`,
                  nearestNode: entranceNode,
                  floor: entryFloor,
                });
                setIndoorUserLocation({
                  position: entrance.position,
                  nearestNode: entranceNode,
                  floor: entryFloor,
                });
              }
              setMapMode("INDOOR");
              setCurrentFloor(entryFloor);
              setManualIndoorMode(true);
              setRoute([]);
              if (destination && isIndoorDestination(destination)) {
                continueFromOutdoorEntrance();
              } else {
                setNavStep(STEPS.INDOOR_READY);
              }
            }}>Yes, open indoor map</button>
            <button className="secondary-action" onClick={() => {
              gpsFallbackShown.current = false;
              startTracking();
              setNavStep(STEPS.IDLE);
            }}>No, retry GPS</button>
          </div>
        </NavigationCard>
      )}



      <BottomSheet

        open={sheetOpen}

        onClose={() => {
          closeBottomSheet();
        }}

        title={sheetTitle}

        data={sheetData}

        selectedDepartment={selectedDepartment}

        setSelectedDepartment={setSelectedDepartment}

        onNavigate={(location) => {
          pushState(navStep);
          setShowNavigationCard(true);
          if (
            mapMode === "INDOOR" &&
            indoorUserLocation &&
            currentFloor !== indoorUserLocation.floor
          ) {
            setCurrentFloor(indoorUserLocation.floor);
            setIndoorStart({
              name: ACTIVE_INDOOR_NODES[indoorUserLocation.nearestNode].label,
              nearestNode: indoorUserLocation.nearestNode,
              floor: indoorUserLocation.floor,
            });
          }



          setSelectedLocation(location);
          setDestination(location);
          setIndoorDestination(location);
          setRoute([]);
          setIndoorRoute([]);
          setIndoorRouteNodes([]);
          setIsOutdoorNavigating(false);
          setLastNearestNode(null);

          // Push an IDLE snapshot so back-button works correctly
          // setHistory([
          //   {
          //     navStep: STEPS.IDLE,
          //     mapMode: "OUTDOOR",
          //     currentFloor: "G",
          //     route: [],
          //     indoorRoute: [],
          //     indoorRouteNodes: [],
          //     transportMode: null,
          //     destination: null,
          //     selectedLocation: null,
          //     indoorStart: null,
          //     indoorDestination: null,
          //     indoorUserLocation: null,
          //     mapCenter: null,
          //     isOutdoorNavigating: false,
          //     lastNearestNode: null,
          //     scannedQR: null,
          //     outdoorStartNode: null,
          //   }
          // ]);

          const shouldUseIndoorFlow =
            mapMode === "INDOOR" || scannedQR?.type === "INDOOR";

          if (shouldUseIndoorFlow) {
            setMapMode("INDOOR");
            setNavStep(STEPS.INDOOR_READY);
          } else {

            setMapMode("OUTDOOR");


            // ⭐ Decide outdoor destination building

            if (location.building === "stmarys") {

              setOutdoorTarget("stmarys_entrance");

            }

            else if (location.building === "chavara") {

              setOutdoorTarget("chavara");

            }

            else if (location.building === "canteen") {

              setOutdoorTarget("canteen");

            }


            previewOutdoorRoute(location);
            setNavStep(STEPS.OUTDOOR_ROUTE);

          }

        }}

      />





      <FloorSelector
        currentFloor={currentFloor}
        setCurrentFloor={changeFloor}
        mapMode={mapMode}
        destination={destination}
        activeFloorImages={ACTIVE_FLOOR_IMAGES}
      />



      {
        navStep === STEPS.OUTDOOR_ROUTE &&
        !isOutdoorNavigating && (
          <NavigationCard>
            <p>
              Destination: <strong>{destination?.name || destination?.id || "Selected Location"}</strong>
            </p>
            <div className="button-row">
              <button
                className="primary-action"
                onClick={() => {

                  console.log("Destination before start:", destination);

                  startOutdoorNavigation();
                }}
              >
                Start navigation
              </button>

              {!isInsideCampus(location || snappedLocation) && (
                <button
                  className="secondary-action"
                  onClick={() => {
                    const destPos = destination?.position || (destination?.routeNode ? NODES[destination.routeNode] : null) || (destination?.id ? NODES[destination.id] : null);
                    if (destPos) {
                      openGoogleMapsNavigation(destPos);
                    } else {
                      // Fallback to entrance
                      openGoogleMapsNavigation([CAMPUS_ENTRANCE.lat, CAMPUS_ENTRANCE.lng]);
                    }
                  }}
                  title="Navigate using Google Maps App"
                >
                  External GPS
                </button>
              )}
            </div>
          </NavigationCard>
        )
      }
      {
        showNavigationCard &&
        navStep === STEPS.AT_BUILDING &&
        isIndoorDestination(destination) &&
        (
          <NavigationCard>

            <p>
              Have you arrived at <strong>the selected entrance</strong>?
            </p>

            <div className="button-row">

              <button
                className="primary-action"
                onClick={() => {

                  continueFromOutdoorEntrance();

                }}
              >
                Yes, continue indoors
              </button>


              <button
                className="secondary-action"
                onClick={() =>
                  setNavStep(STEPS.OUTDOOR_ROUTE)
                }
              >
                Not yet
              </button>

            </div>

          </NavigationCard>
        )
      }
      {
        showNavigationCard &&
        navStep === STEPS.COMPLETED &&
        destination && (

          <NavigationCard className="arrival-card">

            <div className="arrival-header">

              <div className="arrival-icon">
                🎉
              </div>

              <div>
                <h3>Destination Reached</h3>

                <p>
                  {destination?.name || destination?.id || "Location"}
                </p>
              </div>

            </div>


            <p className="feedback-text">
              How was your navigation experience?
            </p>


            <div className="arrival-actions">

              <button
                className="primary-action"
                onClick={finishNavigation}
              >
                Finish
              </button>


              <button
                className="feedback-btn"
                onClick={openFeedbackForm}
              >
                📝 Feedback
              </button>

            </div>

          </NavigationCard>

        )
      }


      {

        navStep === STEPS.FLOOR_CHOICE && (

          <NavigationCard>

            <p>
              {(indoorDestination?.floor || destination?.floor)
                ? (
                  <>
                    How do you want to go to floor{" "}
                    <strong>{indoorDestination?.floor || destination?.floor}</strong>?
                  </>
                )
                : (
                  <>
                    You are on floor <strong>{currentFloor}</strong>. How do you want to reach the <strong>Ground Floor</strong> exit?
                  </>
                )}
            </p>

            <div className="button-row">

              <button
                className="primary-action"
                onClick={() => startVerticalNavigation("stairs")}
              >
                🪜 Stairs
              </button>

              <button
                className="primary-action"
                onClick={() => startVerticalNavigation("lift")}
              >
                Lift
              </button>

            </div>

          </NavigationCard>

        )

      }



      {

        navStep === STEPS.GO_TO_FLOOR && (

          <NavigationCard>

            <p>
              {(indoorDestination?.floor || destination?.floor)
                ? <>Proceed to the <strong>{transportMode}</strong> and go to floor <strong>{indoorDestination?.floor || destination?.floor}</strong>.</>
                : <>Proceed to the <strong>{transportMode}</strong> and go down to the <strong>Ground Floor</strong> exit.</>
              }
            </p>

            <button className="primary-action" onClick={continueOnDestinationFloor}>
              {(indoorDestination?.floor || destination?.floor)
                ? `Reached ${indoorDestination?.floor || destination?.floor}`
                : "Reached Ground Floor"
              }
            </button>

          </NavigationCard>

        )

      }

      {mapMode === "INDOOR" && navStep === STEPS.REACHED_EXIT && (
        <NavigationCard>
          <p>Have you arrived at the building exit?</p>
          <div className="button-row">
            <button
              className="primary-action"
              onClick={() => {
                switchToOutdoorNavigation();
              }}
            >
              Yes, continue outdoor navigation
            </button>
            <button
              className="secondary-action"
              onClick={() => pushState(STEPS.FLOOR_NAVIGATION)}
            >
              Not yet
            </button>
          </div>
        </NavigationCard>
      )}



      {mapMode === "INDOOR" && navStep === STEPS.FLOOR_NAVIGATION &&
        indoorArrivalReady &&
        isUserFloor && (
          currentFloor === indoorUserLocation?.floor && (() => {
            const isOutdoorDest =
              destination?.type !== "room" && destination?.type !== "faculty";

            return (
              <NavigationCard>
                <p>
                  {isOutdoorDest
                    ? <>You should now be near the <strong>building exit</strong>. Please confirm that you have arrived.</>
                    : <>You should now be near <strong>{destination?.name || destination?.id}</strong>. Please confirm that you have arrived.</>
                  }
                </p>

                <button
                  className="primary-action"
                  onClick={() => {
                    if (isOutdoorDest) {
                      setIndoorRoute([]);
                      setIndoorRouteNodes([]);
                      // User reached the exit — hand off to outdoor navigation
                      pushState(STEPS.REACHED_EXIT);
                    } else {
                      markIndoorDestinationReached({
                        id: destination.id,
                        name: destination.name || destination.id,
                        floor: destination.floor,
                      });
                    }
                    // setTimeout(() => {
                    //   setShowNavigationCard(true);
                    // }, 3000);
                  }}
                >
                  {isOutdoorDest ? "I have reached the exit" : "I reached"}
                </button>
              </NavigationCard>
            );
          })()
        )}
      {
        navStep === STEPS.OUTDOOR_NAVIGATING &&
        !isIndoorDestination(destination) && (
          <NavigationCard>
            <button
              className="primary-action"
              onClick={() => {
                setShowNavigationCard(true);
                pushState(STEPS.OUTDOOR_REACHED);
              }}
            >
              I have arrived
            </button>
          </NavigationCard>
        )
      }
      {
        showNavigationCard &&
        navStep === STEPS.AT_BUILDING &&
        !isIndoorDestination(destination) && (
          <NavigationCard>
            <p>
              Follow the highlighted route to{" "}
              <strong>{destination?.name || destination?.id}</strong>.
            </p>

            <button
              className="primary-action"
              onClick={() => {
                pushState(STEPS.OUTDOOR_REACHED);
              }}
            >
              I have arrived
            </button>
          </NavigationCard>
        )
      }
      {
        showNavigationCard &&
        navStep === STEPS.OUTDOOR_REACHED &&
        !isIndoorDestination(destination) && (

          <NavigationCard className="arrival-card">

            <div className="arrival-header">

              <div className="arrival-icon">
                🎉
              </div>

              <div>
                <h3>Destination Reached</h3>
                <p>{destination?.name || destination?.id}</p>
              </div>

            </div>

            <p className="feedback-text">
              How was your navigation experience?
            </p>

            <div className="arrival-actions">

              <button
                className="primary-action"
                onClick={finishNavigation}
              >
                ✅ Finish
              </button>

              <button
                className="feedback-btn"
                onClick={openFeedbackForm}
              >
                📝 Feedback
              </button>

            </div>

          </NavigationCard>

        )
      }

      {false && mapMode === "INDOOR" && navStep === STEPS.INDOOR_READY && (
        <NavigationCard>
          <p>
            {destination?.type === "room" || destination?.type === "faculty"
              ? <>Navigate to <strong>{destination?.name || destination?.id}</strong><br /><small>Indoor route</small></>
              : <>Navigate to <strong>{destination?.name || destination?.id}</strong><br /><small>Outdoor destination – you are inside the building</small></>
            }
          </p>
          <button
            className="primary-action"
            onClick={() => {
              if (destination?.type === "room" || destination?.type === "faculty") {
                startIndoorNavigation();
              } else {
                startIndoorToOutdoorNavigation();
              }
            }}
          >
            Start Navigation
          </button>
        </NavigationCard>
      )}



    </main >

  );


  function NavigationCard({ children }) {

    return <section className="navigation-card">{children}</section>;

  }
}
function getStairNode(currentFloor, destinationFloor) {
  // If the user is on B2, only Stair B exists.
  if (currentFloor === "B2") {
    return "stairsB_B2";
  }

  // If the destination is B2, everyone must arrive through Stair B.
  if (destinationFloor === "B2") {
    switch (currentFloor) {
      case "B1":
        return "stairsB_B1";
      case "G":
        return "stairsB_G";
      case "1":
        return "stairsB_1";
      case "2":
        return "stairsB_2";
      default:
        return `stairsB_${currentFloor}`;
    }
  }

  // Otherwise use Stair A on the CURRENT floor.
  switch (currentFloor) {
    case "B1":
      return "stairsA_B1";
    case "G":
      return "stairsA_G";
    case "1":
      return "stairsA_1";
    case "2":
      return "stairsA_2";
    default:
      return `stairsA_${currentFloor}`;
  }
}
function isIndoorDestination(destination) {
  if (!destination) return false;

  const isStMarys =
    destination.building === "stmarys" ||
    destination.building === "St Mary's Block" ||
    destination.routeNode === "st-marys-block";

  const isChavara =
    destination.building === "chavara" ||
    destination.routeNode === "chavara";

  if (isStMarys || isChavara) return true;

  const f = destination.floor ? destination.floor.toString().toUpperCase() : "";
  return f.startsWith("B2") || f.startsWith("B1") || f.startsWith("G") || /^[1-6]/.test(f);
}



export default App;
