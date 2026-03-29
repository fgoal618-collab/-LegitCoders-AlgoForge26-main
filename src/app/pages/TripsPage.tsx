// Trips Page — saved/recent trips from localStorage
import { useState, useEffect } from 'react';
import { Clock, MapPin, Trash2, ArrowRight, RotateCcw, Navigation, IndianRupee, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/Layout';
import { getSavedTrips, deleteTrip, clearAllTrips } from '../services/tripStorage';
import type { SavedTrip } from '../types/transit';
import { motion, AnimatePresence } from 'motion/react';

export function TripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => { setTrips(getSavedTrips()); }, []);

  const handleDelete = (id: string) => {
    deleteTrip(id);
    setTrips(getSavedTrips());
  };

  const handleClearAll = () => {
    if (!confirm('Clear all saved trips?')) return;
    clearAllTrips();
    setTrips([]);
  };

  const handleRePlan = (trip: SavedTrip) => {
    const from = trip.selectedRoute?.legs[0]?.from || trip.originName;
    const to = trip.selectedRoute?.legs[trip.selectedRoute.legs.length - 1]?.to || trip.destinationName;
    // Navigate to planner with pre-filled origin/destination
    navigate('/planner');
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.round(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  return (
    <Layout>
      <div className="min-h-screen pb-20 bg-[#faf9f7]">
        {/* Header Section */}
        <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-[#f5f0e8] border border-[#e8e4de] rounded-full px-4 py-2 mb-4">
                  <Calendar className="w-4 h-4 text-[#b8954f]" />
                  <span className="text-[11px] font-black text-[#1e3a5f] uppercase tracking-widest">Journey History</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-tight">
                  My <span className="text-[#1e3a5f]">Trips</span>
                </h1>
                <p className="text-[#6b6560] font-medium mt-2 max-w-md">
                  Your saved routes and journey history. Re-plan or review your past trips.
                </p>
              </div>
              
              {trips.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#6b6560]">{trips.length} saved</span>
                  <button 
                    onClick={handleClearAll} 
                    className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {trips.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {trips.map((trip, i) => (
                    <motion.div 
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[#e8e4de] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    >
                      {/* Card Header with Route */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-[#4a7c59]" />
                            <div className="w-0.5 h-8 bg-[#e8e4de]" />
                            <div className="w-3 h-3 rounded-full bg-[#b8954f]" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-bold text-[#1a1a1a] truncate">{trip.originName}</p>
                            <p className="text-xs text-[#6b6560] mt-5 truncate">{trip.destinationName}</p>
                          </div>
                        </div>
                        
                        {/* Time & Date */}
                        <div className="flex items-center gap-4 text-xs text-[#6b6560] mb-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-semibold">{formatDate(trip.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Route Details */}
                      {trip.selectedRoute && (
                        <div className="px-6 py-4 bg-[#faf9f7] border-y border-[#e8e4de]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-black text-[#1e3a5f]">₹{trip.selectedRoute.cost}</span>
                              <span className="text-xs font-bold text-[#6b6560] uppercase tracking-wider">{trip.selectedRoute.timeMinutes} min</span>
                            </div>
                            <div className="flex -space-x-2">
                              {trip.selectedRoute.legs.slice(0, 3).map((leg, j) => (
                                <div 
                                  key={j} 
                                  className="w-8 h-8 rounded-full bg-white border-2 border-[#e8e4de] flex items-center justify-center shadow-sm text-xs"
                                  title={leg.mode}
                                >
                                  {leg.icon}
                                </div>
                              ))}
                              {trip.selectedRoute.legs.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-[#f5f0e8] border-2 border-[#e8e4de] flex items-center justify-center text-xs font-bold text-[#6b6560]">
                                  +{trip.selectedRoute.legs.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="p-4 flex gap-3">
                        <button 
                          onClick={() => handleRePlan(trip)}
                          className="flex-1 bg-[#1e3a5f] text-white py-3 px-4 rounded-2xl font-bold text-sm hover:bg-[#2d4a6f] transition-colors flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Re-Plan
                        </button>
                        <button 
                          onClick={() => handleDelete(trip.id)}
                          className="w-12 h-12 bg-[#f5f0e8] text-[#6b6560] rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete trip"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Empty State */
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-3xl border border-[#e8e4de] shadow-xl max-w-lg mx-auto"
              >
                <div className="w-20 h-20 bg-[#f5f0e8] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-[#1e3a5f]" />
                </div>
                <h3 className="text-2xl font-black text-[#1a1a1a] mb-2">No Trips Yet</h3>
                <p className="text-[#6b6560] font-medium mb-8 max-w-xs mx-auto">
                  Start planning journeys to see them saved here for quick access.
                </p>
                <button 
                  onClick={() => navigate('/compare')}
                  className="bg-[#b8954f] text-white px-8 py-4 rounded-2xl font-black text-sm hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                >
                  <Navigation className="w-4 h-4" />
                  Plan a Trip
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
