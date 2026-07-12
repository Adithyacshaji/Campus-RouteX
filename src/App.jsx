import { useState, useEffect } from "react";

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

import LocationButton from "./components/LocationButton";

import { findNearestLocation } from "./utils/findNearestLocation";
import { useNavigate } from "react-router-dom";


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

};

const floorEntryMap = {

  B2: "b2",

  B1: "b1",

  G: "g",

  F1: "g",

  F2: "g",

};

const indoorEntranceByFloor = {

  B2: "entrance_B2",

  B1: "entrance_B1",

  G: "entrance_G",

};

const USER_LOCATION = {
  lat: 10.356376,
  lng: 76.212733,
};

const USE_DEBUG_LOCATION = true; // set to true only for testing with a fixed point

function getPathCoordinates(path, nodes) {

  return path.map((node) => nodes[node]?.position || nodes[node]).filter(Boolean);

}

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

  const [history, setHistory] = useState([]);

  const {
    location,
    getOneShotLocation,
    stopTracking
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

  const [indoorLocationMode, setIndoorLocationMode] = useState(true);

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




  const locationToUse =
    USE_DEBUG_LOCATION
      ? USER_LOCATION
      : (snappedLocation || location);
  const navigationStartLocation =
    snappedLocation || location;

  useEffect(() => {
    const onPopState = (event) => {
      if (sheetOpen) {
        setSheetOpen(false);
        setSelectedDepartment(null);
        return;
      }

      handleBack();
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [sheetOpen, history]);

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
    const snapshot = {
      navStep,
      mapMode,
      currentFloor,

      route,
      indoorRoute,
      indoorRouteNodes,

      transportMode,
      destination,
      selectedLocation,

      indoorStart,
      indoorDestination,
      indoorUserLocation,

      mapCenter,

      isOutdoorNavigating,
      lastNearestNode,
      scannedQR,
      outdoorStartNode,

      // Missing ones
      showNavigationCard,
      sheetOpen,
      sheetTitle,
      sheetData,
      selectedDepartment,
      snappedLocation,
      fixedUserLocation,
      outdoorTarget,
      remainingRoute,
      navigationMessage,
    };

    setHistory((previousHistory) => [...previousHistory, snapshot]);

    window.history.pushState(
      snapshot,
      "",
      window.location.pathname
    );

    setNavStep(newStep);
  };

  const handleBack = () => {
    const previousState = history.at(-1);

    // First restore navigation if available
    if (previousState) {
      setHistory((prev) => prev.slice(0, -1));

      setNavStep(previousState.navStep);
      setMapMode(previousState.mapMode);
      setCurrentFloor(previousState.currentFloor);

      setRoute(previousState.route);
      setIndoorRoute(previousState.indoorRoute);
      setIndoorRouteNodes(previousState.indoorRouteNodes);

      setTransportMode(previousState.transportMode);

      setDestination(previousState.destination);
      setSelectedLocation(previousState.selectedLocation);

      setIndoorStart(previousState.indoorStart);
      setIndoorDestination(previousState.indoorDestination);
      setIndoorUserLocation(previousState.indoorUserLocation);

      setMapCenter(previousState.mapCenter);

      setIsOutdoorNavigating(previousState.isOutdoorNavigating);

      setLastNearestNode(previousState.lastNearestNode);

      setScannedQR(previousState.scannedQR);

      setOutdoorStartNode(previousState.outdoorStartNode);
      setShowNavigationCard(previousState.showNavigationCard);
      setSheetOpen(previousState.sheetOpen);
      setSheetTitle(previousState.sheetTitle);
      setSheetData(previousState.sheetData);
      setSelectedDepartment(previousState.selectedDepartment);

      setSnappedLocation(previousState.snappedLocation);
      setFixedUserLocation(previousState.fixedUserLocation);

      setOutdoorTarget(previousState.outdoorTarget);

      setRemainingRoute(previousState.remainingRoute);
      setNavigationMessage(previousState.navigationMessage);

      // if (previousState.navStep === STEPS.IDLE) {
      //   openBottomSheet("Departments", bottomSheetData.departments);
      // }

      return;
    }

    // No navigation history -> close sheet if open
    if (sheetOpen) {
      setSheetOpen(false);
      setSelectedDepartment(null);
      return;
    }

    // Nothing left -> reset
    resetNavigation();
    setRemainingRoute([]);
    // openBottomSheet("Departments", bottomSheetData.departments);
  };

  const resetNavigation = () => {

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

    setHistory([]);

    setIsOutdoorNavigating(false);

    setLastNearestNode(null);

    setScannedQR(null);

    setOutdoorStartNode(null);


  };

  const startOutdoorNavigation = (startNode = null) => {

    console.log("START CLICKED");
    console.log("locationToUse:", locationToUse);
    console.log("destination:", destination);
    console.log("outdoorStartNode:", outdoorStartNode);
    // console.log("Inside campus:", isInsideCampus(locationToUse));
    if (!startNode && !locationToUse && !snappedLocation) {

      alert("Location unavailable. Please enable GPS.");

      return;

    }


    if (!startNode && !isInsideCampus(locationToUse)) {


      setRoute([
        [locationToUse.lat, locationToUse.lng],
        [CAMPUS_ENTRANCE.lat, CAMPUS_ENTRANCE.lng],
      ]);

      setIsOutdoorNavigating(true);

      pushState(STEPS.OUTDOOR_NAVIGATING);


      return;
    }



    // User is inside campus

    // User is inside campus

    const routeStartLocation =
      snappedLocation || fixedUserLocation || locationToUse;

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

      end = floorEntryMap[destination.floor] || "g";

    } else {

      end = destination?.routeNode || destination?.id;

    }

    console.log("End node:", end);

    const nodePath = findPath(nearestNode, end, EDGES, NODES);
    console.log("PATH RESULT:", nodePath);

    const graphRoute = getPathCoordinates(nodePath, NODES);
    console.log("graphRoute:", graphRoute);


    setRoute(graphRoute);
    setIsOutdoorNavigating(false);
    pushState(STEPS.AT_BUILDING);
  };

  const startDirectIndoorNavigation = () => {

    const floor = destination.floor;

    const startNode = indoorEntranceByFloor[floor];

    const endNode = destination.indoorNode || destination.id;

    const indoorPath = findPath(
      startNode,
      endNode,
      INDOOR_EDGES,
      INDOOR_NODES
    );




    if (!indoorStart) {
      setIndoorStart({
        name: INDOOR_NODES[startNode].label,
        nearestNode: startNode,
      });

      setIndoorUserLocation({
        position: INDOOR_NODES[startNode].position,
        nearestNode: startNode,
        floor,
      });
    }
    setIndoorRouteNodes(indoorPath);

    setIndoorRoute(getPathCoordinates(indoorPath, INDOOR_NODES));

    setCurrentFloor(floor);

    setMapMode("INDOOR");

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
    const isIndoorDest =
      destination?.type === "room" || destination?.type === "faculty";
    const targetFloor = isIndoorDest ? destination.floor : "G";

    const endNode =
      mode === "lift"
        ? `lift_${currentFloor}`
        : getStairNode(currentFloor, targetFloor);

    const path = findPath(startNode, endNode, INDOOR_EDGES, INDOOR_NODES);
    console.log("PATH:", path);

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, INDOOR_NODES));
    setMapMode("INDOOR");

    pushState(STEPS.GO_TO_FLOOR);
  };

  const continueOnDestinationFloor = () => {
    if (!destination) return;

    // Outdoor destination
    const isIndoorDestination =
      destination.type === "room" ||
      destination.type === "faculty";

    if (!isIndoorDestination) {
      // Outdoor destination
      // We came from F1/F2
      const startNode =
        transportMode === "lift"
          ? "lift_G"
          : "stairsA_G";

      // User has reached Ground Floor
      setCurrentFloor("G");

      setIndoorStart({
        name: INDOOR_NODES[startNode]?.label || startNode,
        nearestNode: startNode,
      });

      setIndoorUserLocation({
        position: INDOOR_NODES[startNode].position,
        nearestNode: startNode,
        floor: "G",
      });

      const path = findPath(
        startNode,
        "entrance_G",
        INDOOR_EDGES,
        INDOOR_NODES
      );

      setIndoorRouteNodes(path);
      setIndoorRoute(getPathCoordinates(path, INDOOR_NODES));

      setMapMode("INDOOR");

      pushState(STEPS.FLOOR_NAVIGATION);

      return;
    }
    console.log("transportMode:", transportMode);
    console.log("currentFloor:", currentFloor);
    console.log("destination.floor:", destination.floor);

    // Existing room navigation
    const startNode =
      transportMode === "lift"
        ? `lift_${destination.floor}`
        : getStairNode(destination.floor, currentFloor);

    setCurrentFloor(destination.floor);
    console.log("Chosen start node:", startNode);

    setIndoorStart({
      name: INDOOR_NODES[startNode]?.label || startNode,
      nearestNode: startNode,
      floor: destination.floor,
    });

    const path = findPath(
      startNode,
      destination.id,
      INDOOR_EDGES,
      INDOOR_NODES
    );

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, INDOOR_NODES));

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
      { sheet: true },
      "",
      window.location.pathname
    );
  };

  const handleLocateMe = () => {

    if (!fixedUserLocation) return;



    setMapCenter({

      id: "current-location",

      position: [
        fixedUserLocation.lat,
        fixedUserLocation.lng
      ]

    });

  };

  console.log(indoorUserLocation);

  const startIndoorNavigation = () => {

    if (!indoorStart || !indoorDestination) return;



    // Destination is on the same floor

    if (currentFloor === indoorDestination.floor) {

      const path = findPath(
        indoorStart.nearestNode,
        indoorDestination.id,
        INDOOR_EDGES,
        INDOOR_NODES
      );



      setIndoorRouteNodes(path);

      setIndoorRoute(getPathCoordinates(path, INDOOR_NODES));



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
    if (["F1", "F2"].includes(currentFloor)) {
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
      INDOOR_EDGES,
      INDOOR_NODES
    );

    console.log("Indoor path:", path);

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, INDOOR_NODES));

    const startPosition = INDOOR_NODES[indoorStart.nearestNode]?.position;
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
    const activeNode = INDOOR_NODES[activeNodeId];

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
      }

      return;
    }



    // Indoor QR

    setMapMode("INDOOR");

    setCurrentFloor(qrData.floor);


    setIndoorStart({

      name: qrData.name,

      nearestNode: qrData.startNode,

      floor: qrData.floor,

    });



    const indoorPosition =
      INDOOR_NODES[qrData.startNode].position;


    setIndoorUserLocation({

      position: indoorPosition,

      nearestNode: qrData.startNode,

      floor: qrData.floor,

    });


    setMapCenter({

      id: qrData.id,

      position: indoorPosition,

    });

  };


  console.log("indoorStart:", indoorStart);

  useEffect(() => {
    window.history.replaceState(
      { navigation: true },
      "",
      window.location.pathname
    );
  }, []);
  const changeFloor = (floor) => {
    pushState(navStep);
    pushState(navStep);
    setCurrentFloor(floor);
  };

  const isUserFloor =
    indoorUserLocation?.floor === currentFloor;

  const isDestinationFloor =
    destination?.floor === currentFloor;


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

  useEffect(() => {
    detectQRLocation();
  }, []);
  console.log({
    navStep,
    OUTDOOR_ROUTE: STEPS.OUTDOOR_ROUTE,
    isOutdoorNavigating,
    mapMode,
    destination,
  });




  return (

    <main className="app-shell">

      <div className="top-controls">

        <SearchBar

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
                window.history.back();

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
              setSheetTitle("Departments");
              openBottomSheet("Departments", bottomSheetData.departments);
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

            }

          }}

        />


        {mapMode === "OUTDOOR" && navStep === STEPS.IDLE && (

          <SearchChips

            onDepartmentsClick={() => {
              pushState(navStep);

              setSheetData(bottomSheetData.departments);

              setSelectedDepartment(null);

              setSheetTitle("Departments");

              openBottomSheet("Departments", bottomSheetData.departments);
              setSheetOpen(true);
            }}



            onLibraryClick={() => {
              pushState(navStep);

              setSheetData(bottomSheetData.library);

              setSheetTitle("Library");
              openBottomSheet("Library", bottomSheetData.library);
              setSheetOpen(true);

            }}



            onCafeteriaClick={() => {
              pushState(navStep);

              setSheetData(bottomSheetData.cafeteria);

              setSheetTitle("Cafeteria");
              openBottomSheet("Cafeteria", bottomSheetData.cafeteria);
              setSheetOpen(true);

            }}



            onBuildingsClick={() => {
              pushState(navStep);

              setSheetData(bottomSheetData.buildings);

              setSheetTitle("Buildings");
              openBottomSheet("Buildings", bottomSheetData.buildings);
              setSheetOpen(true);

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
        currentLocation={snappedLocation}
        route={route}
        indoorRoute={indoorRoute}
        indoorRouteNodes={indoorRouteNodes}
        currentFloor={currentFloor}
        mapMode={mapMode}
        destination={destination}
        mapCenter={mapCenter}
        indoorUserLocation={indoorUserLocation}
        setIndoorUserLocation={setIndoorUserLocation}
        indoorLocationMode={indoorLocationMode}
        indoorStart={indoorStart}
        setIndoorStart={setIndoorStart}
        // isNavigating={isNavigating}
        nearestDebugNode={nearestDebugNode}
      />


      <LocationButton onClick={handleLocateMe} />

      <BottomSheet

        open={sheetOpen}

        onClose={() => {
          setSheetOpen(false);
          setSelectedDepartment(null);
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
              name: INDOOR_NODES[indoorUserLocation.nearestNode].label,
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


            setNavStep(STEPS.OUTDOOR_ROUTE);

          }

        }}

      />





      <FloorSelector

        currentFloor={currentFloor}

        setCurrentFloor={changeFloor}

        mapMode={mapMode}

        destination={destination}

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

                  setShowNavigationCard(false);

                  setTimeout(() => {
                    setShowNavigationCard(true);
                  }, 3000); // 3 seconds delay

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
                  🚗 External GPS
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
              Have you reached <strong>St Mary's Block entrance</strong>?
            </p>

            <div className="button-row">

              <button
                className="primary-action"
                onClick={() => {

                  if (["B2", "B1", "G"].includes(destination.floor)) {

                    startDirectIndoorNavigation();
                    return;

                  }


                  setCurrentFloor("G");
                  setMapMode("INDOOR");

                  setIndoorStart({
                    name: "Ground Entrance",
                    nearestNode: "entrance_G",
                  });


                  setIndoorUserLocation({
                    position: INDOOR_NODES["entrance_G"].position,
                    nearestNode: "entrance_G",
                    floor: "G",
                  });


                  pushState(STEPS.FLOOR_CHOICE);

                }}
              >
                Yes
              </button>


              <button
                className="secondary-action"
                onClick={() =>
                  setNavStep(STEPS.OUTDOOR_ROUTE)
                }
              >
                No
              </button>

            </div>

          </NavigationCard>
        )
      }
      {
        showNavigationCard &&
        navStep === STEPS.AT_BUILDING &&
        !isIndoorDestination(destination) && (
          <NavigationCard className="arrival-card">
            <div className="arrival-icon">🎉</div>

            <h2>Destination Reached</h2>

            <p className="arrival-text">
              You have successfully arrived at{" "}
              <strong>
                {destination?.name || destination?.id || "your destination"}
              </strong>.
            </p>

            <div className="feedback-section">
              <h3>Help Us Improve</h3>

              <p>
                We'd love to hear about your navigation experience.
                Your feedback helps us improve the campus navigation
                system for everyone.
              </p>

              <div className="arrival-actions">
                <button
                  className="primary-action"
                  onClick={() => {
                    setRoute([]);
                    setShowNavigationCard(false);
                    setIsOutdoorNavigating(false);
                    setNavStep(STEPS.IDLE);
                  }}
                >
                  ✅ Finish
                </button>

                <button
                  className="feedback-btn"
                  onClick={() =>
                    window.open(
                      "https://forms.gle/YOUR_GOOGLE_FORM_LINK",
                      "_blank"
                    )
                  }
                >
                  📝 Give Feedback
                </button>
              </div>
            </div>
          </NavigationCard>
        )
      }


      {

        navStep === STEPS.FLOOR_CHOICE && (

          <NavigationCard>

            <p>
              {destination?.type === "room" || destination?.type === "faculty"
                ? (
                  <>
                    How do you want to go to floor{" "}
                    <strong>{destination.floor}</strong>?
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
              {destination?.type === "room" || destination?.type === "faculty"
                ? <>Proceed to the <strong>{transportMode}</strong> and go to floor <strong>{destination.floor}</strong>.</>
                : <>Proceed to the <strong>{transportMode}</strong> and go down to the <strong>Ground Floor</strong> exit.</>
              }
            </p>

            <button className="primary-action" onClick={continueOnDestinationFloor}>
              {destination?.type === "room" || destination?.type === "faculty"
                ? `Reached ${destination.floor}`
                : "Reached Ground Floor"
              }
            </button>

          </NavigationCard>

        )

      }

      {navStep === STEPS.REACHED_EXIT && (
        <NavigationCard>
          <p>Have you reached the exit?</p>
          <div className="button-row">
            <button
              className="primary-action"
              onClick={() => {
                switchToOutdoorNavigation();
              }}
            >
              Yes, continue outside
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



      {navStep === STEPS.FLOOR_NAVIGATION &&
        isUserFloor && (
          currentFloor === indoorUserLocation?.floor && (() => {
            const isOutdoorDest =
              destination?.type !== "room" && destination?.type !== "faculty";

            return (
              <NavigationCard>
                <p>
                  {isOutdoorDest
                    ? <>Follow the highlighted route to the <strong>building exit</strong>.</>
                    : <>Follow the highlighted route to <strong>{destination?.name || destination?.id}</strong>.</>
                  }
                </p>

                <button
                  className="primary-action"
                  onClick={() => {
                    setIndoorRoute([]);
                    setIndoorRouteNodes([]);

                    if (isOutdoorDest) {
                      // User reached the exit — hand off to outdoor navigation
                      pushState(STEPS.REACHED_EXIT);
                    } else {
                      // User reached indoor room
                      if (destination?.type === "room") {
                        setIndoorStart({
                          name: destination.name,
                          nearestNode: destination.id,
                        });
                        setIndoorUserLocation({
                          position: INDOOR_NODES[destination.id].position,
                          nearestNode: destination.id,
                          floor: destination.floor,
                        });
                      }
                      pushState(STEPS.COMPLETED);
                    }
                  }}
                >
                  {isOutdoorDest ? "I reached the exit" : "I reached"}
                </button>
              </NavigationCard>
            );
          })()
        )}


      {
        showNavigationCard &&
        destination?.type === "room" &&
        navStep === STEPS.COMPLETED &&
        isDestinationFloor && (
          <NavigationCard className="arrival-card">
            <div className="arrival-icon">🎉</div>

            <h2>Destination Reached</h2>

            <p className="arrival-text">
              You have successfully arrived at{" "}
              <strong>{destination.name}</strong> on{" "}
              <strong>{destination.floor}</strong>.
            </p>

            <div className="feedback-section">
              <h3>Help Us Improve</h3>

              <p>
                We'd love to hear about your navigation experience.
                Your feedback helps us improve the campus navigation
                system for everyone.
              </p>
              <div className="arrival-actions">
                <button
                  className="primary-action"
                  onClick={() => {
                    setShowNavigationCard(false);
                  }}
                >
                  ✅ Finish
                </button>

                <button
                  className="feedback-btn"
                  onClick={() =>
                    window.open(
                      "https://forms.gle/YOUR_GOOGLE_FORM_LINK",
                      "_blank"
                    )
                  }
                >
                  📝 Give Feedback
                </button>
              </div>
            </div>
          </NavigationCard>
        )
      }

      {navStep === STEPS.INDOOR_READY && (
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
      case "F1":
        return "stairsB_F1";
      case "F2":
        return "stairsB_F2";
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
    case "F1":
      return "stairsA_F1";
    case "F2":
      return "stairsA_F2";
    default:
      return `stairsA_${currentFloor}`;
  }
}
function isIndoorDestination(destination) {
  if (!destination) return false;

  return (
    destination.building === "stmarys" ||
    destination.routeNode === "st-marys-block" ||
    destination.floor === "B2" ||
    destination.floor === "B1" ||
    destination.floor === "G" ||
    destination.floor === "F1" ||
    destination.floor === "F2"
  );
}



export default App;