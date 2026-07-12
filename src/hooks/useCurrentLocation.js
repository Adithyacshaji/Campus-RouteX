import { useState, useRef, useCallback } from "react";

export default function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const watchIdRef = useRef(null);

  const getOneShotLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser.");
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(loc);
          resolve(loc);
        },
        (error) => {
          console.warn("Geolocation error in getOneShotLocation:", error);
          resolve(null); // Resolve with null so caller can handle gracefully
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
      );
    });
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { location, getOneShotLocation, stopTracking };
}