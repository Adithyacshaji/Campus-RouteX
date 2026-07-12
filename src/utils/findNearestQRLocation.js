import { QR_LOCATIONS } from "../data/qrLocations";
import { calculateHaversineDistance } from "./haversine";

const MAX_SNAP_DISTANCE_METERS = 50; // Only snap if within 50m of a QR code

export function findNearestQRLocation(location) {
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  QR_LOCATIONS.forEach((qr) => {
    const distance = calculateHaversineDistance(
      location.lat,
      location.lng,
      qr.position[0],
      qr.position[1]
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = qr;
    }
  });

  // Only return a result if within the threshold distance
  if (minDistance > MAX_SNAP_DISTANCE_METERS) {
    return null;
  }

  return nearest;
}