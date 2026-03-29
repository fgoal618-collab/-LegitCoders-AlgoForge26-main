// HomePage — Premium TransitTwin Landing Page
// Stunning, commuter-focused design with animations and rich visuals
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Locate, Search, MapPin, ArrowRight, Sparkles, Navigation, Layers,
  Clock, X, Route, ChevronRight, Bookmark, TrendingDown,
  Bus, TrainFront, Train, Car, Zap, Shield, Globe, Users,
  ArrowUpRight, Timer, IndianRupee, Footprints, Star, BadgeCheck,
  Compass, Map as MapIcon, BarChart3, Wifi, Activity,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { findNearestStation, getNearbyTransit, findTransitRoutes } from '../services/transitService';
import { haversineDistance, formatDistance } from '../utils/geo';
import { estimateFare, cabFareForDistance } from '../utils/fare';
import { allStations } from '../data/stations';
import type { NearbyTransitSummary } from '../types/transit';
import { motion, AnimatePresence } from 'motion/react';

interface PlaceInfo { name: string; lat: number; lng: number; address: string; }
interface DestSuggestion { placeId: string; name: string; secondary: string; lat?: number; lng?: number; distance?: number; }

const MUMBAI_CENTER = { lat: 19.0760, lng: 72.8777 };

// ─── Animated counter hook ────────────────────────────────────
function useCounter(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const isDecimal = target % 1 !== 0;
  const internalTarget = isDecimal ? Math.round(target * 10) : target;
  useEffect(() => {
    let start = 0;
    const increment = internalTarget / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= internalTarget) { setCount(internalTarget); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [internalTarget, duration]);
  return isDecimal ? count / 10 : count;
}

// ─── Stats Data ───────────────────────────────────────────────
const PLATFORM_STATS = [
  { label: 'Stations Covered', value: 53, suffix: '+', icon: MapPin, color: '#1e3a5f' },
  { label: 'Bus Routes', value: 450, suffix: '+', icon: Bus, color: '#b8954f' },
  { label: 'Daily Commuters', value: 7.5, suffix: 'M+', icon: Users, color: '#4a7c59' },
  { label: 'Active Lines', value: 3, suffix: '', icon: Activity, color: '#8b4513' },
];

// ─── Transit Lines ────────────────────────────────────────────
const TRANSIT_LINES = [
  { name: 'Central Line', color: '#E53935', stations: 17, from: 'CSMT', to: 'Kasara', icon: '🚆' },
  { name: 'Western Line', color: '#1E88E5', stations: 21, from: 'Churchgate', to: 'Virar', icon: '🚆' },
  { name: 'Metro Line 1', color: '#43A047', stations: 12, from: 'Versova', to: 'Ghatkopar', icon: '🚇' },
];

// ─── Features ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Route, title: 'Smart Route Planning',
    desc: 'AI-powered multi-modal routes combining bus, train, metro, auto & cab for optimal journeys.',
    gradient: 'from-[#1e3a5f] to-[#2d4a6f]', bg: 'bg-[#f5f0e8]',
  },
  {
    icon: IndianRupee, title: 'Live Fare Comparison',
    desc: 'Compare fares across all transit modes instantly. Find the cheapest way to travel.',
    gradient: 'from-[#4a7c59] to-[#5a8c69]', bg: 'bg-[#e8f5e9]',
  },
  {
    icon: Timer, title: 'Real-Time Intelligence',
    desc: 'Train frequencies, ETAs, and stop-by-stop journey breakdown with walking distances.',
    gradient: 'from-[#b8954f] to-[#c9a962]', bg: 'bg-[#faf5e6]',
  },
  {
    icon: Shield, title: 'Comfort Score',
    desc: 'Every route rated for comfort — walking distance, transfers, AC availability, and more.',
    gradient: 'from-[#8b4513] to-[#a0522d]', bg: 'bg-[#f5ebe0]',
  },
];

