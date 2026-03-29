// PlannerPage — Smart journey planner with 3 optimal routes
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Locate, Navigation2, ArrowRight, Clock, MapPin, Route, Search,
  ChevronDown, ChevronUp, AlertTriangle, ExternalLink, Layers,
  X, Bus, TrainFront, Train, Car, Footprints, Zap, DollarSign,
  Scale, ArrowLeft, ChevronRight, Shield, CheckCircle2, Bookmark,
  Sparkles, TrendingDown, Armchair, Navigation,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { getNearbyTransit } from '../services/transitService';
import { computeSmartRoutes } from '../services/smartRouteEngine';
import type { SmartRoute, SmartStep } from '../services/smartRouteEngine';
import { allStations, transitLines } from '../data/stations';
import { haversineDistance, formatDistance, formatDuration } from '../utils/geo';
import { estimateFare, estimateTime, cabFareForDistance } from '../utils/fare';
import { saveTrip } from '../services/tripStorage';
import { MODE_COLORS, MODE_ICONS, SEARCH_RADIUS } from '../utils/constants';
import type { Station, BusStop, NearbyTransitSummary } from '../types/transit';

interface PlaceInfo {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface DestinationSuggestion {
  placeId: string;
  name: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
  distance?: number;
}

// Re-export SmartRoute/SmartStep types for use in component
type JourneyRoute = SmartRoute;
type JourneyStep = SmartStep;

const MUMBAI_CENTER = { lat: 19.0760, lng: 72.8777 };

export function NavigationPage() {
  const navigate = useNavigate();
  // ─── Refs ───────────────────────────────────────────────────
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<google.maps.Map | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const destSuggestionMarkersRef = useRef<google.maps.Marker[]>([]);
  const routeRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
  const searchSessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // ─── State ──────────────────────────────────────────────────
  const [mapReady, setMapReady] = useState(false);

  // Source
  const [origin, setOrigin] = useState<PlaceInfo | null>(null);
  const [originText, setOriginText] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [editingSource, setEditingSource] = useState(true);
  const [sourceSuggestions, setSourceSuggestions] = useState<DestinationSuggestion[]>([]);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [showSourceDrop, setShowSourceDrop] = useState(false);

  const [voiceTarget, setVoiceTarget] = useState<'origin' | 'destination'>('destination');

  // Destination search
  const [destText, setDestText] = useState('');
  const [destSuggestions, setDestSuggestions] = useState<DestinationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<PlaceInfo | null>(null);
  const [destinationConfirmed, setDestinationConfirmed] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Journey results
  const [journeyRoutes, setJourneyRoutes] = useState<JourneyRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Nearby transit
  const [nearbySource, setNearbySource] = useState<NearbyTransitSummary | null>(null);
  const [nearbyDest, setNearbyDest] = useState<NearbyTransitSummary | null>(null);

  // ─── Map Init ───────────────────────────────────────────────
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;
      try {
        const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
        const map = new Map(mapRef.current, {
          center: MUMBAI_CENTER, zoom: 12,
          mapTypeControl: false, streetViewControl: false,
          fullscreenControl: true, zoomControl: true, gestureHandling: 'greedy',
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
          ],
        });
        mapObjRef.current = map;
        setMapReady(true);
      } catch (err) { console.error('Map init failed:', err); }
    };
    if (window.google?.maps) initMap();
    else {
      const check = setInterval(() => { if (window.google?.maps) { clearInterval(check); initMap(); } }, 200);
      setTimeout(() => clearInterval(check), 15000);
    }
  }, []);

  // Read origin/destination from router state (passed from HomePage)
  const routerLocation = useLocation();
  const hasInitializedRef = useRef(false);
  const pendingComputeRef = useRef<{ origin: PlaceInfo; dest: PlaceInfo } | null>(null);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const state = routerLocation.state as { origin?: PlaceInfo; destination?: PlaceInfo } | null;
    if (state?.origin) {
      setOrigin(state.origin);
      setOriginText(state.origin.name);
      setEditingSource(false);
      setNearbySource(getNearbyTransit(state.origin.lat, state.origin.lng));
    }
    if (state?.destination) {
      const dest = state.destination;
      setSelectedDestination(dest);
      setDestText(dest.name);
      setNearbyDest(getNearbyTransit(dest.lat, dest.lng));
    }
    // Store for after map is ready
    if (state?.origin && state?.destination) {
      pendingComputeRef.current = { origin: state.origin, dest: state.destination };
    }
  }, []);

  // When map is ready, place markers and auto-compute if we have both origin + destination from router state
  useEffect(() => {
    if (!mapReady) return;
    const pending = pendingComputeRef.current;
    if (pending) {
      pendingComputeRef.current = null;
      placeOriginMarker({ lat: pending.origin.lat, lng: pending.origin.lng });
      // Place dest marker
      destMarkerRef.current?.setMap(null);
      destMarkerRef.current = new google.maps.Marker({
        position: { lat: pending.dest.lat, lng: pending.dest.lng }, map: mapObjRef.current!,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" fill="none"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#EF4444"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`),
          scaledSize: new google.maps.Size(36, 48), anchor: new google.maps.Point(18, 48),
        },
        title: pending.dest.name, animation: google.maps.Animation.DROP,
      });
      // Fit bounds
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: pending.origin.lat, lng: pending.origin.lng });
      bounds.extend({ lat: pending.dest.lat, lng: pending.dest.lng });
      mapObjRef.current!.fitBounds(bounds, 80);
      // Auto-confirm and compute routes
      setDestinationConfirmed(true);
    } else {
      // If only origin was passed (no destination), place origin marker
      const state = routerLocation.state as { origin?: PlaceInfo } | null;
      if (state?.origin) {
        placeOriginMarker({ lat: state.origin.lat, lng: state.origin.lng });
      }
    }
  }, [mapReady]);

  // ─── Source Detection ───────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported'); return; }
    setIsDetecting(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ location: coords });
          const address = result.results[0]?.formatted_address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
          const name = result.results[0]?.address_components?.[1]?.long_name || result.results[0]?.address_components?.[0]?.long_name || 'My Location';
          const place: PlaceInfo = { name, lat: coords.lat, lng: coords.lng, address };
          setOrigin(place);
          setOriginText(name);
          setEditingSource(false);
          setNearbySource(getNearbyTransit(coords.lat, coords.lng));
          placeOriginMarker(coords);
        } catch {
          setOrigin({ name: 'Current Location', lat: coords.lat, lng: coords.lng, address: '' });
          setOriginText('Current Location');
          setEditingSource(false);
          placeOriginMarker(coords);
        }
        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        const msgs: Record<number, string> = {
          1: 'Location permission denied. Enter your starting point manually.',
          2: 'Location unavailable. Enter manually.',
          3: 'Location request timed out. Try again.',
        };
        setLocationError(msgs[err.code] || 'Could not detect location.');
        setEditingSource(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  // ─── Source Search (manual entry) ───────────────────────────
  const searchSourceLocation = useCallback(async (query: string) => {
    setOriginText(query);
    if (query.length < 2) { setSourceSuggestions([]); return; }
    setIsSearchingSource(true);
    try {
      await google.maps.importLibrary('places');
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'in' },
        locationBias: new google.maps.Circle({ center: MUMBAI_CENTER, radius: 50000 }),
        types: ['establishment', 'geocode'],
      }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const items: DestinationSuggestion[] = predictions.slice(0, 5).map(p => ({
            placeId: p.place_id,
            name: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text || '',
          }));
          // Resolve coords
          if (mapObjRef.current) {
            const svc = new google.maps.places.PlacesService(mapObjRef.current);
            Promise.all(items.map(item =>
              new Promise<DestinationSuggestion>((resolve) => {
                svc.getDetails({ placeId: item.placeId, fields: ['geometry', 'name', 'formatted_address'] }, (r, st) => {
                  if (st === google.maps.places.PlacesServiceStatus.OK && r) {
                    const lat = r.geometry?.location?.lat();
                    const lng = r.geometry?.location?.lng();
                    resolve({ ...item, lat: lat || undefined, lng: lng || undefined, name: r.name || item.name, secondaryText: r.formatted_address || item.secondaryText });
                  } else resolve(item);
                });
              })
            )).then(resolved => setSourceSuggestions(resolved));
          } else {
            setSourceSuggestions(items);
          }
        } else setSourceSuggestions([]);
        setIsSearchingSource(false);
      });
    } catch { setIsSearchingSource(false); }
  }, []);

  const selectSourceSuggestion = useCallback((s: DestinationSuggestion) => {
    if (!s.lat || !s.lng) return;
    const place: PlaceInfo = { name: s.name, lat: s.lat, lng: s.lng, address: s.secondaryText };
    setOrigin(place);
    setOriginText(s.name);
    setSourceSuggestions([]);
    setEditingSource(false);
    setNearbySource(getNearbyTransit(s.lat, s.lng));
    placeOriginMarker({ lat: s.lat, lng: s.lng });
  }, []);

  const placeOriginMarker = (coords: { lat: number; lng: number }) => {
    if (!mapObjRef.current) return;
    originMarkerRef.current?.setMap(null);
    originMarkerRef.current = new google.maps.Marker({
      position: coords, map: mapObjRef.current,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#6366F1', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
      title: 'Your Location',
    });
    mapObjRef.current.panTo(coords);
    mapObjRef.current.setZoom(14);
  };

  // ─── Destination Search (Multi-Match) ───────────────────────
  const searchDestination = useCallback(async (query: string) => {
    setDestText(query);
    setSelectedDestination(null);
    setDestinationConfirmed(false);
    setJourneyRoutes([]);

    if (query.length < 2) { setDestSuggestions([]); return; }
    setIsSearching(true);

    try {
      await google.maps.importLibrary('places');
      const service = new google.maps.places.AutocompleteService();
      if (!searchSessionRef.current) searchSessionRef.current = new google.maps.places.AutocompleteSessionToken();

      const req: google.maps.places.AutocompletionRequest = {
        input: query,
        sessionToken: searchSessionRef.current,
        componentRestrictions: { country: 'in' },
        locationBias: new google.maps.Circle({ center: MUMBAI_CENTER, radius: 50000 }),
        types: ['establishment', 'geocode'],
      };

      service.getPlacePredictions(req, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions: DestinationSuggestion[] = predictions.slice(0, 6).map(p => ({
            placeId: p.place_id,
            name: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text || '',
          }));
          setDestSuggestions(suggestions);
          // Show markers on map for each suggestion (resolve coords)
          resolveSuggestionCoords(suggestions);
        } else {
          setDestSuggestions([]);
        }
        setIsSearching(false);
      });
    } catch {
      setIsSearching(false);
    }
  }, []);

  // Resolve coordinates for suggestions and place markers
  const resolveSuggestionCoords = useCallback(async (suggestions: DestinationSuggestion[]) => {
    if (!mapObjRef.current) return;
    clearDestSuggestionMarkers();

    const placesService = new google.maps.places.PlacesService(mapObjRef.current);
    const resolved: DestinationSuggestion[] = [];

    for (const s of suggestions) {
      try {
        const details = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
          placesService.getDetails({ placeId: s.placeId, fields: ['geometry', 'name', 'formatted_address'] }, (r, st) => {
            if (st === google.maps.places.PlacesServiceStatus.OK && r) resolve(r);
            else reject(st);
          });
        });
        const lat = details.geometry?.location?.lat();
        const lng = details.geometry?.location?.lng();
        if (lat && lng) {
          const dist = origin ? haversineDistance(origin.lat, origin.lng, lat, lng) : undefined;
          resolved.push({ ...s, lat, lng, distance: dist, name: details.name || s.name, secondaryText: details.formatted_address || s.secondaryText });

          // Place marker on map
          const marker = new google.maps.Marker({
            position: { lat, lng }, map: mapObjRef.current!,
            label: { text: String(resolved.length), color: '#fff', fontSize: '11px', fontWeight: 'bold' },
            icon: {
              path: 'M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z',
              fillColor: '#EF4444', fillOpacity: 0.9, strokeColor: '#fff', strokeWeight: 2,
              scale: 1.3, anchor: new google.maps.Point(12, 32), labelOrigin: new google.maps.Point(12, 11),
            },
            title: details.name || s.name,
          });
          marker.addListener('click', () => {
            selectSuggestion({ ...s, lat, lng, distance: dist, name: details.name || s.name, secondaryText: details.formatted_address || s.secondaryText });
          });
          destSuggestionMarkersRef.current.push(marker);
        }
      } catch { /* skip failed lookups */ }
    }

    setDestSuggestions(resolved.length > 0 ? resolved : suggestions);

    // Fit map to show all markers
    if (resolved.length > 0 && mapObjRef.current) {
      const bounds = new google.maps.LatLngBounds();
      if (origin) bounds.extend({ lat: origin.lat, lng: origin.lng });
      resolved.forEach(s => { if (s.lat && s.lng) bounds.extend({ lat: s.lat!, lng: s.lng! }); });
      mapObjRef.current.fitBounds(bounds, 80);
    }
  }, [origin]);

  const clearDestSuggestionMarkers = () => {
    destSuggestionMarkersRef.current.forEach(m => m.setMap(null));
    destSuggestionMarkersRef.current = [];
  };

  // ─── Voice Search ─────────────────────────────────────────
  const startVoiceSearch = useCallback((target: 'origin' | 'destination') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported in your browser');
      return;
    }

    setVoiceTarget(target);
    setIsVoiceMode(true);
    setIsListening(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;

      if (target === 'origin') {
        setOriginText(currentTranscript);
      } else {
        setDestText(currentTranscript);
      }

      if (event.results[event.results.length - 1].isFinal) {
        const result = finalTranscript.trim();
        if (target === 'origin') {
          searchSourceLocation(result);
          setShowSourceDrop(true);
        } else {
          searchDestination(result);
          setShowSourceDrop(false);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'aborted') {
        return;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsVoiceMode(false);
    };

    recognition.start();
  }, [searchDestination, searchSourceLocation]);
  const selectSuggestion = useCallback((suggestion: DestinationSuggestion) => {
    if (!suggestion.lat || !suggestion.lng) return;
    const dest: PlaceInfo = { name: suggestion.name, lat: suggestion.lat, lng: suggestion.lng, address: suggestion.secondaryText };
    setSelectedDestination(dest);
    setDestText(suggestion.name);
    setDestSuggestions([]);

    // Highlight selected marker, clear others
    clearDestSuggestionMarkers();
    if (mapObjRef.current) {
      destMarkerRef.current?.setMap(null);
      destMarkerRef.current = new google.maps.Marker({
        position: { lat: dest.lat, lng: dest.lng }, map: mapObjRef.current,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" fill="none"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#EF4444"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`),
          scaledSize: new google.maps.Size(36, 48), anchor: new google.maps.Point(18, 48),
        },
        title: dest.name, animation: google.maps.Animation.DROP,
      });

      // Fit bounds
      if (origin) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: origin.lat, lng: origin.lng });
        bounds.extend({ lat: dest.lat, lng: dest.lng });
        mapObjRef.current.fitBounds(bounds, 80);
      } else {
        mapObjRef.current.panTo({ lat: dest.lat, lng: dest.lng });
        mapObjRef.current.setZoom(15);
      }
    }

    // Compute nearby transit for destination
    setNearbyDest(getNearbyTransit(dest.lat, dest.lng));
    searchSessionRef.current = null; // Reset session
  }, [origin]);

  // ─── Journey Route Computation (Smart Engine) ───────────────
  const computeJourneyRoutes = useCallback(async () => {
    if (!origin || !selectedDestination) return;
    setIsComputing(true);
    setJourneyRoutes([]);
    clearRouteRenderers();

    try {
      const routes = computeSmartRoutes(
        { lat: origin.lat, lng: origin.lng, name: origin.name },
        { lat: selectedDestination.lat, lng: selectedDestination.lng, name: selectedDestination.name },
      );

      setJourneyRoutes(routes);
      if (routes.length > 0) {
        setSelectedRouteId(routes[0].id);
        renderRouteOnMap(routes[0]);
      }
    } catch (err) {
      console.error('Route computation failed:', err);
    }
    setIsComputing(false);
  }, [origin, selectedDestination]);

  const confirmDestination = useCallback(() => {
    if (!selectedDestination) return;
    setDestinationConfirmed(true);
    computeJourneyRoutes();
  }, [selectedDestination, origin, computeJourneyRoutes]);

  // Auto-compute when destinationConfirmed is set from router state initialization
  useEffect(() => {
    if (destinationConfirmed && origin && selectedDestination && journeyRoutes.length === 0 && !isComputing) {
      computeJourneyRoutes();
    }
  }, [destinationConfirmed, origin, selectedDestination, journeyRoutes.length, isComputing, computeJourneyRoutes]);

  // ─── Map Rendering ──────────────────────────────────────────
  const clearRouteRenderers = () => {
    routeRenderersRef.current.forEach(r => r.setMap(null));
    routeRenderersRef.current = [];
  };

  const renderRouteOnMap = useCallback((route: JourneyRoute) => {
    clearRouteRenderers();
    if (!mapObjRef.current || !origin || !selectedDestination) return;

    // Render a polyline between origin and destination via Google Directions for the selected route
    try {
      const directionsService = new google.maps.DirectionsService();
      const travelMode = route.modesUsed.includes('cab') ? google.maps.TravelMode.DRIVING
        : route.modesUsed.includes('auto') && !route.modesUsed.includes('train') && !route.modesUsed.includes('metro')
          ? google.maps.TravelMode.DRIVING
          : google.maps.TravelMode.TRANSIT;

      directionsService.route({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: selectedDestination.lat, lng: selectedDestination.lng },
        travelMode,
        provideRouteAlternatives: false,
      }).then(result => {
        if (!result?.routes?.[0] || !mapObjRef.current) return;
        const colors: Record<string, string> = {
          time_saver: '#F59E0B',
          money_saver: '#10B981',
          comfortable: '#8B5CF6',
        };
        const renderer = new google.maps.DirectionsRenderer({
          map: mapObjRef.current, directions: result, routeIndex: 0,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: colors[route.type] || '#6366F1',
            strokeWeight: 5, strokeOpacity: 0.85,
          },
        });
        routeRenderersRef.current.push(renderer);
      }).catch(() => {});
    } catch {}
  }, [origin, selectedDestination]);

  const selectRoute = useCallback((route: JourneyRoute) => {
    setSelectedRouteId(route.id);
    renderRouteOnMap(route);
    
    // Auto-start navigation after 3 seconds
    setTimeout(() => {
      navigate('/live-tracking', { state: { route } });
    }, 3000);
  }, [renderRouteOnMap, navigate]);

  // ─── Save Trip ──────────────────────────────────────────────
  const handleSaveTrip = () => {
    if (!origin || !selectedDestination) return;
    const selected = journeyRoutes.find(r => r.id === selectedRouteId);
    saveTrip({
      originName: origin.name, originCoords: { lat: origin.lat, lng: origin.lng },
      destinationName: selectedDestination.name, destinationCoords: { lat: selectedDestination.lat, lng: selectedDestination.lng },
      selectedRoute: null, travelMode: selected?.steps[0]?.mode || 'transit',
    });
  };

  const openGoogleMaps = () => {
    if (!origin || !selectedDestination) return;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${selectedDestination.lat},${selectedDestination.lng}&travelmode=transit`, '_blank');
  };

  // ─── Reset ──────────────────────────────────────────────────
  const resetPlanner = () => {
    setSelectedDestination(null);
    setDestinationConfirmed(false);
    setDestText('');
    setDestSuggestions([]);
    setJourneyRoutes([]);
    setSelectedRouteId(null);
    setNearbyDest(null);
    clearDestSuggestionMarkers();
    clearRouteRenderers();
    destMarkerRef.current?.setMap(null);
    if (origin && mapObjRef.current) {
      mapObjRef.current.panTo({ lat: origin.lat, lng: origin.lng });
      mapObjRef.current.setZoom(14);
    }
  };

  // Computed
  const selectedJourney = journeyRoutes.find(r => r.id === selectedRouteId);
  const cabCostForTrip = selectedDestination && origin ? cabFareForDistance(haversineDistance(origin.lat, origin.lng, selectedDestination.lat, selectedDestination.lng)) : 0;

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)] bg-brand-background">
        {/* ─── Left Panel ─── */}
        <div className="w-full lg:w-[440px] xl:w-[480px] bg-white/95 backdrop-blur-3xl overflow-y-auto border-r border-white shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)] shrink-0 z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-cta px-6 py-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Route className="w-5 h-5" /> Journey Planner
              </h1>
              {destinationConfirmed && (
                <button onClick={resetPlanner} className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 transition-colors">
                  <X className="w-3.5 h-3.5" /> New Search
                </button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* ── Source Input ── */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Starting Point</label>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => { setIsVoiceMode(false); setVoiceTarget('origin'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${voiceTarget === 'origin' && !isVoiceMode ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Search className="w-4 h-4" /> Manual Search
                </button>
                <button
                  onClick={() => { setVoiceTarget('origin'); startVoiceSearch('origin'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${voiceTarget === 'origin' && isVoiceMode ? 'bg-brand-cta text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-pulse' : 'bg-current'}`} />
                  Voice Search
                </button>
              </div>

              {!editingSource && origin ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 cursor-pointer" onClick={() => setEditingSource(true)}>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{origin.name}</p>
                    <p className="text-xs text-gray-400 truncate">{origin.address}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); detectLocation(); }} className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors" title="Re-detect">
                    <Locate className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Manual location search */}
                  <div className="relative z-20">
                    <div className="flex items-center gap-2 bg-gray-50/80 backdrop-blur-md rounded-2xl px-4 py-3.5 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 focus-within:bg-white transition-all shadow-sm">
                      <div className="w-2.5 h-2.5 bg-brand-success rounded-full shrink-0 shadow-[0_0_10px_rgba(6,214,160,0.6)]" />
                      <input value={originText} onChange={(e) => { setOriginText(e.target.value); searchSourceLocation(e.target.value); setShowSourceDrop(true); }}
                        onFocus={() => setShowSourceDrop(true)}
                        placeholder="Type your location (area, station...)"
                        className="flex-1 bg-transparent outline-none text-[15px] font-bold text-gray-800 placeholder-gray-400" />
                      {originText && (
                        <button onClick={() => { setOriginText(''); setSourceSuggestions([]); }}
                          className="p-1 hover:bg-gray-200 rounded-full"><X className="w-3.5 h-3.5 text-gray-400" /></button>
                      )}
                      {isSearchingSource && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                    </div>

                    {/* Click outside overlay */}
                    {showSourceDrop && (
                      <div className="fixed inset-0 z-20" onClick={() => setShowSourceDrop(false)} />
                    )}

                    {/* Source autocomplete suggestions (Unified Dropdown) */}
                    <AnimatePresence>
                      {showSourceDrop && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-2xl z-30 overflow-hidden">
                          
                          {/* Static Options when empty */}
                          {!originText && (
                            <div className="py-1">
                              <button onClick={() => { detectLocation(); setShowSourceDrop(false); }}
                                disabled={isDetecting}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-brand-primary/5 transition-colors text-left group">
                                <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                                  {isDetecting ? <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" /> : <Locate className="w-3.5 h-3.5 text-brand-primary" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-brand-primary truncate">{isDetecting ? 'Detecting...' : 'Use current location'}</p>
                                </div>
                              </button>
                              
                              <div className="px-3 py-1.5 bg-gray-50/50 border-t border-b border-gray-100">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recent & Nearby</p>
                              </div>
                              <button onClick={() => { selectSourceSuggestion({ placeId: 'mock1', name: 'Home', secondaryText: 'Bandra West' }); setShowSourceDrop(false); }} className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-50">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">Home</p><p className="text-[10px] text-gray-400 truncate">Bandra West</p></div>
                              </button>
                              <button onClick={() => { selectSourceSuggestion({ placeId: 'mock2', name: 'Office', secondaryText: 'BKC' }); setShowSourceDrop(false); }} className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-50">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">Office</p><p className="text-[10px] text-gray-400 truncate">BKC</p></div>
                              </button>
                              <button onClick={() => { selectSourceSuggestion({ placeId: 'mock3', name: 'Bandra Station', secondaryText: 'Mumbai' }); setShowSourceDrop(false); }} className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">Bandra Station</p><p className="text-[10px] text-gray-400 truncate">Mumbai</p></div>
                              </button>
                            </div>
                          )}

                          {/* Dynamic Source Suggestions */}
                          {originText && sourceSuggestions.length > 0 && sourceSuggestions.map((s) => (
                            <button key={s.placeId} onClick={() => selectSourceSuggestion(s)}
                              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-emerald-50 transition-colors text-left border-t border-gray-50">
                              <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                                <p className="text-xs text-gray-400 truncate">{s.secondaryText}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* ── Destination Search ── */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Destination</label>
              
              {/* Search Mode Toggle */}
              {!destinationConfirmed && (
                <div className="flex gap-2 mb-2">
                  <button 
                    onClick={() => { setIsVoiceMode(false); setVoiceTarget('destination'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${voiceTarget === 'destination' && !isVoiceMode ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <Search className="w-4 h-4" /> Manual Search
                  </button>
                  <button 
                    onClick={() => { setVoiceTarget('destination'); startVoiceSearch('destination'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${voiceTarget === 'destination' && isVoiceMode ? 'bg-brand-cta text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-pulse' : 'bg-current'}`} />
                    Voice Search
                  </button>
                </div>
              )}
              
              {!destinationConfirmed ? (
                <div className="space-y-2">
                  <div className="relative z-10 flex items-center gap-2 bg-gray-50/80 backdrop-blur-md rounded-2xl px-4 py-3.5 border border-gray-200 focus-within:border-brand-cta focus-within:ring-4 focus-within:ring-brand-cta/10 focus-within:bg-white transition-all shadow-sm">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,0,110,0.6)] ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-cta'}`} />
                    <input value={destText} onChange={(e) => searchDestination(e.target.value)}
                      placeholder={isVoiceMode ? (isListening ? 'Listening... speak now' : 'Voice search ready') : "Search destination (e.g. Andheri Station...)"}
                      className="flex-1 bg-transparent outline-none text-[15px] font-bold text-gray-800 placeholder-gray-400" 
                      autoFocus />
                    {destText && (
                      <button onClick={() => { setDestText(''); setDestSuggestions([]); setSelectedDestination(null); clearDestSuggestionMarkers(); }} className="p-1 hover:bg-gray-200 rounded-full">
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                    {isListening && <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                    {isSearching && !isListening && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                  </div>

                  {/* Suggestions List */}
                  {destSuggestions.length > 0 && !selectedDestination && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-2xl overflow-hidden mt-2 relative z-20">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-2">Select your destination ({destSuggestions.length} matches)</p>
                      {destSuggestions.map((s, i) => (
                        <button key={s.placeId} onClick={() => selectSuggestion(s)}
                          className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left border-t border-gray-50">
                          <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-xs font-bold text-red-600 shrink-0 mt-0.5">{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                            <p className="text-xs text-gray-400 truncate">{s.secondaryText}</p>
                          </div>
                          {s.distance !== undefined && (
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg shrink-0 mt-0.5">
                              {formatDistance(s.distance)}
                            </span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Selected (not confirmed) */}
                  {selectedDestination && !destinationConfirmed && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800">{selectedDestination.name}</p>
                          <p className="text-xs text-gray-500 truncate">{selectedDestination.address}</p>
                          {origin && (
                            <p className="text-xs text-indigo-600 font-semibold mt-1">
                              📍 {formatDistance(haversineDistance(origin.lat, origin.lng, selectedDestination.lat, selectedDestination.lng))} from you
                            </p>
                          )}
                        </div>
                        <button onClick={() => { setSelectedDestination(null); setDestText(''); clearDestSuggestionMarkers(); }}
                          className="p-1 hover:bg-red-100 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
                      </div>
                      <button onClick={confirmDestination} disabled={!origin}
                        className="w-full flex items-center justify-center gap-2 bg-brand-cta text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:brightness-95 transition-all disabled:opacity-50 active:scale-[0.99] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none">
                        <Route className="w-4 h-4" /> Find Routes <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{selectedDestination?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{selectedDestination?.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Computing Spinner ── */}
            {isComputing && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-100 rounded-full" />
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Finding your 3 best routes...</span>
                <span className="text-[10px] text-gray-400">Analyzing bus, train, metro & cab options</span>
              </div>
            )}

            {/* ── Smart Journey Results ── */}
            {journeyRoutes.length > 0 && destinationConfirmed && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-gray-700">Your {journeyRoutes.length} Best Options</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={handleSaveTrip} className="text-xs text-brand-primary hover:text-brand-primary/80 font-semibold flex items-center gap-1 transition-colors">
                      <Bookmark className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={openGoogleMaps} className="text-xs text-gray-500 hover:text-gray-700 font-semibold flex items-center gap-1 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> Maps
                    </button>
                  </div>
                </div>

                {/* Route Cards */}
                <div className="space-y-3">
                  {journeyRoutes.map((route, rIdx) => {
                    const isSelected = route.id === selectedRouteId;
                    const typeConfig: Record<string, { gradient: string; badge: string; badgeText: string; icon: React.ReactNode; ringColor: string }> = {
                      time_saver: {
                        gradient: 'bg-brand-primary',
                        badge: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
                        badgeText: '⚡ Time Saver',
                        icon: <Zap className="w-4 h-4" />,
                        ringColor: 'ring-brand-primary/50 shadow-brand-primary/30 border-brand-primary/50',
                      },
                      money_saver: {
                        gradient: 'bg-gray-400',
                        badge: 'bg-gray-100 text-gray-700 border-gray-200',
                        badgeText: '💰 Money Saver',
                        icon: <TrendingDown className="w-4 h-4" />,
                        ringColor: 'ring-gray-300 border-gray-300',
                      },
                      comfortable: {
                        gradient: 'bg-brand-success',
                        badge: 'bg-brand-success/10 text-brand-success border-brand-success/20',
                        badgeText: '🛋️ Comfortable',
                        icon: <Armchair className="w-4 h-4" />,
                        ringColor: 'ring-brand-success/50 shadow-brand-success/30 border-brand-success/50',
                      },
                    };
                    const config = typeConfig[route.type] || typeConfig.time_saver;

                    return (
                      <motion.div key={route.id} layout
                        onClick={() => selectRoute(route)}
                        className={`rounded-[1.5rem] border overflow-hidden cursor-pointer transition-all duration-300 ${
                          isSelected ? `ring-2 ${config.ringColor} shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] bg-white scale-[1.02]` : 'border-gray-100 bg-white/60 hover:bg-white hover:border-gray-200 hover:shadow-lg'
                        }`}
                      >
                        {/* Route type indicator strip */}
                        <div className={`h-2 ${config.gradient}`} />

                        <div className="p-4">
                          {/* Route header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${config.badge}`}>
                                  {config.badgeText}
                                </span>
                                {rIdx === 0 && route.recommended && (
                                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Best Pick
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{route.tagline}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-xl font-extrabold text-gray-900">₹{route.totalFare}</p>
                              {route.fareBreakdown && (
                                <p className="text-[10px] text-gray-400 mt-0.5">{route.fareBreakdown}</p>
                              )}
                            </div>
                          </div>

                          {/* Mode icons strip */}
                          <div className="flex items-center gap-1.5 mb-3">
                            {route.steps.filter(s => s.mode !== 'walk').map((s, i, arr) => (
                              <React.Fragment key={i}>
                                <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1">
                                  <span className="text-sm">{s.icon}</span>
                                  <span className="text-[11px] font-semibold text-gray-700">
                                    {s.busNumber ? `Bus ${s.busNumber}` : s.lineName || s.mode}
                                  </span>
                                </span>
                                {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />}
                              </React.Fragment>
                            ))}
                          </div>

                          {/* Stats row */}
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                              <Clock className="w-3.5 h-3.5 text-gray-400" /> {route.totalTime} min
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{route.totalDistance} km</span>
                            {route.walkingDistance > 0.05 && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">🚶 {formatDistance(route.walkingDistance)}</span>
                              </>
                            )}
                            {route.transfers > 0 && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">🔄 {route.transfers} transfer{route.transfers > 1 ? 's' : ''}</span>
                              </>
                            )}
                          </div>

                          {/* ── Expanded Step-by-Step Journey ── */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden">
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Step-by-Step Journey</p>
                                  <div className="space-y-0">
                                    {route.steps.map((step, si) => (
                                      <div key={si} className="flex gap-3 relative">
                                        {/* Timeline dot + line */}
                                        <div className="flex flex-col items-center">
                                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border-2 shadow-sm"
                                            style={{ borderColor: step.lineColor || '#9CA3AF', backgroundColor: (step.lineColor || '#9CA3AF') + '12' }}>
                                            {step.icon}
                                          </div>
                                          {si < route.steps.length - 1 && (
                                            <div className="w-0.5 flex-1 min-h-[16px] rounded-full" style={{ backgroundColor: (step.lineColor || '#D1D5DB') + '50' }} />
                                          )}
                                        </div>
                                        {/* Step content */}
                                        <div className="flex-1 pb-3 min-w-0">
                                          <p className="text-xs font-bold text-gray-800">{step.instruction}</p>
                                          {step.from && step.to && (
                                            <p className="text-[11px] text-gray-400 mt-0.5">{step.from} → {step.to}</p>
                                          )}
                                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px]">
                                            <span className="text-gray-500 font-medium">{step.duration} min</span>
                                            {step.fare > 0 && <span className="text-emerald-600 font-semibold">₹{step.fare}</span>}
                                            {step.distance > 0 && <span className="text-gray-400">{step.distance} km</span>}
                                            {step.stops && step.stops > 0 && (
                                              <span className="text-gray-400">{step.stops} stops</span>
                                            )}
                                          </div>
                                          {/* Bus number badge */}
                                          {step.busNumber && (
                                            <div className="mt-1.5 inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
                                              <span className="text-[10px] font-bold text-amber-700">🚌 BEST Bus {step.busNumber}</span>
                                              {step.busRouteName && <span className="text-[10px] text-amber-500">· {step.busRouteName}</span>}
                                            </div>
                                          )}
                                          {/* Train frequency badge */}
                                          {step.frequency && (
                                            <div className="mt-1.5 inline-flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-0.5">
                                              <span className="text-[10px] font-bold text-blue-700">
                                                🚆 {step.lineName || 'Train'} · {step.frequency}
                                              </span>
                                              {step.nextETA && <span className="text-[10px] text-blue-500">· Next {step.nextETA}</span>}
                                            </div>
                                          )}
                                          {/* Extra details */}
                                          {step.details && !step.busNumber && !step.frequency && (
                                            <p className="text-[10px] text-gray-400 mt-0.5">{step.details}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex gap-2 mt-4">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/live-tracking', { state: { route } });
                                      }}
                                      className="flex-1 bg-brand-cta text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                      <Navigation className="w-4 h-4" />
                                      Start Navigation
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/live-tracking', { state: { route } });
                                      }}
                                      className="flex-1 bg-brand-success text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Book Now
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Nearby Transit panels */}
                <div className="mt-5 space-y-3">
                  {nearbySource && (
                    <NearbyTransitPanel title="Near Source" summary={nearbySource} />
                  )}
                  {nearbyDest && (
                    <NearbyTransitPanel title="Near Destination" summary={nearbyDest} />
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ─── Map ─── */}
        <div className="flex-1 relative min-h-[300px] lg:min-h-0">
          <div ref={mapRef} className="absolute inset-0" />
          {!mapReady && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ─── Nearby Transit Panel (sub-component) ─────────────────────
function NearbyTransitPanel({ title, summary }: { title: string; summary: NearbyTransitSummary }) {
  const [open, setOpen] = useState(false);
  const total = summary.busStops.length + summary.trainStations.length + summary.metroStations.length;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3.5 py-2.5 text-left">
        <span className="text-xs font-bold text-gray-600">{title} — {total} transit options</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3.5 pb-3 space-y-2">
              {summary.busStops.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">🚌 Bus Stops</p>
                  {summary.busStops.slice(0, 4).map(({ item: s, distance }) => (
                    <div key={s.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-600 truncate flex-1">{s.name}</span>
                      <span className="text-[10px] font-bold text-amber-600 ml-2">{formatDistance(distance)}</span>
                    </div>
                  ))}
                </div>
              )}
              {summary.trainStations.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">🚆 Train Stations</p>
                  {summary.trainStations.slice(0, 3).map(({ item: s, distance }) => (
                    <div key={s.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-600">{s.name} <span className="text-gray-400">({s.line})</span></span>
                      <span className="text-[10px] font-bold text-red-600 ml-2">{formatDistance(distance)}</span>
                    </div>
                  ))}
                </div>
              )}
              {summary.metroStations.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">🚇 Metro Stations</p>
                  {summary.metroStations.slice(0, 3).map(({ item: s, distance }) => (
                    <div key={s.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-600">{s.name}</span>
                      <span className="text-[10px] font-bold text-emerald-600 ml-2">{formatDistance(distance)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
