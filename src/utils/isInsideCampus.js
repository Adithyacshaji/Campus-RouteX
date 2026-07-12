const CAMPUS = {
  minLat: 10.35330,
  maxLat: 10.35820,
  minLng: 76.21110,
  maxLng: 76.21420,
};

export function isInsideCampus(location) {
  if (!location) return false;

  const MARGIN = 0.0002;

  return (
    location.lat >= CAMPUS.minLat - MARGIN &&
    location.lat <= CAMPUS.maxLat + MARGIN &&
    location.lng >= CAMPUS.minLng - MARGIN &&
    location.lng <= CAMPUS.maxLng + MARGIN
  );
}