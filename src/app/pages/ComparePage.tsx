// Route Comparison Page — compare multi-modal transit options
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, MapPin, TrendingDown, ExternalLink, Clock, IndianRupee, Route, Navigation, Sparkles, X, CreditCard, Wallet, Banknote, QrCode, Check } from 'lucide-react';
import { Layout } from '../components/Layout';
import { RouteCard } from '../components/transit/RouteCard';
import { JourneyLegTimeline } from '../components/transit/JourneyLegTimeline';
import { findTransitRoutes, getAllLocations } from '../services/transitService';
import { saveTrip } from '../services/tripStorage';
import type { TransitRoute, RouteResult } from '../types/transit';
import { motion, AnimatePresence } from 'motion/react';

export function ComparePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fromId, setFromId] = useState(searchParams.get('from') || '');
  const [toId, setToId] = useState(searchParams.get('to') || '');
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDrop, setShowFromDrop] = useState(false);
  const [showToDrop, setShowToDrop] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);

  const locations = getAllLocations();

  useEffect(() => {
    if (fromId && toId) {
      const r = findTransitRoutes(fromId, toId);
      setResult(r);
      // Set search text from result
      const fromLoc = locations.find(l => l.id === fromId);
      const toLoc = locations.find(l => l.id === toId);
      if (fromLoc) setFromSearch(fromLoc.name);
      if (toLoc) setToSearch(toLoc.name);
    }
  }, [fromId, toId]);

  const handleSearch = () => {
    if (!fromId || !toId) return;
    const r = findTransitRoutes(fromId, toId);
    setResult(r);
  };

  const handleSelectRoute = (route: TransitRoute) => {
    console.log('Selecting route:', route);
    setSelectedRoute(route);
    // Save trip
    if (result) {
      const tripData = {
        originName: result.from,
        originCoords: route.fromCoords,
        destinationName: result.to,
        destinationCoords: route.toCoords,
        selectedRoute: route,
        travelMode: route.legs[0]?.mode || 'train',
      };
      console.log('Saving trip:', tripData);
      saveTrip(tripData);
    }
  };

  const openInGoogleMaps = () => {
    if (!selectedRoute) return;
    const { fromCoords, toCoords } = selectedRoute;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${fromCoords.lat},${fromCoords.lng}&destination=${toCoords.lat},${toCoords.lng}&travelmode=transit`, '_blank');
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'wallet'>('cash');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handleStartNavigation = (route: TransitRoute) => {
    console.log('Starting navigation for route:', route);
    // Show payment modal instead of directly navigating
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save trip with payment method
    if (result && selectedRoute) {
      saveTrip({
        originName: result.from,
        originCoords: selectedRoute.fromCoords,
        destinationName: result.to,
        destinationCoords: selectedRoute.toCoords,
        selectedRoute: selectedRoute,
        travelMode: selectedRoute.legs[0]?.mode || 'train',
      });
    }
    
    setPaymentProcessing(false);
    setShowPaymentModal(false);
    
    // Navigate to live tracking after payment
    navigate('/live-tracking');
  };

  const filtered = (search: string) =>
    locations.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10);

  const maxSavings = result?.routes.reduce((max, r) => Math.max(max, r.savings), 0) ?? 0;

  return (
    <Layout>
      <div className="min-h-screen bg-[#faf9f7]">
        {/* Header Section - Cream Background */}
        <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-[#6b6560] hover:text-[#1a1a1a] text-xs font-bold uppercase tracking-widest mb-6 transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </motion.button>

            {/* Title */}
            <div className="text-center max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-[#f5f0e8] border border-[#e8e4de] rounded-full px-4 py-2 mb-4"
              >
                <Sparkles className="w-4 h-4 text-[#b8954f]" />
                <span className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest">Smart Route Finder</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black mb-3 tracking-tight text-[#1a1a1a]"
              >
                Compare <span className="text-[#b8954f]">Routes</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[#6b6560] font-medium"
              >
                Find the fastest, cheapest, and most comfortable ways to travel
              </motion.p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-[#e8e4de] p-6 md:p-8"
            >
              {/* Search Form */}
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                {/* From Input */}
                <div className="relative">
                  <label className="text-[10px] font-black text-[#6b6560] uppercase tracking-widest mb-2 block">From</label>
                  <div className="flex items-center gap-3 bg-[#f5f0e8] rounded-2xl px-4 py-3.5 border border-[#e8e4de] focus-within:ring-2 focus-within:ring-[#b8954f] focus-within:border-[#b8954f] transition-all">
                    <div className="w-2.5 h-2.5 bg-[#4a7c59] rounded-full shrink-0" />
                    <input 
                      value={fromSearch} 
                      onChange={(e) => { setFromSearch(e.target.value); setFromId(''); setShowFromDrop(true); }}
                      onFocus={() => setShowFromDrop(true)} 
                      onBlur={() => setTimeout(() => setShowFromDrop(false), 200)}
                      placeholder="Enter starting point..." 
                      className="flex-1 bg-transparent outline-none text-[#1a1a1a] placeholder-[#6b6560]/60 font-semibold text-sm" 
                    />
                  </div>
                  {showFromDrop && filtered(fromSearch).length > 0 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto border border-[#e8e4de] py-2">
                      {filtered(fromSearch).map(loc => (
                        <button 
                          key={loc.id} 
                          onMouseDown={() => { setFromId(loc.id); setFromSearch(loc.name); setShowFromDrop(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-[#f5f0e8] text-sm text-[#1a1a1a] flex items-center gap-3 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-[#4a7c59]" />
                          <span className="font-semibold">{loc.name}</span>
                          <span className="text-[10px] font-bold text-[#6b6560] ml-auto bg-[#f5f0e8] px-2 py-1 rounded-md">{loc.lines?.[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center pb-3">
                  <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center text-[#6b6560]">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* To Input */}
                <div className="relative">
                  <label className="text-[10px] font-black text-[#6b6560] uppercase tracking-widest mb-2 block">To</label>
                  <div className="flex items-center gap-3 bg-[#f5f0e8] rounded-2xl px-4 py-3.5 border border-[#e8e4de] focus-within:ring-2 focus-within:ring-[#b8954f] focus-within:border-[#b8954f] transition-all">
                    <div className="w-2.5 h-2.5 bg-[#b8954f] rounded-full shrink-0" />
                    <input 
                      value={toSearch} 
                      onChange={(e) => { setToSearch(e.target.value); setToId(''); setShowToDrop(true); }}
                      onFocus={() => setShowToDrop(true)} 
                      onBlur={() => setTimeout(() => setShowToDrop(false), 200)}
                      placeholder="Enter destination..." 
                      className="flex-1 bg-transparent outline-none text-[#1a1a1a] placeholder-[#6b6560]/60 font-semibold text-sm" 
                    />
                  </div>
                  {showToDrop && filtered(toSearch).length > 0 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto border border-[#e8e4de] py-2">
                      {filtered(toSearch).map(loc => (
                        <button 
                          key={loc.id} 
                          onMouseDown={() => { setToId(loc.id); setToSearch(loc.name); setShowToDrop(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-[#f5f0e8] text-sm text-[#1a1a1a] flex items-center gap-3 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-[#b8954f]" />
                          <span className="font-semibold">{loc.name}</span>
                          <span className="text-[10px] font-bold text-[#6b6560] ml-auto bg-[#f5f0e8] px-2 py-1 rounded-md">{loc.lines?.[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={handleSearch} 
                disabled={!fromId || !toId}
                className="mt-6 w-full bg-[#b8954f] text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
              >
                <Navigation className="w-5 h-5" />
                Find Best Routes
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Results Grid Section */}
        <div className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            {result && result.routes.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Route Info Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 text-[#1a1a1a]">
                      <span className="text-xl font-black">{result.from}</span>
                      <ArrowRight className="w-5 h-5 text-[#b8954f]" />
                      <span className="text-xl font-black">{result.to}</span>
                    </div>
                    <p className="text-sm font-bold text-[#6b6560] uppercase tracking-widest mt-1">{result.routes.length} Routes Found</p>
                  </div>
                  {maxSavings > 0 && (
                    <div className="flex items-center gap-2 bg-[#4a7c59]/10 border border-[#4a7c59]/20 rounded-xl px-4 py-2">
                      <TrendingDown className="w-4 h-4 text-[#4a7c59]" />
                      <span className="text-sm font-bold text-[#4a7c59]">Save up to ₹{maxSavings}</span>
                    </div>
                  )}
                </div>

                {/* Route Cards Grid with Scroll Animation */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.routes.map((route, i) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.5 }}
                      onClick={() => handleSelectRoute(route)}
                      className={`bg-white/80 backdrop-blur-xl rounded-3xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                        selectedRoute?.id === route.id 
                          ? 'border-[#b8954f] shadow-xl' 
                          : 'border-[#e8e4de] hover:border-[#b8954f]/50'
                      }`}
                    >
                      {/* Route Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                          i === 0 ? 'bg-[#4a7c59]/10 text-[#4a7c59]' :
                          i === 1 ? 'bg-[#b8954f]/10 text-[#b8954f]' :
                          'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                        }`}>
                          {i === 0 ? 'Fastest' : i === 1 ? 'Cheapest' : 'Best Value'}
                        </span>
                        {route.savings > 0 && (
                          <span className="text-[10px] font-bold text-[#4a7c59] bg-[#4a7c59]/10 px-2 py-1 rounded-full">
                            Save ₹{route.savings}
                          </span>
                        )}
                      </div>

                      {/* Route Name */}
                      <h3 className="font-bold text-[#1a1a1a] text-lg mb-4">{route.name}</h3>

                      {/* Route Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-[#f5f0e8] rounded-2xl p-3 text-center">
                          <Clock className="w-4 h-4 text-[#6b6560] mx-auto mb-1" />
                          <span className="text-sm font-black text-[#1a1a1a]">{route.timeMinutes}m</span>
                        </div>
                        <div className="bg-[#f5f0e8] rounded-2xl p-3 text-center">
                          <IndianRupee className="w-4 h-4 text-[#6b6560] mx-auto mb-1" />
                          <span className="text-sm font-black text-[#1a1a1a]">₹{route.cost}</span>
                        </div>
                        <div className="bg-[#f5f0e8] rounded-2xl p-3 text-center">
                          <Route className="w-4 h-4 text-[#6b6560] mx-auto mb-1" />
                          <span className="text-sm font-black text-[#1a1a1a]">{route.distance}km</span>
                        </div>
                      </div>

                      {/* Transport Modes */}
                      <div className="flex -space-x-2">
                        {route.legs.slice(0, 4).map((leg, j) => (
                          <div 
                            key={j}
                            className="w-9 h-9 rounded-full bg-white border-2 border-[#e8e4de] flex items-center justify-center text-sm shadow-sm"
                            title={leg.mode}
                          >
                            {typeof leg.icon === 'string' ? leg.icon : '●'}
                          </div>
                        ))}
                        {route.legs.length > 4 && (
                          <div className="w-9 h-9 rounded-full bg-[#f5f0e8] border-2 border-[#e8e4de] flex items-center justify-center text-xs font-bold text-[#6b6560]">
                            +{route.legs.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Select / Book Button */}
                      <div className={`mt-4 pt-4 border-t border-[#e8e4de] flex items-center justify-between ${
                        selectedRoute?.id === route.id ? 'text-[#b8954f]' : 'text-[#6b6560]'
                      }`}>
                        {selectedRoute?.id === route.id ? (
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <span className="w-2 h-2 bg-[#b8954f] rounded-full animate-pulse" />
                            Selected
                          </div>
                        ) : (
                          <span className="text-sm font-bold">Click to select</span>
                        )}
                        
                        {/* Book Now button - always visible on hover or when selected */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRoute(route);
                            setTimeout(() => setShowPaymentModal(true), 100);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            selectedRoute?.id === route.id
                              ? 'bg-[#b8954f] text-white shadow-lg'
                              : 'bg-[#f5f0e8] text-[#1a1a1a] hover:bg-[#b8954f] hover:text-white'
                          }`}
                        >
                          <Navigation className="w-4 h-4" />
                          {selectedRoute?.id === route.id ? 'Continue' : 'Book Now'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Selected Route Detail Panel */}
                <AnimatePresence>
                  {selectedRoute && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-[#b8954f] shadow-2xl p-6 md:p-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                          <span className="text-[10px] font-black text-[#b8954f] uppercase tracking-widest">Selected Route</span>
                          <h3 className="font-black text-[#1a1a1a] text-xl mt-1">{selectedRoute.name}</h3>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleStartNavigation(selectedRoute)}
                            className="flex items-center gap-2 bg-[#b8954f] text-white px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-[#a88445] transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                            Start Navigation
                          </button>
                          <button 
                            onClick={openInGoogleMaps}
                            className="flex items-center gap-2 bg-[#1e3a5f] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#2d4a6f] transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open in Maps
                          </button>
                        </div>
                      </div>
                      
                      <JourneyLegTimeline legs={selectedRoute.legs} />
                      
                      <div className="mt-6 pt-6 border-t border-[#e8e4de] flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#6b6560]" />
                          <span className="font-bold text-[#1a1a1a]">{selectedRoute.timeMinutes} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Route className="w-4 h-4 text-[#6b6560]" />
                          <span className="font-bold text-[#1a1a1a]">{selectedRoute.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-[#6b6560]" />
                          <span className="font-bold text-[#1a1a1a]">₹{selectedRoute.cost}</span>
                        </div>
                        {selectedRoute.savings > 0 && (
                          <span className="text-[#4a7c59] font-bold bg-[#4a7c59]/10 px-3 py-1 rounded-full">
                            Save ₹{selectedRoute.savings}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-[#6b6560] mt-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#4a7c59] rounded-full animate-pulse" />
                        Trip saved to your history
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Empty State */}
            {!result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 max-w-lg mx-auto"
              >
                <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-[#1e3a5f]" />
                </div>
                <h3 className="text-xl font-black text-[#1a1a1a] mb-3">Ready to Compare?</h3>
                <p className="text-[#6b6560] font-medium mb-8 text-sm">
                  Enter your starting point and destination to see all available transit options
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-[#6b6560]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#4a7c59]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#4a7c59]" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Time</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#b8954f]/10 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-[#b8954f]" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Cost</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                      <Route className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Comfort</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && selectedRoute && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !paymentProcessing && setShowPaymentModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-[#1e3a5f] px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-black text-lg">Complete Booking</h3>
                    <p className="text-white/70 text-xs">Review and pay for your journey</p>
                  </div>
                  <button 
                    onClick={() => !paymentProcessing && setShowPaymentModal(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Trip Summary */}
                  <div className="bg-[#f5f0e8] rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-[#6b6560] text-xs font-bold uppercase tracking-widest mb-2">
                      <MapPin className="w-3 h-3" />
                      Trip Details
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#1a1a1a] font-bold">{result?.from} → {result?.to}</p>
                      <p className="text-[#6b6560] text-sm">{selectedRoute.name}</p>
                      <div className="flex items-center gap-4 text-sm pt-2">
                        <span className="flex items-center gap-1 text-[#6b6560]">
                          <Clock className="w-4 h-4" />
                          {selectedRoute.timeMinutes} min
                        </span>
                        <span className="flex items-center gap-1 text-[#6b6560]">
                          <Route className="w-4 h-4" />
                          {selectedRoute.distance} km
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-[#6b6560] uppercase tracking-widest">Fare Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[#6b6560]">
                        <span>Base Fare</span>
                          <span className="font-semibold">₹{Math.round(selectedRoute.cost * 0.7)}</span>
                        </div>
                        <div className="flex justify-between text-[#6b6560]">
                          <span>Service Fee</span>
                          <span className="font-semibold">₹{Math.round(selectedRoute.cost * 0.2)}</span>
                        </div>
                        <div className="flex justify-between text-[#6b6560]">
                          <span>Taxes</span>
                          <span className="font-semibold">₹{Math.round(selectedRoute.cost * 0.1)}</span>
                        </div>
                        <div className="pt-2 border-t border-[#e8e4de] flex justify-between items-center">
                          <span className="font-bold text-[#1a1a1a]">Total Amount</span>
                          <span className="text-2xl font-black text-[#b8954f]">₹{selectedRoute.cost}</span>
                        </div>
                      </div>
                    </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-[#6b6560] uppercase tracking-widest">Select Payment Method</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'cash', label: 'Cash', icon: Banknote, color: '#4a7c59' },
                        { id: 'card', label: 'Card', icon: CreditCard, color: '#1e3a5f' },
                        { id: 'upi', label: 'UPI', icon: QrCode, color: '#b8954f' },
                        { id: 'wallet', label: 'Wallet', icon: Wallet, color: '#6b6560' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id as typeof selectedPaymentMethod)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-[#b8954f] bg-[#b8954f]/10'
                              : 'border-[#e8e4de] hover:border-[#b8954f]/50'
                          }`}
                        >
                          <method.icon className="w-5 h-5" style={{ color: method.color }} />
                          <span className="font-bold text-sm text-[#1a1a1a]">{method.label}</span>
                          {selectedPaymentMethod === method.id && (
                            <Check className="w-4 h-4 text-[#b8954f] ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePaymentConfirm}
                    disabled={paymentProcessing}
                    className="w-full bg-[#b8954f] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {paymentProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Pay ₹{selectedRoute.cost}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-[#6b6560]">
                    By proceeding, you agree to our terms and conditions
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
