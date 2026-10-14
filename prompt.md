A HYBRID OUTDOOR-INDOOR NAVIGATION SYSTEM WITH DYNAMIC LOCATION BASED TRANSITION AND MULTI-LEVEL PATH ROUTING
1. FIELD OF THE INVENTION
The present invention relates to navigation systems and, more particularly, to a hybrid navigation system capable of providing continuous navigation from an outdoor geographical location to an indoor location within a relevant building. The invention combines location-based outdoor navigation, building entrance detection, dynamic transition between outdoor and indoor navigation, floor-aware indoor routing and destination routing.
2. BACKGROUND OF THE INVENTION
Conventional navigation systems typically operate in an outdoor geographical environment in which the position of the user can be determined with a satellite-based positioning system such as GPS. Such systems can be used to navigate towards a geographical location or a building, but typically cease operating upon approaching the building. Navigating within an indoor environment is a fundamentally different task since positioning with satellites can be imprecise or unavailable and buildings often have multiple levels, entrances and require navigating through different rooms and departments. Thus, a user who is guided to a building still requires assistance in finding the relevant entrance and reaching the desired destination.
Conventional outdoor and indoor navigation systems can be used separately or require the user to terminate outdoor navigation and initiate indoor navigation upon reaching a building. This can lead to loss of the previously selected destination and a discontinuous route. It is therefore desirable to provide a solution in which outdoor and indoor navigation are treated as a single connected process and in which the transition from one environment to the other can be achieved dynamically based on the location of the user and a transition condition.
3. PROBLEM TO BE SOLVED
The invention solves the problem of continuous navigation in which a destination is located within a building and the route therefore requires transitioning from an outdoor geographical environment to a relevant building-specific and floor-specific indoor environment. The solution specifically addresses determining when the user has reached the relevant entrance, switching from one navigation environment to the other, determining the indoor starting position and routing to the desired destination within the building.
4. OBJECTS OF THE INVENTION

●	Provide a hybrid outdoor-indoor navigation system with dynamic transition and floor-aware indoor routing for destinations located within a building.

●	Determine a transition condition associated with a building entrance or transition location.

●	Perform a dynamic transition from an outdoor positioning environment to an indoor positioning environment.

●	Provide floor-aware indoor routing for destinations located on different floors.

●	Maintain the selected destination and relevant route information during transition between navigation environments.

