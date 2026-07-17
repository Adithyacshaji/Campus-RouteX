import { NODES } from "../data/graph";
import { calculateHaversineDistance } from "./haversine";

/** Outdoor graph node IDs for St Mary's Block's three distinct entrances. */
export const ST_MARYS_ENTRANCE_NODES = ["g", "b1", "b2"];

/**
 * Compare GPS distance from the user to all St Mary's entrances and return
 * the closest one as the pathfinding destination node.
 *
 * @param {{ lat: number, lng: number }} userLocation
 * @returns {{ nodeId: string, distanceMeters: number, position: [number, number] | undefined }}
 */
export function findNearestStMarysEntrance(userLocation) {
  if (!userLocation?.lat || !userLocation?.lng) {
    return { nodeId: "g", distanceMeters: Infinity, position: NODES.g };
  }

  let bestNodeId = "g";
  let minDist = Infinity;

  for (const nodeId of ST_MARYS_ENTRANCE_NODES) {
    const pos = NODES[nodeId];
    if (!pos) continue;

    const dist = calculateHaversineDistance(
      userLocation.lat,
      userLocation.lng,
      pos[0],
      pos[1]
    );

    if (dist < minDist) {
      minDist = dist;
      bestNodeId = nodeId;
    }
  }

  return {
    nodeId: bestNodeId,
    distanceMeters: minDist,
    position: NODES[bestNodeId],
  };
}