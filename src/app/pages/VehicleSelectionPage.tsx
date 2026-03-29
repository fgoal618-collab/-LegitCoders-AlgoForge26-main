import { useState } from "react";
import { useNavigate } from "react-router";
import { Star, Zap, TrendingDown, Clock, MapPin, CheckCircle2, ArrowLeft } from "lucide-react";
import { Layout } from "../components/Layout";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";

export function VehicleSelectionPage() {
  const navigate = useNavigate();
  const { selectedRoute, bookTrip } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  if (!selectedRoute) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">No Route Selected</h2>
            <p className="text-gray-500 font-medium mb-8">Please select a route from the home page to see available vehicles.</p>
            <button onClick={() => navigate('/')} className="w-full bg-brand-primary text-white px-8 py-4 rounded-full font-black shadow-lg shadow-brand-primary/20 hover:brightness-105 active:scale-[0.98] transition-all uppercase tracking-widest text-sm">
              View Routes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const generateVehicles = () => {
    const baseCost = selectedRoute.cost;
    const baseTime = selectedRoute.timeMinutes;

    return {
      recommended: {
        id: 'recommended',
        name: "Best Option Today",
        cost: baseCost,
        time: baseTime,
        badge: "AI Recommended",
        icon: "🛺",
        description: "Optimal balance of time & cost",
        eta: "2 min away",
      },
      twoWheelers: [
        { id: "bike-1", name: "Bike Taxi", cost: Math.round(baseCost * 0.8), time: Math.max(3, baseTime - 5), badge: "Fastest", badgeColor: "bg-orange-500", icon: "🏍️", eta: "3 min away", rating: 4.8 },
        { id: "bike-2", name: "Scooter", cost: Math.round(baseCost * 0.9), time: baseTime, badge: "Eco-friendly", badgeColor: "bg-green-500", icon: "🛵", eta: "5 min away", rating: 4.6 },
      ],
      fourWheelers: [
        { id: "cab-1", name: "Mini Cab", cost: Math.round(baseCost * 1.5), time: Math.max(5, baseTime - 2), badge: "Comfort", badgeColor: "bg-blue-500", icon: "🚙", eta: "4 min away", rating: 4.7 },
        { id: "auto-1", name: "Auto Rickshaw", cost: baseCost, time: baseTime + 2, badge: "Cheapest", badgeColor: "bg-green-500", icon: "🛺", eta: "2 min away", rating: 4.5 },
        { id: "cab-2", name: "Sedan", cost: Math.round(baseCost * 2), time: baseTime, badge: "Premium", badgeColor: "bg-purple-500", icon: "🚗", eta: "6 min away", rating: 4.9 },
      ],
    };
  };

  const vehicles = generateVehicles();

  const handleBook = async (vehicle: any) => {
    setSelectedVehicle(vehicle.id);
    await bookTrip(vehicle, 'wallet');
    navigate('/tracking');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const VehicleCard = ({ vehicle, index }: { vehicle: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-[2rem] p-5 border-2 cursor-pointer transition-all hover:shadow-xl group ${
        selectedVehicle === vehicle.id ? 'border-brand-primary shadow-xl shadow-brand-primary/5' : 'border-gray-100 hover:border-brand-primary/20'
      }`}
      onClick={() => setSelectedVehicle(vehicle.id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
          {vehicle.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-gray-900 tracking-tight">{vehicle.name}</span>
            <span className={`text-[9px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-tighter ${vehicle.badgeColor || 'bg-brand-primary'}`}>
              {vehicle.badge}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            <span className="text-brand-success">★ {vehicle.rating}</span>
            <span>•</span>
            <span>{vehicle.eta}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-gray-900 tracking-tighter">₹{vehicle.cost}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">{formatDuration(vehicle.time)}</p>
        </div>
      </div>
      {selectedVehicle === vehicle.id && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full mt-4 bg-brand-cta text-white py-3.5 rounded-full font-black text-xs shadow-lg shadow-brand-cta/20 hover:brightness-105 active:scale-[0.98] transition-all uppercase tracking-widest"
          onClick={(e) => { e.stopPropagation(); handleBook(vehicle); }}
        >
          Book {vehicle.name}
        </motion.button>
      )}
    </motion.div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/routes')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Routes</span>
        </button>

        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Choose Your Ride</h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-10">Select the fastest or most economical vehicle</p>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Route Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Journey Summary</p>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${selectedRoute.type === 'fastest' || selectedRoute.type === 'cheapest' ? 'bg-brand-success/10' : 'bg-brand-primary/10'}`}>
                  {selectedRoute.type === 'fastest' || selectedRoute.type === 'cheapest' ? <TrendingDown className="w-6 h-6 text-brand-success" /> :
                   <Zap className="w-6 h-6 text-brand-primary" />}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 tracking-tight leading-tight">{selectedRoute.name}</h3>
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-0.5">Recommended Route</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Time</p>
                  <p className="text-lg font-black text-gray-900 tracking-tighter">{selectedRoute.timeMinutes} <span className="text-[10px]">MIN</span></p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Fare</p>
                  <p className="text-lg font-black text-brand-success tracking-tighter">₹{selectedRoute.cost}</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-success/5 rounded-[2rem] p-6 border border-brand-success/10 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
                <TrendingDown className="w-24 h-24 text-brand-success" />
              </div>
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-10 h-10 bg-brand-success text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-brand-success/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-brand-success uppercase tracking-widest mb-1.5">Smart Saver Tip</p>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed">
                    Taking the {vehicles.recommended.name} saves you <span className="text-lg font-black text-gray-900">₹{Math.round(selectedRoute.cost * 0.5)}</span> today!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Vehicle Options */}
          <div className="lg:col-span-2 space-y-10">
            {/* Recommended */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Top Selection
                </h2>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-white rounded-[2.5rem] p-8 border-2 cursor-pointer transition-all shadow-xl group ${
                  selectedVehicle === vehicles.recommended.id ? 'border-brand-primary ring-4 ring-brand-primary/5 shadow-2xl shadow-brand-primary/10' : 'border-gray-200 hover:border-brand-primary/20'
                }`}
                onClick={() => handleBook(vehicles.recommended)}
              >
                <div className="absolute top-6 right-8 bg-brand-success text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-brand-success/20">
                  {vehicles.recommended.badge}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center shadow-inner border border-gray-100 text-5xl group-hover:scale-110 transition-transform">
                    {vehicles.recommended.icon}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-1">{vehicles.recommended.name}</h3>
                    <p className="text-sm font-bold text-gray-400 leading-relaxed mb-4">{vehicles.recommended.description}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fare</span>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{vehicles.recommended.cost}</span>
                      </div>
                      <div className="w-px h-10 bg-gray-100" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrival</span>
                        <span className="text-lg font-black text-brand-success tracking-tight">{vehicles.recommended.eta}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="w-full mt-8 bg-brand-cta text-white py-4 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-cta/30 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all"
                  onClick={(e) => { e.stopPropagation(); handleBook(vehicles.recommended); }}
                >
                  Book Recommended Ride
                </button>
              </motion.div>
            </div>

            {/* 2-Wheelers */}
            <div>
              <h2 className="text-gray-800 font-semibold mb-3">2-Wheelers</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {vehicles.twoWheelers.map((v, i) => <VehicleCard key={v.id} vehicle={v} index={i} />)}
              </div>
            </div>

            {/* 4-Wheelers */}
            <div>
              <h2 className="text-gray-800 font-semibold mb-3">4-Wheelers</h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {vehicles.fourWheelers.map((v, i) => <VehicleCard key={v.id} vehicle={v} index={i + 2} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
