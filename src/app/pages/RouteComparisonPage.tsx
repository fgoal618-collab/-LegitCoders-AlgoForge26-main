import { useNavigate } from "react-router";
import { Zap, DollarSign, Scale, Clock, TrendingDown, ArrowRight, MapPin, Navigation, ArrowLeft } from "lucide-react";
import { Layout } from "../components/Layout";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";

export function RouteComparisonPage() {
  const navigate = useNavigate();
  const { currentRoute, selectRoute, isLoading } = useApp();

  const handleSelectRoute = (route: any) => {
    selectRoute(route);
    navigate('/vehicles');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'fastest': return Zap;
      case 'cheapest': return DollarSign;
      case 'balanced': return Scale;
      default: return Navigation;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Finding best routes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentRoute) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Routes Found</h2>
            <p className="text-gray-500 mb-6">Please search for a route from the home page first.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-brand-cta text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-cta/30 hover:shadow-xl hover:brightness-95 transition-all active:scale-[0.98]"
            >
              Back to Search
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const routes = currentRoute?.routes || [];
  const from = currentRoute?.from || '';
  const to = currentRoute?.to || '';

  return (
    <Layout>
      <div className="min-h-screen bg-brand-background">
        {/* Header Section */}
        <div className="bg-brand-primary px-4 sm:px-6 lg:px-8 pt-36 pb-20 text-white relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-5xl mx-auto relative z-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Refine Vectors</span>
            </button>
            <h1 className="text-5xl font-black mb-6 tracking-tighter leading-tight">Route Intelligence</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                <span className="text-xs font-black uppercase tracking-widest">{from.split(',')[0]}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40" />
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-brand-cta rounded-full shadow-[0_0_12px_rgba(255,0,110,0.5)]" />
                <span className="text-xs font-black uppercase tracking-widest">{to.split(',')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-20">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {routes.map((route: any, index: number) => {
              const isRecommended = route.recommended;
              
              // Define badge colors based on route type
              const badgeStyles: Record<string, string> = {
                fastest: "bg-amber-100 text-amber-700",
                cheapest: "bg-emerald-100 text-emerald-700",
                comfortable: "bg-brand-primary/10 text-brand-primary",
                balanced: "bg-brand-success/10 text-brand-success"
              };

              return (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className={`bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border transition-all flex flex-col items-stretch text-left ${
                    isRecommended ? 'border-brand-success/30 ring-4 ring-brand-success/5' : 'border-gray-100'
                  }`}
                >
                  {/* Badge Row */}
                  <div className="flex items-center justify-between mb-8">
                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${badgeStyles[route.type] || 'bg-gray-100 text-gray-400'}`}>
                      {route.type}
                    </span>
                    {isRecommended && (
                      <span className="bg-brand-success text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-brand-success/20">
                        ★★ Recommended
                      </span>
                    )}
                  </div>

                  {/* Mode Icon & Name */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                      {route.legs[0]?.icon || '🚢'}
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{route.name}</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-black text-gray-900 tracking-tight">{route.timeMinutes} MIN</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="mb-10 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100/50 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Estimated Fare Range</p>
                    <div className="text-3xl font-black text-gray-900 tracking-tighter">
                      {route.costRange}
                    </div>
                    {route.savings > 0 && (
                      <div className="inline-flex items-center gap-1.5 mt-3 text-brand-success bg-brand-success/10 px-3 py-1 rounded-full">
                        <TrendingDown className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Save ₹{route.savings} vs Cab</span>
                      </div>
                    )}
                  </div>

                  {/* Multimodal Progress */}
                  <div className="mb-10 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {route.legs.map((leg: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-center gap-1 group/leg">
                          <div className="w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-lg shadow-sm group-hover/leg:bg-gray-50 transition-colors">
                            {leg.icon}
                          </div>
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">{leg.mode}</span>
                        </div>
                        {idx < route.legs.length - 1 && (
                          <div className="w-4 h-[2px] bg-gray-100 mb-4" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleSelectRoute(route)}
                      className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] ${
                        isRecommended 
                          ? 'bg-brand-cta text-white shadow-xl shadow-brand-cta/20 hover:shadow-brand-cta/40' 
                          : 'bg-white border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5'
                      }`}
                    >
                      Initialize {route.legs[0]?.mode === 'bike' ? 'Ride' : 'Journey'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
