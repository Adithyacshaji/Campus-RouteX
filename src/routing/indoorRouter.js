import { CHAVARA_NODES, CHAVARA_EDGES, CHAVARA_VERTICAL } from '../data/chavara';
import { ST_MARYS_NODES, ST_MARYS_EDGES, ST_MARYS_VERTICAL } from '../data/st-marys';

const BUILDINGS = {
    'chavara': { nodes: CHAVARA_NODES, edges: CHAVARA_EDGES, vertical: CHAVARA_VERTICAL },
    'st-marys': { nodes: ST_MARYS_NODES, edges: ST_MARYS_EDGES, vertical: ST_MARYS_VERTICAL }
};

/**
 * Finds the optimal indoor path within a single building, possibly across floors.
 */
export function findIndoorPath({ building, startNodeId, destinationNodeId, transportPref = 'any' }) {
    if (!BUILDINGS[building]) return [];
    
    const { nodes, edges, vertical } = BUILDINGS[building];
    if (!nodes[startNodeId] || !nodes[destinationNodeId]) return [];

    // Build Graph
    const graph = {};
    const addEdge = (a, b, weight, type) => {
        if (!graph[a]) graph[a] = [];
        if (!graph[b]) graph[b] = [];
        graph[a].push({ node: b, weight, type });
        graph[b].push({ node: a, weight, type });
    };

    // Add floor edges
    for (const edge of edges) {
        const [a, b] = edge;
        const nodeA = nodes[a];
        const nodeB = nodes[b];
        if (nodeA && nodeB) {
            const dist = Math.hypot(nodeA.position[0] - nodeB.position[0], nodeA.position[1] - nodeB.position[1]);
            addEdge(a, b, dist, 'corridor');
        }
    }

    // Add vertical connections based on user preference (stairs/lifts)
    for (const vEdge of vertical) {
        if (transportPref === 'any' || transportPref === vEdge.type) {
            // Give a fixed high cost to vertical traversal so it prefers optimal paths but works
            addEdge(vEdge.from, vEdge.to, 50, vEdge.type);
        }
    }

    const openSet = new Set([startNodeId]);
    const closedSet = new Set();
    const gScore = { [startNodeId]: 0 };
    const cameFrom = {};

    // For heuristic, just distance ignoring floor differences (could be improved)
    const heuristic = (nodeAId, nodeBId) => {
        const nodeA = nodes[nodeAId];
        const nodeB = nodes[nodeBId];
        if (!nodeA || !nodeB) return 0;
        return Math.hypot(nodeA.position[0] - nodeB.position[0], nodeA.position[1] - nodeB.position[1]);
    };
    
    const fScore = { [startNodeId]: heuristic(startNodeId, destinationNodeId) };

    while (openSet.size > 0) {
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
                continue;
            }

            cameFrom[neighbor.node] = {
                node: current,
                type: neighbor.type
            };
            gScore[neighbor.node] = tentativeGScore;
            fScore[neighbor.node] = tentativeGScore + heuristic(neighbor.node, destinationNodeId);
        }
    }

    return []; // No route
}

function reconstructPath(cameFrom, current) {
    const path = [];
    while (current) {
        const step = cameFrom[current];
        if (!step) {
            path.unshift({ nodeId: current, type: 'start' });
            break;
        }
        path.unshift({ nodeId: current, type: step.type });
        current = step.node;
    }
    return path;
}
