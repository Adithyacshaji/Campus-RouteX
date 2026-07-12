export function distanceBetween(a, b) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;

  return Math.sqrt(dx * dx + dy * dy);
}