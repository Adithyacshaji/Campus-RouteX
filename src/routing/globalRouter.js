import { findOutdoorPath } from './outdoorRouter';
import { findIndoorPath } from './indoorRouter';
import { CHAVARA_NODES } from '../data/chavara';
import { ST_MARYS_NODES } from '../data/st-marys';

const OUTDOOR_BUILDING_MAPPING = {
    'chavara': 'chavara',
    'st-marys': 'st-marys-block'
};

const INDOOR_ENTRANCES = {
    'chavara': 'entrance_G1', // Default entrance
    'st-marys': 'entrance_B1' // Default entrance
};

const ALL_NODES = {
    'chavara': CHAVARA_NODES,
    'st-marys': ST_MARYS_NODES
};

/**
 * Main routing facade. Returns a structured route segment array.
 */
export function findGlobalRoute(start, destination, options = { transportPref: 'any' }) {
    // 1. Same building
    if (start.building === destination.building) {
        const indoorPath = findIndoorPath({
            building: start.building,
            startNodeId: start.nodeId,
            destinationNodeId: destination.nodeId,
            transportPref: options.transportPref
        });
        
        if (indoorPath.length === 0) return { success: false, reason: "No route found inside building" };
        
        return {
            success: true,
            start,
            destination,
            segments: segmentIndoorPath(indoorPath, start.building)
        };
    }

    // 2. Different buildings
    // Path: startRoom -> building1Entrance -> outdoor -> building2Entrance -> destRoom

    const startEntranceId = INDOOR_ENTRANCES[start.building];
    const destEntranceId = INDOOR_ENTRANCES[destination.building];

    const indoorPath1 = findIndoorPath({
        building: start.building,
        startNodeId: start.nodeId,
        destinationNodeId: startEntranceId,
        transportPref: options.transportPref
    });

    const outdoorStartId = OUTDOOR_BUILDING_MAPPING[start.building];
    const outdoorDestId = OUTDOOR_BUILDING_MAPPING[destination.building];
    const outdoorPath = findOutdoorPath(outdoorStartId, outdoorDestId);

    const indoorPath2 = findIndoorPath({
        building: destination.building,
        startNodeId: destEntranceId,
        destinationNodeId: destination.nodeId,
        transportPref: options.transportPref
    });

    if (!indoorPath1 || !outdoorPath || !indoorPath2) {
        return { success: false, reason: "Could not find a connecting route between buildings" };
    }

    const segments = [
        ...segmentIndoorPath(indoorPath1, start.building),
        { type: 'outdoor', nodes: outdoorPath },
        ...segmentIndoorPath(indoorPath2, destination.building)
    ];

    return {
        success: true,
        start,
        destination,
        segments
    };
}

/**
 * Breaks a continuous indoor path into segments separated by floor transitions.
 */
function segmentIndoorPath(path, building) {
    if (path.length === 0) return [];

    const nodes = ALL_NODES[building];
    const segments = [];
    
    let currentSegment = {
        type: 'indoor',
        building: building,
        floor: nodes[path[0].nodeId]?.floor || 'unknown',
        nodes: []
    };

    for (let i = 0; i < path.length; i++) {
        const step = path[i];
        const floor = nodes[step.nodeId]?.floor || 'unknown';

        if (step.type === 'lift' || step.type === 'stairs') {
            // Reached a vertical transition. Finish current indoor segment.
            currentSegment.nodes.push(step.nodeId);
            if (currentSegment.nodes.length > 1) segments.push(currentSegment);

            // Create a vertical segment spanning from this node to the next
            const nextStep = path[i + 1];
            if (nextStep) {
                const nextFloor = nodes[nextStep.nodeId]?.floor || 'unknown';
                segments.push({
                    type: 'vertical',
                    building: building,
                    fromFloor: floor,
                    toFloor: nextFloor,
                    transport: step.type,
                    nodes: [step.nodeId, nextStep.nodeId]
                });
                
                // Prepare next indoor segment on the new floor
                currentSegment = {
                    type: 'indoor',
                    building: building,
                    floor: nextFloor,
                    nodes: [nextStep.nodeId]
                };
                i++; // Skip the next node since it's already in the vertical segment and start of next
            }
        } else {
            currentSegment.nodes.push(step.nodeId);
            currentSegment.floor = floor; // In case we had 'unknown' start
        }
    }

    if (currentSegment.nodes.length > 1 || segments.length === 0) {
        segments.push(currentSegment);
    }

    return segments;
}
