import { calculateHaversineDistance } from '../utils/haversine';
import { OUTDOOR_NODES } from '../data/outdoor/outdoorNodes';
import { OUTDOOR_EDGES } from '../data/outdoor/outdoorEdges';

/**
 * Finds the nearest outdoor node to a given lat/lng.
 */
export function findNearestOutdoorNode(lat, lng) {
    let nearest = null;
    let minDistance = Infinity;

    for (const [id, coord] of Object.entries(OUTDOOR_NODES)) {
        const dist = calculateHaversineDistance(lat, lng, coord[0], coord[1]);
        if (dist < minDistance) {
            minDistance = dist;
            nearest = id;
        }
    }
    return nearest;
}

/**
 * Finds the optimal outdoor path using A* algorithm.
 */
export function findOutdoorPath(startNodeId, destinationNodeId) {
    if (!OUTDOOR_NODES[startNodeId] || !OUTDOOR_NODES[destinationNodeId]) {
        return [];
    }

    // Build adjacency list
    const graph = {};
    for (const edge of OUTDOOR_EDGES) {
        const [a, b] = edge;
        if (!graph[a]) graph[a] = [];
        if (!graph[b]) graph[b] = [];

        const nodeA = OUTDOOR_NODES[a];
        const nodeB = OUTDOOR_NODES[b];
        
        if (nodeA && nodeB) {
            const dist = calculateHaversineDistance(nodeA[0], nodeA[1], nodeB[0], nodeB[1]);
            graph[a].push({ node: b, weight: dist });
            graph[b].push({ node: a, weight: dist });
        }
    }

    const openSet = new Set([startNodeId]);
    const closedSet = new Set();
    const gScore = { [startNodeId]: 0 };
    const fScore = { [startNodeId]: heuristic(startNodeId, destinationNodeId) };
    const cameFrom = {};

    while (openSet.size > 0) {
        // Find node in openSet with lowest fScore
        let current = null;
        let minF = Infinity;
        for (const node of openSet) {
            if ((fScore[node] || Infinity) < minF) {
                minF = fScore[node];
                current = node;
            }
        }

        if (current === destinationNodeId) {
            return reconstructPath(cameFrom, current);
        }

        openSet.delete(current);
        closedSet.add(current);

        const neighbors = graph[current] || [];
        for (const neighbor of neighbors) {
            if (closedSet.has(neighbor.node)) continue;

            const tentativeGScore = gScore[current] + neighbor.weight;

            if (!openSet.has(neighbor.node)) {
                openSet.add(neighbor.node);
            } else if (tentativeGScore >= (gScore[neighbor.node] || Infinity)) {
                continue; // Not a better path
            }

            cameFrom[neighbor.node] = current;
            gScore[neighbor.node] = tentativeGScore;
            fScore[neighbor.node] = tentativeGScore + heuristic(neighbor.node, destinationNodeId);
        }
    }

    return []; // No path found
}

function heuristic(nodeAId, nodeBId) {
    const nodeA = OUTDOOR_NODES[nodeAId];
    const nodeB = OUTDOOR_NODES[nodeBId];
    if (!nodeA || !nodeB) return 0;
    return calculateHaversineDistance(nodeA[0], nodeA[1], nodeB[0], nodeB[1]);
}

function reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
    }
    return path;
}
