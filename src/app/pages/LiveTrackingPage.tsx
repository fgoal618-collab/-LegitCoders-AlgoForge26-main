import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { CheckCircle, Phone, MessageSquare, AlertCircle, ArrowLeft, ArrowRight, MapPin, Clock, Route, Volume2, VolumeX } from "lucide-react";
import { Layout } from "../components/Layout";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { motion } from "motion/react";
import { GoogleMap } from "../components/GoogleMap";
import { speak, announceNavigationStart, announceProgress, stopSpeaking } from "../services/voiceService";

export function LiveTrackingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTrip, setCurrentTrip } = useApp();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [tripInitialized, setTripInitialized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastAnnouncedProgress, setLastAnnouncedProgress] = useState(0);

  // Initialize trip from navigation state if needed
  useEffect(() => {
    if (!currentTrip && location.state?.route && !tripInitialized) {
      const route = location.state.route;
      const newTrip = {
        id: `trip-${Date.now()}`,
        route: route,
        fare: route.cost || route.fare || 0,
        progress: 0,
        status: 'active',
        estimatedArrival: new Date(Date.now() + (route.timeMinutes || 30) * 60000).toISOString(),
        vehicle: route.vehicle || { name: 'Transit', icon: '🚆' },
      };
      setCurrentTrip(newTrip);
      setTripInitialized(true);
      
      if (voiceEnabled) {
        announceNavigationStart(
          route.from || 'Current Location', 
          route.to || 'Destination', 
          route.timeMinutes || 30, 
          route.distance || 0
        );
      }
    }
  }, [currentTrip, location.state, setCurrentTrip, tripInitialized, voiceEnabled]);

  useEffect(() => {
    if (!currentTrip && tripInitialized) {
      navigate('/');
      return;
    }

    if (!currentTrip) return;

    const interval = setInterval(async () => {
      try {
        const data = await api.getTripTracking(currentTrip.id);
        setTrackingData(data.trip);
        
        const currentProgress = data.trip.progress || currentTrip.progress || 0;
        const destinationName = typeof currentTrip.route?.to === 'string' ? currentTrip.route.to : currentTrip.route?.to?.name || 'Destination';
        if (voiceEnabled && currentProgress > lastAnnouncedProgress) {
          if (currentProgress >= 25 && lastAnnouncedProgress < 25) {
            speak('You are 25 percent of the way there.');
            setLastAnnouncedProgress(25);
          } else if (currentProgress >= 50 && lastAnnouncedProgress < 50) {
            speak('Halfway there. Keep going!');
            setLastAnnouncedProgress(50);
          } else if (currentProgress >= 75 && lastAnnouncedProgress < 75) {
            speak('Almost at your destination. Just 25 percent remaining.');
            setLastAnnouncedProgress(75);
          } else if (currentProgress >= 100 && lastAnnouncedProgress < 100) {
            speak(`You have arrived at ${destinationName}!`);
            setLastAnnouncedProgress(100);
          }
        }
        
        if (data.trip.status === 'completed') {
          clearInterval(interval);
          setTimeout(() => navigate('/payment'), 2000);
        }
      } catch (err) {
        console.error('Tracking error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentTrip, navigate, tripInitialized, voiceEnabled, lastAnnouncedProgress]);

  if (!currentTrip) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-md mx-auto bg-white rounded-[2rem] p-10 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Route className="w-10 h-10 text-brand-primary" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">No Active Trip</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">You don't have any ongoing journeys. Start by planning a route from the home page.</p>
            <button onClick={() => navigate('/')} className="w-full bg-brand-primary text-white px-8 py-4 rounded-full font-black shadow-lg shadow-brand-primary/20 hover:brightness-105 active:scale-[0.98] transition-all uppercase tracking-wide text-sm">
              Find Best Routes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = trackingData?.progress || currentTrip.progress || 0;
  const route = currentTrip.route || {};
  const legs = route.legs || [];
  const fromName = typeof route.from === 'string' ? route.from : route.from?.name || 'Start';
  const toName = typeof route.to === 'string' ? route.to : route.to?.name || 'Destination';

  // Get coordinates from route data or legs
  const originCoords = route.fromCoords || (legs[0] ? { lat: 19.0760, lng: 72.8777 } : { lat: 19.0760, lng: 72.8777 });
  const destCoords = route.toCoords || (legs[legs.length - 1] ? { lat: 19.2183, lng: 72.9781 } : { lat: 19.2183, lng: 72.9781 });

  const origin = { lat: originCoords.lat, lng: originCoords.lng, name: fromName };
  const destination = { lat: destCoords.lat, lng: destCoords.lng, name: toName };

  const handleCancel = async () => {
    try {
      await api.cancelTrip(currentTrip.id);
      setCurrentTrip(null);
      stopSpeaking();
      navigate('/');
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const statusText = progress >= 100 ? 'Trip Completed! 🎉' : progress > 50 ? 'Almost there...' : 'On the way';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary mb-8 transition-all hover:-translate-x-1 group">
          <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Live Tracking</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-1.5">Real-time journey updates</p>
          </div>
          <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-black shadow-sm ${
            progress >= 100 ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${progress >= 100 ? 'bg-brand-success' : 'bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(58,134,255,0.6)]'}`}></div>
            {statusText.toUpperCase()}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Left Column - Map */}
          <div className="lg:col-span-3 space-y-5">
            {/* Voice Toggle */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${voiceEnabled ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-100 text-gray-400'}`}>
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Voice Navigation</p>
                  <p className="text-xs text-gray-500">{voiceEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) {
                    stopSpeaking();
                  } else {
                    speak('Voice navigation enabled');
                  }
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${voiceEnabled ? 'bg-brand-primary' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${voiceEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100" style={{ height: '400px' }}>
              <GoogleMap origin={origin} destination={destination} progress={progress} />
              {/* Progress overlay */}
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-xl rounded-full h-3 shadow-lg border border-white/50">
                  <motion.div
                    className="h-full bg-brand-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600 font-medium bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">{fromName}</span>
                  <span className="text-xs text-gray-700 font-bold bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">{progress}%</span>
                  <span className="text-xs text-gray-600 font-medium bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">{toName}</span>
                </div>
              </div>
            </div>

            {/* Direction Steps */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Route className="w-4 h-4 text-brand-primary" /> Journey Directions
              </h3>
              <div className="space-y-3">
                {legs.map((leg: any, idx: number) => {
                  const legProgress = (idx + 1) / legs.length * 100;
                  const isCompleted = progress >= legProgress;
                  const isCurrent = progress >= (idx / legs.length * 100) && progress < legProgress;

                  return (
                    <motion.div
                      key={`leg-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isCurrent ? 'bg-brand-primary/5 border-2 border-brand-primary/20 shadow-md' :
                        isCompleted ? 'bg-brand-success/5 border border-brand-success/10 opacity-70' : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                        isCompleted ? 'bg-brand-success text-white shadow-sm' :
                        isCurrent ? 'bg-brand-primary text-white shadow-md scale-110' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : leg.icon || '🚆'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-[15px] ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-400' : 'text-gray-700'}`}>
                          {leg.from} → {leg.to}
                        </p>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {leg.line || leg.mode} · {leg.duration} min · {leg.distance} km · ₹{leg.cost}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="px-3 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 animate-pulse">
                          ONBOARD
                        </div>
                      )}
                      {isCompleted && (
                        <div className="px-2.5 py-1 bg-brand-success/10 text-brand-success text-[10px] uppercase rounded-full font-bold shrink-0">
                          Done
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Trip Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Destination</p>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">{toName}</h2>
                </div>
                <div className="bg-brand-success/10 text-brand-success px-4 py-2 rounded-full border border-brand-success/20 flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-success rounded-full animate-ping"></div>
                  <span className="text-[11px] font-black uppercase tracking-tight">Active</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                      {currentTrip.vehicle?.icon || legs[0]?.icon || '🚆'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{currentTrip.vehicle?.name || 'Transit'}</p>
                      <p className="text-xs font-medium text-gray-400">₹{currentTrip.fare} · {route.timeMinutes || '--'} min</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ETA</p>
                    <p className="text-lg font-black text-brand-primary">
                      {currentTrip.estimatedArrival ?
                        new Date(currentTrip.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Highlights */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Journey Highlights</h3>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-2 bg-brand-success/5 border border-brand-success/10 rounded-full px-3 py-2 flex-1">
                  <div className="w-2 h-2 bg-brand-success rounded-full" />
                  <span className="text-xs font-bold text-gray-800 truncate">{fromName}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <div className="flex items-center gap-2 bg-brand-cta/5 border border-brand-cta/10 rounded-full px-3 py-2 flex-1">
                  <div className="w-2 h-2 bg-brand-cta rounded-full" />
                  <span className="text-xs font-bold text-gray-800 truncate">{toName}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dist.</p>
                  <p className="text-base font-black text-gray-900">{route.distance || '--'}<span className="text-[10px]">km</span></p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Time</p>
                  <p className="text-base font-black text-gray-900">{route.timeMinutes || '--'}<span className="text-[10px]">min</span></p>
                </div>
                <div className="bg-brand-success/5 rounded-xl p-3 text-center border border-brand-success/20">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                  <p className="text-base font-black text-brand-success">₹{currentTrip.fare}</p>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">RK</div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900">Ravi Kumar</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-full">⭐ 4.8</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Certified</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-600 hover:bg-brand-primary hover:text-white transition-all" title="Call"><Phone className="w-4 h-4" /></button>
                  <button className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-600 hover:bg-brand-success hover:text-white transition-all" title="Message"><MessageSquare className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/payment')} className="w-full bg-brand-cta text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider">
                Safe Arrival & Pay
              </button>
              <button onClick={() => setShowCancelModal(true)} className="w-full bg-white text-red-500 py-3 rounded-xl font-bold text-sm uppercase tracking-wider border-2 border-red-100 hover:bg-red-50 transition-all">
                Cancel Trip
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Cancel Trip?</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">Wait! You might be charged a small cancellation fee. Are you sure you want to stop this journey?</p>
            </div>
            <div className="space-y-3">
              <button onClick={handleCancel} className="w-full bg-red-500 text-white py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 hover:brightness-105 transition-all">Yes, Cancel It</button>
              <button onClick={() => setShowCancelModal(false)} className="w-full bg-gray-50 text-gray-700 py-4 rounded-full font-black text-sm uppercase tracking-widest border border-gray-200 hover:bg-gray-100 transition-all">No, Keep Trip</button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
