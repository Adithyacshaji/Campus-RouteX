import { LOCATION_POINTS } from "../data/locationPoints";
import { calculateHaversineDistance } from "./haversine";

export function findNearestLocation(position) {
  let nearest = null;
  let min = Infinity;

  LOCATION_POINTS.forEach((point) => {
    const d = calculateHaversineDistance(
      position.lat,
      position.lng,
      point.position[0],
      point.position[1]
    );

    if (d < min) {
      min = d;
      nearest = point;
    }
  });

  return nearest;
}