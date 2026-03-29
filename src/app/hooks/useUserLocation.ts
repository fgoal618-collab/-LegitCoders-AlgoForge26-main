import { useState, useCallback } from 'react';
import type { PlaceInfo } from '../types/transit';

/**
 * Hook for detecting user's current GPS location with reverse geocoding
 */
export function useUserLocation() {
  const [location, setLocation] = useState<PlaceInfo | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setIsDetecting(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ location: coords });
          const address = result.results[0]?.formatted_address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
          const name = result.results[0]?.address_components?.[0]?.long_name || 'My Location';
          setLocation({ name, lat: coords.lat, lng: coords.lng, address });
        } catch {
          setLocation({ name: 'Current Location', lat: coords.lat, lng: coords.lng, address: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` });
        }
        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        const msgs: Record<number, string> = {
          1: 'Location permission denied. Please enable in browser settings.',
          2: 'Location unavailable. Enter your location manually.',
          3: 'Location request timed out. Try again.',
        };
        setError(msgs[err.code] || 'Could not detect location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { location, isDetecting, error, detect, setLocation };
}