●	Provide a unified route spanning both outdoor and indoor route segments.
5. SUMMARY OF THE INVENTION
The present invention provides a hybrid outdoor-indoor navigation system including an outdoor positioning and routing environment and a building-specific indoor routing environment. The invention can be used in hospitals, airports, railway stations, shopping malls, exhibition centres, office buildings, manufacturing facilities, universities, government buildings or any other environment in which a route spans from an outdoor geographical area to an indoor multi-level building.
When the system detects a transition condition, it performs a dynamic transition from an outdoor to an indoor navigation environment. The transition condition can be, for example, the proximity to a particular building entrance or the transition location can be explicitly specified by the user. Once the transition to the indoor environment has been made, an indoor starting node associated with the transition location is determined and a floor on which the destination is located is identified. The system combines the outdoor and indoor route segments into a single route, which spans both the outdoor and indoor navigation environments.
6. SYSTEM ARCHITECTURE
The system according to one embodiment of the invention can be generally organised in the following modules:
101 – User Interface Module
102 – Destination Database
103 – Outdoor Positioning Module
104 – GPS Filtering Module
105 – Outdoor Navigation Module
106 – Entrance Detection Module
107 – Dynamic Transition Module
108 – Indoor Navigation Module
109 – Floor Identification Module
110 – Multi-Level Routing Module
111 – Indoor Position Initialization Module
112 – Unified Route Generation Module
113 – Navigation State Management Module
114 – Outdoor Navigation Graph
115 – Indoor Navigation Graph
Each of the modules can be implemented in various ways, for example, as software or hardware components executed on a mobile computing device, a kiosk, a tablet, a web-based application or another processing device.
CORE OPERATION
A selected destination is associated with a building, floor and indoor destination node. The outdoor positioning module determines the current outdoor position of the user and the GPS Filtering Module filters location data to provide more consistent positioning information. The Outdoor Navigation Module identifies an outdoor node and a route to the building transition location. The Entrance Detection Module detects a transition condition and the Dynamic Transition Module performs a dynamic transition from an outdoor to an indoor navigation environment. The Indoor Position Initialization Module determines an indoor starting node and the Floor Identification Module identifies the destination floor. The Indoor Navigation Module provides an indoor route, which spans both the outdoor and indoor navigation environments.
7. OUTDOOR GPS NAVIGATION
The Outdoor Positioning Module determines the current geographical position of the user based on a GPS receiver or another positioning source. In the context of a mobile application, the position can be determined constantly or periodically. The GPS Filtering Module analyses the current and past positions and smooths outliers to provide more consistent positioning information. The information is then used by the Outdoor Navigation Module in combination with the Outdoor Navigation Graph. The outdoor navigation graph can be used to identify the nearest outdoor node and to maintain a trail of the user’s movement.
8. OUTDOOR NAVIGATION GRAPH
The outdoor environment can be represented as an Outdoor Navigation Graph, which consists of nodes and edges. Nodes can represent gates, waypoints, building approach points, road intersections or other navigational landmarks. Edges can represent connections between nodes with information about distances, direction, accessibility or other parameters. Using a route-generation algorithm, the Outdoor Navigation Module can determine a route from the current position node to the transition location.
9. OUTDOOR ROUTE GENERATION
When the user selects an indoor destination, the Unified Route Generation Module determines the building and the transition location associated with the destination. Then, the Outdoor Navigation Module can be used to determine a route to the building entrance. Once the user reaches the relevant building, the route can be re-calculated if the current position changes substantially or if the route becomes unavailable.
10. AUTOMATIC ENTRANCE DETECTION
The Entrance Detection Module determines whether the user has reached the relevant building entrance or transition location. The transition location can be defined as a particular set of coordinates, a node in the Outdoor Navigation Graph, a predefined entrance region or another location identifier. In one embodiment, the filtered GPS position is compared to the predefined location and, when the distance to it is smaller than a particular threshold, a transition condition is detected. In other embodiments, the user can confirm that they have reached the relevant entrance or a QR checkpoint can be used to identify the transition location.
11. DYNAMIC OUTDOOR-TO-INDOOR TRANSITION
When a transition condition is detected, the Dynamic Transition Module switches the navigation environment from OUTDOOR to TRANSITION and subsequently to INDOOR. The user does not need to cancel the Outdoor Navigation Module or re-launch navigation. The previously selected destination, building, floor, route objective, session information and other parameters are retained while the representation of the current position is changed from the GPS-based outdoor position to the indoor position. In essence, the transition location acts as the dividing point between the Outdoor Navigation Graph and the Indoor Navigation Graph.
12. INDOOR POSITION INITIALIZATION
After transitioning to the Indoor Navigation Environment, the Indoor Position Initialization Module determines an indoor starting node, which can be based on the detected entrance location, mapped corridor information, a reception desk or other location-specific information.
13. USER-CONFIRMED TRANSITION
When the system detects that the user is close to the intended transition location, it can inform the user and ask them to confirm that they have reached the building entrance. Once the confirmation is received, the transition from the outdoor to the indoor navigation environment can be initiated. This process can be combined with other transition mechanisms, such as automatic entrance detection.
14. INDOOR BUILDING MAP
Each building can be represented with an Indoor Building Map, which contains the floor plans and other relevant information. The floor plans can be used to navigate between various rooms, classrooms, departments, corridors, staircases, lifts, entrances and other locations. Destination nodes can be defined for specific rooms and other locations.
15. FLOOR-AWARE INDOOR NAVIGATION
The Floor Identification Module determines the floor on which the destination is located. Using the information, the Indoor Navigation Module determines a route from the indoor starting node to the destination node. If the destination is on a different floor, the Multi-Level Routing Module determines a node that can be used to transition between floors, such as a staircase or lift, and determines a route through it. The system can be used to switch between different floor plans and display the relevant route on each floor.
16. MULTI-LEVEL PATH ROUTING
A building with multiple floors can be represented with several graphs and multiple floor plans, which can be connected with floor-transition nodes. Accordingly, a route can span several floor sections with the TRANSITION state being used to move between them. Information about the accessibility of different routes can also be taken into account when generating the route.
17. INDOOR NAVIGATION GRAPH
The Indoor Navigation Graph contains nodes and edges representing the navigational elements within a building. Several graphs can be used for different floors and connections between them can be established with floor-transition nodes. This allows following a route from an entrance to a particular room or department, which spans multiple floors.
18. UNIFIED DESTINATION ROUTING
The Unified Route Generation Module combines the outdoor and indoor route segments to provide a unified route from the current location to the destination. As an example, when the user selects a classroom as the destination, the system determines the relevant building and floor, routes the user to the building entrance using the Outdoor Navigation Module and subsequently switches to the Indoor Navigation Module to provide directions to the classroom.
Unified route: current outdoor position → outdoor route → building entrance → transition → indoor starting node → floor transition, if required → indoor destination node.
19. UNIFIED ROUTE REPRESENTATION
The unified route can be represented in various ways, for example, as an Outdoor Route and an Indoor Route with the Transition Location identifying the transition point between them. Route segments can be displayed sequentially while retaining a common destination identifier and route session information. Various visual elements can be used to differentiate between the outdoor and indoor segments of the route.
20. NAVIGATION STATE MANAGEMENT
The Navigation State Management Module manages the current navigation state, which can be either OUTDOOR, TRANSITION or INDOOR. While in the OUTDOOR state, the Outdoor Navigation Module is used to determine the position and generate a route. When a transition condition is detected, the TRANSITION state is entered to determine the building entrance and to determine the initial indoor position. Then, the INDOOR state is used to generate an indoor route. This approach ensures that the navigation process is not interrupted and that route and destination information are retained.
21. MOVEMENT TRAIL
Using the filtered GPS data, the system can maintain a trail, which follows the movement of the user to provide visual feedback. The trail can be discontinued or modified when the user switches to the Indoor Navigation Module.
22. DYNAMIC LOCATION BASED TRANSITION
The system according to one embodiment of the invention provides a dynamic location-based transition mechanism, which detects when the user has reached the transition point between the outdoor and indoor navigation environments. The transition condition can be based on the distance to a particular building entrance, a comparison of the location to a mapped transition node, confirmation from the user or a combination of these mechanisms. Accordingly, the system can identify when the transition to the indoor environment should be performed based on the building in which the destination is located rather than treating it as a separate and independent process.
23. PREFERRED IMPLEMENTATION
In one preferred embodiment, the system is implemented as a mobile application, which provides an interactive map of the relevant site or building. The user selects a destination from the Destination Database. The system determines the current outdoor location of the user, filters the GPS data, determines a route to the relevant building entrance and guides the user to it. Once the transition location has been reached, the system detects the transition condition, updates the indoor position, determines the indoor starting node, identifies the required floor and determines an indoor route to the destination.
24. EXAMPLE OF OPERATION
The user selects an indoor destination such as a hospital department, an airport gate, a railway platform, an office, a shop, an exhibition hall or a room. The destination is associated with a particular building, floor and destination node. The system determines the current outdoor position of the user and provides directions to the building entrance. When the user reaches the transition location, the transition condition is detected and the system switches to the indoor navigation environment, determines the indoor starting position, identifies the destination floor and provides indoor directions to the destination. If the destination is on another floor, the route spans through the staircases or lifts to it. The destination selected by the user is retained throughout the process.
25. ALTERNATIVE EMBODIMENTS
The outdoor positioning can be achieved with GPS, GNSS, network-based positioning, Wi-Fi positioning, Bluetooth positioning or a combination of these mechanisms.
The entrance detection can be based on distance-based threshold, geofencing, mapped entrance nodes, QR checkpoints, Bluetooth beacons, sensors, user confirmation or a combination of these mechanisms.
The indoor positioning can be achieved with QR codes, visual markers, Bluetooth beacons, inertial sensors, mapped checkpoints, user-defined starting positions or a combination of these mechanisms.
The indoor routing can be based on floor-specific maps or a unified 3D building graph.
The system can be implemented as a mobile application, a web application, a kiosk application or another application running on a tablet or a computing device.
26–28. DEVICE, KIOSK AND GENERAL FACILITY EMBODIMENTS
The mobile computing device can include a processor, memory, display, positioning receiver, communication interface, user input interface and other components, on which the positioning, route calculation, transition detection, indoor position initialization and routing modules can be executed as software components. The kiosk can be placed at the building entrance, reception or another location to provide route guidance and initiate the outdoor and indoor navigation processes. The general facility embodiment can be used in hospitals, airports, railway stations, shopping malls, exhibition centres, manufacturing facilities, offices, laboratories, government counters, accommodation and other large-scale or multi-level environments.
29. ADVANTAGES

