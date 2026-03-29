// Nearby Transit Explorer — discover transit options around you
import { useState } from 'react';
import { Locate, MapPin, Layers, AlertTriangle, Search, Bus, TrainFront, Train, Car } from 'lucide-react';
import { Layout } from '../components/Layout';
import { TransitModeTabs, type TransitTab } from '../components/transit/TransitModeTabs';
import { useUserLocation } from '../hooks/useUserLocation';
import { useNearbyTransit } from '../hooks/useNearbyTransit';
import { formatDistance } from '../utils/geo';
import { motion, AnimatePresence } from 'motion/react';
import type { PlaceInfo } from '../types/transit';
import { findNearestStation } from '../services/transitService';

export function ExplorePage() {
  const { location, isDetecting, error, detect, setLocation } = useUserLocation();
  const nearby = useNearbyTransit(location?.lat ?? null, location?.lng ?? null);
  const [tab, setTab] = useState<TransitTab>('bus');
  const [manualInput, setManualInput] = useState('');

  const handleManualSearch = () => {
    if (!manualInput.trim()) return;
    // Use nearest station as fallback for manual input
    const station = findNearestStation(19.076, 72.8777); // Default Mumbai center
    setLocation({
      name: manualInput, lat: station.lat, lng: station.lng,
      address: manualInput,
    });
  };

  const totalOptions = nearby
    ? nearby.busStops.length + nearby.trainStations.length + nearby.metroStations.length
    : 0;

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero - transparent since Layout has full-page bg */}
        <div className="px-4 sm:px-6 lg:px-8 py-20 pb-40 md:py-28 md:pb-48 text-slate-900 relative overflow-hidden animate-on-scroll">
          {/* Ambient Glows - removed since Layout handles this */}

          <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-full px-5 py-2 mb-6 border border-white/20">
              <Layers className="w-4 h-4 text-white/90" />
              <span className="text-[10px] font-black tracking-widest uppercase text-white/90">Nearby Transit Explorer</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight text-[#1a1a1a]">
              What's <span className="text-[#1e3a5f]">Near You?</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-slate-600 max-w-lg mx-auto mb-10 text-[15px] font-medium leading-relaxed">
              Discover BEST bus stops, train stations, metro stations, <br className="hidden sm:block"/> and ride options within walking distance.
            </motion.p>

            {/* Interactive Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} 
              className="w-full max-w-xl mx-auto flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full px-6 py-4 shadow-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/30 transition-all mb-6">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Enter area, station or landmark (e.g., Bandra)..." 
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 font-semibold text-sm" 
              />
            </motion.div>

            {/* Primary Action Button */}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              onClick={detect}
              disabled={isDetecting}
              className="bg-[#b8954f] text-white px-8 py-3.5 rounded-full font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-[11px] inline-flex items-center justify-center gap-2 mb-4"
            >
              {isDetecting ? (
                <div className="w-4 h-4 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Locate className="w-4 h-4" />
              )}
              {isDetecting ? 'Detecting...' : 'Use My Location'}
            </motion.button>

            {error && (
              <div className="mt-2 flex items-center justify-center gap-2 text-rose-600 text-sm bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {location && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-xl rounded-full px-5 py-2.5 shadow-lg border border-[#e8e4de]">
                <MapPin className="w-3.5 h-3.5 text-[#1e3a5f]" />
                <span className="text-[13px] font-bold text-[#1a1a1a] tracking-wide truncate max-w-[200px]">{location.name}</span>
                <span className="text-[10px] bg-[#f5f0e8] px-2.5 py-1 rounded-full font-black tracking-widest text-[#1e3a5f] whitespace-nowrap">{totalOptions} options</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-20 relative z-20 animate-on-scroll">
          <AnimatePresence>
            {nearby && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden min-h-[500px]">
                  {/* Tabs */}
                  <div className="p-6 md:p-8 pb-0 border-b border-gray-100/60 mb-2">
                    <TransitModeTabs
                      active={tab}
                      onChange={setTab}
                      counts={{
                        bus: nearby.busStops.length,
                        train: nearby.trainStations.length,
                        metro: nearby.metroStations.length,
                      }}
                    />
                  </div>

                  {/* Bus Tab */}
                  {tab === 'bus' && (
                    <div className="p-6 md:p-8 space-y-2">
                      {nearby.busStops.length === 0 ? (
                        <p className="text-center py-10 text-gray-400 text-sm font-semibold tracking-wide">No bus stops within 1.5 km</p>
                      ) : (
                        <>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-2">Best Bus Stops</p>
                          {nearby.busStops.map(({ item: stop, distance }) => (
                            <div key={stop.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border-b border-transparent hover:border-gray-50 cursor-default group">
                              <div className="w-10 h-10 bg-amber-100/50 rounded-full flex items-center justify-center shrink-0">
                                <Bus className="w-5 h-5 text-amber-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-gray-900 truncate uppercase tracking-widest group-hover:text-amber-600 transition-colors">{stop.name}</p>
                                <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5 truncate tracking-widest">{stop.area} · {stop.road}</p>
                              </div>
                              <span className="text-[11px] font-black text-amber-600 bg-amber-50/80 px-3 py-1.5 rounded-full shrink-0 tracking-wider">
                                {formatDistance(distance)}
                              </span>
                            </div>
                          ))}
                          {nearby.busRoutes.length > 0 && (
                            <>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-8 mb-4 pl-2">Available Routes</p>
                              <div className="flex flex-wrap gap-2 px-2">
                                {nearby.busRoutes.map(r => (
                                  <div key={r.route.id} className="bg-amber-50 border border-amber-100/50 rounded-xl px-3 py-2 text-xs hover:bg-amber-100/50 transition-colors cursor-crosshair" title={r.route.longName}>
                                    <span className="font-black text-amber-700">{r.route.shortName}</span>
                                    <span className="text-amber-500 font-bold ml-1.5 opacity-80">→ {r.route.to.split(' ')[0]}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Train Tab */}
                  {tab === 'train' && (
                    <div className="p-6 md:p-8 space-y-2">
                      {nearby.trainStations.length === 0 ? (
                        <p className="text-center py-10 text-gray-400 text-sm font-semibold tracking-wide">No train stations within 3 km</p>
                      ) : (
                        <>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-2">Suburban Train Stations</p>
                          {nearby.trainStations.map(({ item: stn, distance }) => (
                            <div key={stn.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border-b border-transparent hover:border-gray-50 cursor-default group">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: stn.lineColor + '18' }}>
                                <TrainFront className="w-5 h-5" style={{ color: stn.lineColor }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-gray-900 truncate uppercase tracking-widest transition-colors">{stn.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: stn.lineColor }} />
                                  <span className="text-[10px] uppercase font-bold text-gray-400 truncate tracking-widest">{stn.line} · Zone {stn.zone}</span>
                                </div>
                              </div>
                              <span className="text-[11px] font-black px-3 py-1.5 rounded-full shrink-0 tracking-wider" style={{ color: stn.lineColor, backgroundColor: stn.lineColor + '12' }}>
                                {formatDistance(distance)}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Metro Tab */}
                  {tab === 'metro' && (
                    <div className="p-6 md:p-8 space-y-2">
                      {nearby.metroStations.length === 0 ? (
                        <p className="text-center py-10 text-gray-400 text-sm font-semibold tracking-wide">No metro stations within 5 km</p>
                      ) : (
                        <>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-2">Metro Stations</p>
                          {nearby.metroStations.map(({ item: stn, distance }) => (
                            <div key={stn.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border-b border-transparent hover:border-gray-50 cursor-default group">
                              <div className="w-10 h-10 bg-emerald-100/50 rounded-full flex items-center justify-center shrink-0">
                                <Train className="w-5 h-5 text-emerald-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-gray-900 truncate uppercase tracking-widest group-hover:text-emerald-600 transition-colors">{stn.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                                  <span className="text-[10px] uppercase font-bold text-gray-400 truncate tracking-widest">{stn.line}</span>
                                </div>
                              </div>
                              <span className="text-[11px] font-black text-emerald-600 bg-emerald-50/80 px-3 py-1.5 rounded-full shrink-0 tracking-wider">
                                {formatDistance(distance)}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Auto/Cab Tab */}
                  {tab === 'auto' && (
                    <div className="p-6 md:p-8 space-y-4">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-2">Nearby Ride Options</p>
                      {[
                        { icon: Car, name: 'Auto Rickshaw', desc: 'Minimum fare ₹23 · Meter', time: '2-5 min', badge: 'CHEAPEST', bg: 'bg-amber-50/40', badgeColor: 'bg-amber-100 text-amber-700', iconColor: 'text-amber-500', wrapper: 'bg-amber-100/50' },
                        { icon: Car, name: 'Ola / Uber Mini', desc: 'Starts at ₹69 · App booking', time: '3-7 min', badge: 'POPULAR', bg: 'bg-[#f5f0e8]', badgeColor: 'bg-[#1e3a5f]/10 text-[#1e3a5f]', iconColor: 'text-[#1e3a5f]', wrapper: 'bg-[#1e3a5f]/10' },
                        { icon: Car, name: 'Ola Prime / Uber Go', desc: 'Starts at ₹99 · AC ride', time: '5-10 min', badge: 'COMFORT', bg: 'bg-gray-50/50', badgeColor: 'bg-gray-200 text-gray-600', iconColor: 'text-gray-500', wrapper: 'bg-white' },
                        { icon: Car, name: 'Rapido Bike', desc: 'Starts at ₹25 · Bike taxi', time: '2-4 min', badge: 'FASTEST', bg: 'bg-emerald-50/40', badgeColor: 'bg-emerald-100 text-emerald-700', iconColor: 'text-emerald-500', wrapper: 'bg-emerald-100/50' },
                      ].map((opt, i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${opt.bg} border border-gray-100/50 hover:scale-[1.01] transition-transform`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-gray-100/50 ${opt.wrapper}`}>
                            <opt.icon className={`w-6 h-6 ${opt.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-[14px] font-black text-gray-900 tracking-wide truncate">{opt.name}</p>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${opt.badgeColor}`}>{opt.badge}</span>
                            </div>
                            <p className="text-[11px] font-bold text-gray-500">{opt.desc}</p>
                            <div className="flex items-center gap-1 mt-1 opacity-70">
                              <span className="text-[10px] font-black text-gray-400 tracking-wider">⏱ {opt.time} pickup</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!nearby && !isDetecting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-gray-100 mt-2 relative overflow-hidden min-h-[400px] flex flex-col justify-center items-center animate-on-scroll">
              <div className="w-20 h-20 bg-[#f5f0e8] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner relative overflow-hidden">
                <MapPin className="w-8 h-8 text-[#1e3a5f] relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Set Your Location</h3>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest max-w-[20rem] mx-auto leading-relaxed">
                Search above or click "Near Me" to uncover transit choices exactly where you are.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