// ─── How It Works ─────────────────────────────────────────────
const STEPS = [
  { step: '01', title: 'Set Your Location', desc: 'Auto-detect or search your starting point anywhere in Mumbai.', icon: Locate, color: '#1e3a5f' },
  { step: '02', title: 'Choose Destination', desc: 'Search any station, landmark, or area — see all matches on the map.', icon: MapPin, color: '#b8954f' },
  { step: '03', title: 'Get 3 Best Routes', desc: 'Instantly receive Time Saver, Money Saver, and Comfortable options.', icon: Sparkles, color: '#4a7c59' },
  { step: '04', title: 'Start Your Journey', desc: 'Step-by-step navigation with live fare breakdown and ETAs.', icon: Navigation, color: '#8b4513' },
];


export function HomePage() {
  const navigate = useNavigate();

  // Source
  const [origin, setOrigin] = useState<PlaceInfo | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [editingSource, setEditingSource] = useState(true);
  const [sourceText, setSourceText] = useState('');
  const [sourceSuggestions, setSourceSuggestions] = useState<DestSuggestion[]>([]);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [showSourceDrop, setShowSourceDrop] = useState(false);

  // Destination
  const [destText, setDestText] = useState('');
  const [suggestions, setSuggestions] = useState<DestSuggestion[]>([]);
  const suggestionsRef = useRef<DestSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDest, setSelectedDest] = useState<PlaceInfo | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<'origin' | 'destination'>('destination');

  // Preview
  const [nearbyTransit, setNearbyTransit] = useState<NearbyTransitSummary | null>(null);

  // ─── Location Detection ─────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported'); setEditingSource(true); return; }
    setIsDetecting(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ location: coords });
          const name = result.results[0]?.address_components?.[1]?.long_name || result.results[0]?.address_components?.[0]?.long_name || 'My Location';
          const address = result.results[0]?.formatted_address || '';
          setOrigin({ name, lat: coords.lat, lng: coords.lng, address });
          setNearbyTransit(getNearbyTransit(coords.lat, coords.lng));
        } catch {
          setOrigin({ name: 'Current Location', lat: coords.lat, lng: coords.lng, address: '' });
        }
        setIsDetecting(false);
        setEditingSource(false);
      },
      () => { setIsDetecting(false); setLocationError('Location unavailable — enter manually below.'); setEditingSource(true); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  // ─── Source Search ──────────────────────────────────────────
  const searchSource = useCallback(async (query: string) => {
    setSourceText(query);
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
          const items: DestSuggestion[] = predictions.slice(0, 5).map(p => ({
            placeId: p.place_id,
            name: p.structured_formatting.main_text,
            secondary: p.structured_formatting.secondary_text || '',
          }));
          const div = document.createElement('div');
          const svc = new google.maps.places.PlacesService(div);
          Promise.all(items.map(item =>
            new Promise<DestSuggestion>((resolve) => {
              svc.getDetails({ placeId: item.placeId, fields: ['geometry', 'name', 'formatted_address'] }, (r, st) => {
                if (st === google.maps.places.PlacesServiceStatus.OK && r) {
                  const lat = r.geometry?.location?.lat();
                  const lng = r.geometry?.location?.lng();
                  resolve({ ...item, lat: lat || undefined, lng: lng || undefined, name: r.name || item.name, secondary: r.formatted_address || item.secondary });
                } else resolve(item);
              });
            })
          )).then(resolved => setSourceSuggestions(resolved));
        } else setSourceSuggestions([]);
        setIsSearchingSource(false);
      });
    } catch { setIsSearchingSource(false); }
  }, []);

  const selectSource = useCallback((s: DestSuggestion) => {
    if (!s.lat || !s.lng) return;
    setOrigin({ name: s.name, lat: s.lat, lng: s.lng, address: s.secondary });
    setSourceText(s.name);
    setSourceSuggestions([]);
    setEditingSource(false);
    setNearbyTransit(getNearbyTransit(s.lat, s.lng));
  }, []);

  // ─── Destination Search ─────────────────────────────────────
  const searchDest = useCallback(async (query: string) => {
    setDestText(query);
    setSelectedDest(null);
    if (query.length < 2) { setSuggestions([]); return; }
    setIsSearching(true);
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
          const items: DestSuggestion[] = predictions.slice(0, 5).map(p => ({
            placeId: p.place_id,
            name: p.structured_formatting.main_text,
            secondary: p.structured_formatting.secondary_text || '',
          }));
          setSuggestions(items);
          resolveCoords(items);
        } else {
          setSuggestionsWithRef([]);
        }
        setIsSearching(false);
      });
    } catch { setIsSearching(false); }
  }, [origin]);

  const setSuggestionsWithRef = useCallback((newSuggestions: DestSuggestion[]) => {
    suggestionsRef.current = newSuggestions;
    setSuggestions(newSuggestions);
  }, []);

  const resolveCoords = useCallback(async (items: DestSuggestion[]) => {
    const div = document.createElement('div');
    const svc = new google.maps.places.PlacesService(div);
    const resolved: DestSuggestion[] = [];
    for (const item of items) {
      try {
        const details = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
          svc.getDetails({ placeId: item.placeId, fields: ['geometry', 'name', 'formatted_address'] }, (r, st) => {
            if (st === google.maps.places.PlacesServiceStatus.OK && r) resolve(r);
            else reject(st);
          });
        });
        const lat = details.geometry?.location?.lat();
        const lng = details.geometry?.location?.lng();
        if (lat && lng) {
          const dist = origin ? haversineDistance(origin.lat, origin.lng, lat, lng) : undefined;
          resolved.push({ ...item, lat, lng, distance: dist, name: details.name || item.name, secondary: details.formatted_address || item.secondary });
        } else resolved.push(item);
      } catch { resolved.push(item); }
    }
    setSuggestionsWithRef(resolved);
  }, [origin, setSuggestionsWithRef]);

  const selectDestination = useCallback((s: DestSuggestion) => {
    if (!s.lat || !s.lng) return;
    setSelectedDest({ name: s.name, lat: s.lat, lng: s.lng, address: s.secondary });
    setDestText(s.name);
    setSuggestions([]);
  }, []);

  // ─── Voice Search ─────────────────────────────────────────
  const startVoiceSearch = useCallback((target: 'origin' | 'destination' = 'destination') => {
    // Check for HTTPS or localhost
    const isSecureContext = window.isSecureContext;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext && !isLocalhost) {
      alert('Voice search requires HTTPS. Please use a secure connection or localhost.');
      return;
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported in your browser. Please use Chrome, Edge, or Safari.');
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
    
    recognition.onstart = () => {
      console.log('Voice recognition started - listening...');
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      // Combine all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update UI with interim or final transcript
      const currentTranscript = finalTranscript || interimTranscript;
      
      if (target === 'origin') {
        setSourceText(currentTranscript);
      } else {
        setDestText(currentTranscript);
      }
      
      // Only process when we have a final result
      if (event.results[event.results.length - 1].isFinal) {
        const result = finalTranscript.trim();
        
        if (target === 'origin') {
          // Trigger search and let the normal flow handle suggestions
          searchSource(result);
        } else {
          searchDest(result);
        }
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      
      // Silently handle aborted errors (user caused or system interrupt)
      if (event.error === 'aborted') {
        console.log('Voice recognition was interrupted');
        return;
      }
      
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permission in browser settings.');
      } else if (event.error === 'no-speech') {
        alert('No speech detected. Please try again and speak clearly.');
      } else if (event.error === 'network') {
        alert('Network error. Please check your internet connection and try again.');
      } else if (event.error !== 'aborted') {
        console.log('Voice error:', event.error);
      }
    };
    
    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      setIsVoiceMode(false);
    };
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
      setIsVoiceMode(false);
    }
  }, [searchDest, searchSource]);

  // Navigate to Planner
  const goToPlanner = () => {
    if (!origin) {
      alert('Please set your starting point first');
      return;
    }
    navigate('/planner', {
      state: { origin: origin || undefined, destination: selectedDest || undefined },
    });
  };

  const totalNearby = nearbyTransit
    ? nearbyTransit.busStops.length + nearbyTransit.trainStations.length + nearbyTransit.metroStations.length
    : 0;

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <Layout>
      {/* ══════════════════════════════════════════════════════════
          SECTION 1: HERO + JOURNEY PLANNER
          ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden animate-on-scroll">
        {/* Background decorative elements - removed for full-page dark bg */}

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Hero Text */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-center mb-10">
            
            {/* Pill badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-brand-primary/8 border border-brand-primary/15 rounded-full px-5 py-2 mb-6">
              <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-brand-primary uppercase tracking-widest">Mumbai's Smartest Transit Planner</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1a1a1a] leading-[1.1] mb-5 tracking-tight">
              TransitWin -<br />
              <span className="text-[#1e3a5f]">
                Your Smart Travel Assistant
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#6b6560] max-w-2xl mx-auto leading-relaxed font-medium">
              Compare routes across bus, train, metro, auto & cab in seconds.
              Find the <strong className="text-[#1a1a1a]">fastest</strong>, <strong className="text-[#1a1a1a]">cheapest</strong>, or
              most <strong className="text-[#1a1a1a]">comfortable</strong> way to travel.
            </p>
          </motion.div>

          {/* Journey Planner Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(30,58,95,0.12)] border border-[#e8e4de] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
              {/* Accent line */}
              <div className="absolute top-0 left-8 right-8 h-1 bg-[#1e3a5f] rounded-b-full" />

              {/* Source */}
              <div className="mb-4">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">Where are you now?</label>

                {/* Voice/Manual toggle for source */}
                {editingSource && (
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => { setIsVoiceMode(false); setVoiceTarget('origin'); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${voiceTarget === 'origin' && !isVoiceMode ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <Search className="w-4 h-4" /> Manual
                    </button>
                    <button
                      onClick={() => { setVoiceTarget('origin'); startVoiceSearch('origin'); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${voiceTarget === 'origin' && isVoiceMode ? 'bg-brand-cta text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-white animate-pulse' : 'bg-current'}`} />
                      Voice
                    </button>
                  </div>
                )}

                {!editingSource && origin ? (
                  <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl px-5 py-3.5 cursor-pointer hover:bg-emerald-50 transition-colors"
                    onClick={() => setEditingSource(true)}>
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-gray-900 leading-tight truncate">{origin.name}</p>
                      {origin.address && <p className="text-xs font-medium text-gray-400 truncate mt-0.5">{origin.address}</p>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); detectLocation(); }}
                      className="p-1.5 hover:bg-emerald-100/80 rounded-full transition-colors" title="Re-detect location">
                      <Locate className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="flex items-center gap-3 bg-gray-50/50 rounded-2xl px-5 py-3.5 border border-gray-200 focus-within:border-emerald-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(6,214,160,0.1)] transition-all">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shrink-0" />
                        <input value={sourceText} onChange={(e) => { setSourceText(e.target.value); searchSource(e.target.value); setShowSourceDrop(true); }}
                          onFocus={() => setShowSourceDrop(true)}
                          placeholder="Search starting point..."
                          className="flex-1 bg-transparent outline-none text-[15px] font-semibold text-gray-900 placeholder-gray-400" />
                        {sourceText && (
                          <button onClick={() => { setSourceText(''); setSourceSuggestions([]); }}
                            className="p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>
                        )}
                        {isSearchingSource && <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin shrink-0" />}
                      </div>

                      {showSourceDrop && (
                        <div className="fixed inset-0 z-20" onClick={() => setShowSourceDrop(false)} />
                      )}

                      <AnimatePresence>
                        {showSourceDrop && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                            className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-xl z-30 overflow-hidden">
                            {!sourceText && (
                              <div className="py-2">
                                <button onClick={() => { detectLocation(); setShowSourceDrop(false); }}
                                  disabled={isDetecting}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-primary/5 transition-colors text-left group">
                                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                                    {isDetecting ? <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" /> : <Locate className="w-4 h-4 text-brand-primary" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-brand-primary truncate">{isDetecting ? 'Detecting location...' : 'Use current location'}</p>
                                  </div>
                                </button>

                                <div className="px-4 py-2 bg-gray-50/50 border-t border-b border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Popular Locations</p>
                                </div>
                                {[
                                  { id: 'mock1', name: 'Bandra Station', area: 'Mumbai, Maharashtra' },
                                  { id: 'mock2', name: 'BKC', area: 'Bandra Kurla Complex, Mumbai' },
                                  { id: 'mock3', name: 'Andheri Station', area: 'Mumbai, Maharashtra' },
                                ].map(loc => (
                                  <button key={loc.id} onClick={() => { selectSource({ placeId: loc.id, name: loc.name, secondary: loc.area }); setShowSourceDrop(false); }}
                                    className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{loc.name}</p><p className="text-xs text-gray-400 truncate">{loc.area}</p></div>
                                  </button>
                                ))}
                              </div>
                            )}
                            {sourceText && sourceSuggestions.length > 0 && sourceSuggestions.map((s) => (
                              <button key={s.placeId} onClick={() => selectSource(s)}
                                className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-emerald-50/70 transition-colors text-left border-t border-gray-50">
                                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                                  <p className="text-xs text-gray-400 truncate">{s.secondary}</p>
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

              {/* Destination */}
              <div className="mb-6">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">Where do you want to go?</label>
                
                {/* Search Mode Toggle */}
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
                
                <div className="relative">
                  <div className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 border-2 transition-all ${isVoiceMode ? 'bg-white border-brand-cta shadow-[0_0_0_3px_rgba(255,0,110,0.1)]' : 'bg-white border-brand-primary/30 focus-within:border-brand-primary focus-within:shadow-[0_0_0_3px_rgba(58,134,255,0.1)]'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-cta'}`} />
                    <input value={destText} onChange={(e) => searchDest(e.target.value)}
                      placeholder={isVoiceMode ? (isListening ? 'Listening... speak now' : 'Voice search ready - click to speak') : "Search destination (station, area, landmark...)"}
                      className="flex-1 bg-transparent outline-none text-[15px] font-semibold text-gray-900 placeholder-gray-400" />
                    {destText && (
                      <button onClick={() => { setDestText(''); setSuggestions([]); setSelectedDest(null); }}
                        className="p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>
                    )}
                    {isListening && <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                    {isSearching && !isListening && <div className="w-4 h-4 border-2 border-brand-cta border-t-transparent rounded-full animate-spin shrink-0" />}
                  </div>

                  <AnimatePresence>
                    {suggestions.length > 0 && !selectedDest && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-xl z-30 overflow-hidden">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-1">
                          {suggestions.length} destinations found
                        </p>
                        {suggestions.map((s, i) => (
                          <button key={s.placeId} onClick={() => selectDestination(s)}
                            className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-indigo-50/70 transition-colors text-left border-t border-gray-50">
                            <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-xs font-bold text-red-600 shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                              <p className="text-xs text-gray-400 truncate">{s.secondary}</p>
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
                  </AnimatePresence>
                </div>
              </div>

              {/* Selected destination preview */}
              <AnimatePresence>
                {selectedDest && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-gradient-to-r from-brand-cta/5 to-brand-primary/5 border border-brand-cta/15 rounded-2xl px-5 py-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800">{selectedDest.name}</p>
                        <p className="text-xs text-gray-500 truncate">{selectedDest.address}</p>
                        {origin && (
                          <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {formatDistance(haversineDistance(origin.lat, origin.lng, selectedDest.lat, selectedDest.lng))} away
                          </p>
                        )}
                      </div>
                      <button onClick={() => { setSelectedDest(null); setDestText(''); }}
                        className="p-1 hover:bg-red-100 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Button */}
              <button onClick={goToPlanner}
                disabled={!origin}
                className="w-full flex items-center justify-center gap-2.5 bg-[#b8954f] text-white py-4 rounded-2xl font-extrabold text-[15px] shadow-lg hover:shadow-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:bg-[#e8e4de] disabled:text-[#6b6560] disabled:cursor-not-allowed disabled:shadow-none hover:disabled:brightness-100">
                <Route className="w-5 h-5" />
                {selectedDest ? 'Find Best Routes' : 'Plan a Trip'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4">
                {[
                  { icon: Zap, label: '3 Routes Instantly' },
                  { icon: Shield, label: 'Real Mumbai Data' },
                  { icon: IndianRupee, label: 'Free to Use' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <b.icon className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2: PLATFORM STATS (Animated Counters)
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 relative animate-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {PLATFORM_STATS.map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-default">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: stat.color + '12' }}>
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  <AnimatedNumber value={stat.value} />{stat.suffix}
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3: ROUTE COMPARISON SHOWCASE
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 animate-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#f5f0e8] border border-[#e8e4de] rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#b8954f]" />
              <span className="text-[11px] font-bold text-[#1e3a5f] uppercase tracking-widest">Smart Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight mb-3">
              3 Routes. 1 Decision.
            </h2>
            <p className="text-base text-[#6b6560] max-w-xl mx-auto">
              Every search gives you three optimized options — pick what matters most to you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                type: 'Time Saver', icon: '⚡', emoji: Zap, time: '28 min', fare: '₹45',
                desc: 'Fastest route combining auto + train for minimum travel time.',
                color: '#1e3a5f', bg: 'bg-[#1e3a5f]',
                tags: ['Auto → Train', '1 transfer'], badge: 'Fastest',
              },
              {
                type: 'Money Saver', icon: '💰', emoji: IndianRupee, time: '42 min', fare: '₹12',
                desc: 'BEST Bus direct route — cheapest way to reach your destination.',
                color: '#4a7c59', bg: 'bg-[#4a7c59]',
                tags: ['BEST Bus 86', 'Direct'], badge: 'Cheapest',
              },
              {
                type: 'Comfortable', icon: '🛋️', emoji: Shield, time: '35 min', fare: '₹30',
                desc: 'Metro + walk with AC coaches, fewer transfers, minimal walking.',
                color: '#b8954f', bg: 'bg-[#b8954f]',
                tags: ['Metro Line 1', 'AC Coaches'], badge: 'Most Comfortable',
              },
            ].map((route, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl border border-[#e8e4de] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer"
                onClick={() => navigate('/planner')}>
                <div className={`h-1.5 ${route.bg}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-2xl">{route.icon}</span>
                      <h3 className="text-lg font-black text-gray-900 mt-1">{route.type}</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                      style={{ color: route.color, borderColor: route.color + '30', backgroundColor: route.color + '08' }}>
                      {route.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{route.desc}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-black text-gray-900">{route.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-black text-gray-900">{route.fare}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {route.tags.map((tag, ti) => (
                      <span key={ti} className="text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4: FEATURES GRID
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 animate-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight mb-3">
              Everything You Need
            </h2>
            <p className="text-base text-[#6b6560] max-w-xl mx-auto">
              Built specifically for Mumbai commuters — real data, real routes, real savings.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className={`w-14 h-14 ${feat.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <div className={`w-8 h-8 bg-gradient-to-br ${feat.gradient} rounded-xl flex items-center justify-center`}>
                    <feat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5: HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 animate-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight mb-3">
              How It Works
            </h2>
            <p className="text-base text-[#6b6560] max-w-xl mx-auto">
              Get from anywhere to anywhere in Mumbai in just 4 simple steps.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group">
                {/* Step number */}
                <span className="text-5xl font-black text-gray-100 absolute top-4 right-5 select-none group-hover:text-gray-200 transition-colors">
                  {step.step}
                </span>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: step.color + '12' }}>
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-2 relative z-10">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION: GRID BLUR DIVIDE ON SCROLL
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 animate-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight mb-3">
              Grid That <span className="text-[#1e3a5f]">Divides & Blends</span>
            </h2>
            <p className="text-base text-[#6b6560] max-w-xl mx-auto">
              Watch these cards separate and blur into the background as you scroll past.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Fast', desc: 'Quick routes', color: 'bg-[#1e3a5f]', delay: 0 },
              { title: 'Cheap', desc: 'Save money', color: 'bg-[#4a7c59]', delay: 0.1 },
              { title: 'Safe', desc: 'Secure travel', color: 'bg-[#8b4513]', delay: 0.2 },
              { title: 'Smart', desc: 'AI powered', color: 'bg-[#b8954f]', delay: 0.3 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: 50,
                  filter: 'blur(8px)',
                  scale: 0.9
                }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  filter: 'blur(0px)',
                  scale: 1
                }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  delay: item.delay,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative"
              >
                {/* Background blur layer that blends */}
                <div className="absolute inset-0 bg-white/40 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 scale-110" />
                
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg overflow-hidden h-full">
                  {/* Solid top bar */}
                  <div className={`h-1.5 ${item.color}`} />
                  
                  <div className="p-6">
                    {/* Icon circle */}
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white font-black text-lg">{item.title[0]}</span>
                    </div>
                    
                    <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                    
                    {/* Blur effect on scroll exit */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0"
                      whileInView={{ opacity: 0 }}
                      initial={{ opacity: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider line that appears on scroll */}
          <motion.div 
            className="mt-16 flex items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Scroll Divide</span>
            <motion.div 
              className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6: TRANSIT NETWORK OVERVIEW
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 animate-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight mb-3">
              Mumbai's Transit Network
            </h2>
            <p className="text-base text-[#6b6560] max-w-xl mx-auto">
              Complete coverage of suburban railways, metro, and BEST bus networks.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {TRANSIT_LINES.map((line, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                onClick={() => navigate('/explore')}>
                <div className="h-2 w-full" style={{ backgroundColor: line.color }} />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{line.icon}</span>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{line.name}</h3>
                      <p className="text-xs text-gray-400 font-bold">{line.stations} stations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-bold text-gray-700">{line.from}</span>
                    <div className="flex-1 h-px bg-gray-200 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: line.color }} />
                    </div>
                    <span className="font-bold text-gray-700">{line.to}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-[#6b6560] group-hover:text-[#1e3a5f] transition-colors">
                    <span>View all stations</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 7: CTA CARDS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 animate-on-scroll">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              onClick={() => navigate('/explore')}
              className="bg-[#1e3a5f] rounded-2xl p-8 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group overflow-hidden relative">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#c9a962]/20 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Compass className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-black text-white text-xl mb-2">Explore Transit Network</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-4">Browse all train lines, metro stations, and 450+ BEST bus routes across Mumbai.</p>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#c9a962] group-hover:text-white transition-colors">
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              onClick={() => navigate('/trips')}
              className="bg-[#4a7c59] rounded-2xl p-8 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#b8954f]/20 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Bookmark className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-black text-white text-xl mb-2">Your Saved Trips</h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4">Access past routes, re-plan journeys, and track your transit history instantly.</p>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#b8954f] group-hover:text-white transition-colors">
                  <span>View Trips</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 8: FINAL CTA BANNER
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 animate-on-scroll">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-[#1e3a5f] rounded-3xl p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Ready to Navigate Mumbai?
              </h2>
              <p className="text-base sm:text-lg text-white/80 mb-8 max-w-lg mx-auto">
                Plan your journey in seconds and save up to ₹500 per week by choosing smarter routes.
              </p>
              <button onClick={() => navigate('/planner')}
                className="inline-flex items-center gap-3 bg-white text-[#1e3a5f] font-black text-base px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-[0.98] transition-all">
                <Route className="w-5 h-5" />
                Start Planning
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}


// ─── Animated Number Component ────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const count = useCounter(value);
  const isDecimal = value % 1 !== 0;
  return <>{isDecimal ? count.toFixed(1) : count}</>;
}
