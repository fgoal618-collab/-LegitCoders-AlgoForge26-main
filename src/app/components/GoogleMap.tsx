import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  currentPosition?: { lat: number; lng: number };
  progress?: number;
}

export function GoogleMap({ origin, destination, currentPosition, progress = 0 }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      
      const newMap = new Map(mapRef.current, {
        center: { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(newMap);

      // Add origin marker
      const originMarker = new google.maps.Marker({
        position: origin,
        map: newMap,
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBCOTgxIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjMTBCOTgxIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjYiIGZpbGw9IiMxMEI5ODEiLz48L3N2Zz4=',
          scaledSize: new google.maps.Size(30, 30),
        },
        title: origin.name,
      });

      // Add destination marker
      const destMarker = new google.maps.Marker({
        position: destination,
        map: newMap,
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRUY0NDQ0IiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjRUY0NDQ0IiBmaWxsLW9wYWNpdHk9IjAuMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjYiIGZpbGw9IiNFRjQ0NDQiLz48L3N2Zz4=',
          scaledSize: new google.maps.Size(30, 30),
        },
        title: destination.name,
      });

      // Vehicle marker
      const vehiclePosition = currentPosition || origin;
      const vehicleMarker = new google.maps.Marker({
        position: vehiclePosition,
        map: newMap,
        icon: {
          url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjU2M0ViIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjMjU2M0ViIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjYiIGZpbGw9IiMyNTYzRWIiLz48L3N2Zz4=',
          scaledSize: new google.maps.Size(25, 25),
        },
        title: 'Your ride',
      });

      setMarkers([originMarker, destMarker, vehicleMarker]);

      // Get directions
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3A86FF',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            setDirectionsRenderer(directionsRenderer);
          }
        }
      );
    };

    if (window.google?.maps) {
      initMap();
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => clearInterval(checkGoogleMaps), 10000);
    }
  }, [origin, destination]);

  // Update vehicle position based on progress
  useEffect(() => {
    if (markers[2] && directionsRenderer) {
      const directions = directionsRenderer.getDirections();
      if (directions && directions.routes[0]) {
        const route = directions.routes[0];
        const path = route.overview_path;
        const index = Math.floor((progress / 100) * (path.length - 1));
        const position = path[index];
        
        if (position) {
          markers[2].setPosition(position);
        }
      }
    }
  }, [progress, markers, directionsRenderer]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[288px] rounded-b-3xl"
    />
  );
}

// Type declaration for window.google
declare global {
  interface Window {
    google: typeof google;
  }
}
