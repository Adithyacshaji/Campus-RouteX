/**
 * Calculates the closest point on a polyline (route) to a given location,
 * and returns the snapped coordinate, the index of the segment, and the distance in meters.
 * Equirectangular coordinates are used as they are accurate at campus scale.
 * 
 * @param {Array} route - Array of [lat, lng] coordinates representing the path.
 * @param {Object} location - The user's GPS location {lat, lng}.
 * @returns {Object} { point, distanceMeters, segmentIndex }
 */
export function getDistanceToRoute(route, location) {
  if (!location || !route || route.length < 2) {
    const fallbackPoint = route && route[0]
      ? (Array.isArray(route[0]) ? route[0] : [route[0].lat, route[0].lng])
      : null;
    return { point: fallbackPoint, distanceMeters: Infinity, segmentIndex: 0 };
  }

  const userLat = location.lat !== undefined ? location.lat : location[0];
  const userLng = location.lng !== undefined ? location.lng : location[1];

  if (userLat === undefined || userLng === undefined || Number.isNaN(userLat) || Number.isNaN(userLng)) {
    const fallbackPoint = Array.isArray(route[0]) ? route[0] : [route[0].lat, route[0].lng];
    return { point: fallbackPoint, distanceMeters: Infinity, segmentIndex: 0 };
  }

  const latScale = 111320; // roughly meters per degree latitude
  const lngScale = latScale * Math.cos((userLat * Math.PI) / 180);
  const userPoint = [userLat, userLng];
  
  const firstPoint = Array.isArray(route[0]) ? route[0] : [route[0].lat, route[0].lng];
  let closest = { distanceSquared: Infinity, segment: 0, point: firstPoint };

  for (let index = 0; index < route.length - 1; index += 1) {
    const s = route[index];
    const e = route[index + 1];
    const start = Array.isArray(s) ? s : [s.lat, s.lng];
    const end = Array.isArray(e) ? e : [e.lat, e.lng];
    
    const dx = (end[1] - start[1]) * lngScale;
    const dy = (end[0] - start[0]) * latScale;
    const lengthSquared = dx * dx + dy * dy;
    
    // t is the projection scalar (0 <= t <= 1)
    const t = lengthSquared 
      ? Math.max(0, Math.min(1, (((userPoint[1] - start[1]) * lngScale * dx) + ((userPoint[0] - start[0]) * latScale * dy)) / lengthSquared)) 
      : 0;
      
    const projected = [
      start[0] + (end[0] - start[0]) * t, 
      start[1] + (end[1] - start[1]) * t
    ];
    
    const distanceSquared = ((userPoint[1] - projected[1]) * lngScale) ** 2 + ((userPoint[0] - projected[0]) * latScale) ** 2;
    
    if (distanceSquared < closest.distanceSquared) {
      closest = { distanceSquared, segment: index, point: projected };
    }
  }

  return {
    point: closest.point,
    distanceMeters: Math.sqrt(closest.distanceSquared),
    segmentIndex: closest.segment
  };
}
