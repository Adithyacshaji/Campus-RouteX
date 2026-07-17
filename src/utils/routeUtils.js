/**
 * Returns compass bearing (degrees, 0 = north, clockwise) from point A to B.
 * Both points are [lat, lng] arrays.
 */
export function getBearing(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const dLng = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }
  
  /** Weighted average bearing of the first few path segments. */
  export function getRouteBearing(path) {
    if (!path || path.length < 2) return 0;
  
    let totalBearing = 0;
    let count = 0;
  
    for (let i = 0; i < Math.min(path.length - 1, 5); i++) {
      totalBearing += getBearing(path[i], path[i + 1]);
      count++;
    }
  
    return count > 0 ? totalBearing / count : 0;
  }
  
  /**
   * Compute arrow anchor points along a path — placed at segment midpoints
   * and additionally at sharp turns (> threshold degrees).
   */
  export function buildArrowMarkers(path, intervalSegments = 1, turnThreshold = 35) {
    if (!path || path.length < 2) return [];
  
    const arrows = [];
  
    for (let i = 0; i < path.length - 1; i += intervalSegments) {
      const a = path[i];
      const b = path[Math.min(i + 1, path.length - 1)];
  
      arrows.push({
        position: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
        bearing: getBearing(a, b),
        key: `arr-${i}`,
      });
  
      // Extra arrow at sharp bends so users see turn direction instantly
      if (i > 0 && i < path.length - 2) {
        const prev = path[i - 1];
        const b1 = getBearing(prev, a);
        const b2 = getBearing(a, b);
        const delta = Math.abs(((b2 - b1 + 540) % 360) - 180);
  
        if (delta > turnThreshold) {
          arrows.push({
            position: a,
            bearing: b2,
            key: `turn-${i}`,
          });
        }
      }
    }
  
    return arrows;
  }