●	The system provides a seamless transition between an outdoor and an indoor navigation environment.

●	It eliminates the need to restart the navigation process after reaching a building.

●	The selected destination is retained throughout the process.

●	The system supports building-specific and floor-specific navigation.

●	Indoor navigation can be performed without relying on continuous GPS data.

●	Several mechanisms can be used to detect the transition from an outdoor to an indoor environment.

●	The system supports unified route representation, which encompasses both the outdoor and indoor route segments.
30. INDUSTRIAL APPLICABILITY
The invention can be used in various fields, such as navigation systems, mobile computing, location-based services, indoor positioning and routing systems, in healthcare, aviation, railway, retail, hospitality, education, commercial, manufacturing, government and other environments.
31–32. DRAWINGS
FIG. 1: Overall architecture.
FIG. 2: Outdoor graph and route to entrance.
FIG. 3: Entrance/transition detection.
FIG. 4: Outdoor-to-indoor transition.
FIG. 5: Indoor position initialization.
FIG. 6: Floor-aware routing.
FIG. 7: Multi-level routing.
FIG. 8: Unified outdoor-to-indoor route.
FIG. 9: OUTDOOR/TRANSITION/INDOOR states.
FIG. 10: QR-based indoor position initialization.
FIG. 1 illustrates the relationships between the User Interface Module, Destination Database, positioning/filtering, Outdoor Navigation, Entrance Detection, Dynamic Transition, Indoor Position Initialization, Floor Identification, Multi-Level Routing and Indoor Navigation modules.
33. REFERENCE NUMERALS
101 – User Interface Module
102 – Destination Database
103 – Outdoor Positioning Module
104 – GPS Filtering Module
105 – Outdoor Navigation Module
106 – Entrance Detection Module
107 – Dynamic Transition Module
108 – Indoor Navigation Module
109 – Floor Identification Module
110 – Multi-Level Routing Module
111 – Indoor Position Initialization Module
112 – Unified Route Generation Module
113 – Navigation State Management Module
114 – Outdoor Navigation Graph
115 – Indoor Navigation Graph
116 – Building Entrance
117 – Transition Location
118 – QR Checkpoint
119 – Floor Transition Node
120 – Indoor Destination Node
121 – Outdoor Route
122 – Indoor Route
123 – Mobile Computing Device
124 – Navigation Kiosk
35. CLAIMS
1. A hybrid outdoor-indoor navigation system comprising:
a destination database associating a selected destination with a building, floor and indoor destination node;
an outdoor positioning module determining a geographical location;
an outdoor navigation module identifying an outdoor node and generating a route toward a building transition location;
an entrance detection module detecting a transition condition;
a dynamic transition module switching from outdoor to indoor navigation;
an indoor position initialization module establishing an indoor starting node;
a floor identification module identifying the destination floor; and
an indoor navigation module generating an indoor route,
wherein the selected destination is maintained so the outdoor and indoor routes form stages of a single navigation operation.
2–5. The system of claim 1, wherein:
positioning employs GPS or another satellite-based system;
GPS filtering reduces noisy or anomalous GPS readings;
the outdoor environment is represented by nodes and edges;
the transition location corresponds to a predefined building entrance.
6–9. The system wherein:
entrance detection employs a distance threshold to the transition location;
a QR checkpoint can identify the transition condition or the indoor starting node;
user confirmation can be combined with location-based transition;
the dynamic transition preserves at least the selected destination and navigation session.
10–13. The system wherein:
the indoor environment comprises one or more floor-specific maps and graphs;
the indoor navigation module employs floor transition nodes representing stairs, lifts or other floor-transition opportunities;
multi-level routing uses floor transition nodes to define a route spanning multiple floors.
14–18. The system wherein:
the indoor starting node can be defined with QR checkpoints, predefined entrance mapping, sensors, user selection or combinations thereof;
the system employs an outdoor route to the building entrance and an indoor route to the destination node;
navigation states comprise OUTDOOR, TRANSITION and INDOOR;
a trail can be maintained from successive GPS readings;
continuous satellite positioning is not required for indoor route after transition.
19–20. The system wherein:
the transition location is selected based on the building in which the destination is located;
the system displays an outdoor route before transition and a floor-specific indoor route after transition while maintaining the same selected destination.
21. A computer implemented method comprising:
receiving a selected destination;
associating it with a building, floor and indoor destination node;
determining an outdoor location;
generating an outdoor route to a transition location;
detecting a transition condition;
switching to indoor navigation;
establishing an indoor starting node;
identifying the destination floor;
generating an indoor route while maintaining the selected destination as a common navigation objective.
22–24. The method of claim 21 wherein:
the transition condition comprises approaching a predefined building entrance;
the indoor position is established by scanning a QR checkpoint;
the indoor route employs at least one floor-transition node when the destination floor differs from the current floor.
25. A computer-readable medium storing computer-executable instructions, which when executed by a processor, cause the processor to perform the method of claims 21–24.
36. ABSTRACT
A hybrid outdoor-indoor navigation system is disclosed for providing continuous navigation from the outdoor geographic location to the indoor destination within a building or facility. A selected destination is associated with a building, floor and indoor destination node. An outdoor positioning module determines the user location and an outdoor navigation module generates a route towards the building entrance or transition location. An entrance detection module detects the location-based transition condition, which causes the dynamic transition module to switch the navigation from outdoor to indoor while retaining the selected destination and the navigation session. The indoor position is initialized using a mapped entrance, QR checkpoint, user confirmation, sensor-assisted mechanism or combination thereof. The floor-aware indoor routing then generates the route to the destination which includes the inter-floor routing where required.
The outdoor and the indoor route segments thus form the stages of the unified navigation operation that can be applied to hospitals, airports, railway stations, shopping complexes, office buildings, exhibition centres and other mixed outdoor-indoor facilities.
