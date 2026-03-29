import type { TransitRoute } from '../../types/transit';
import { Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RouteCardProps {
  route: TransitRoute;
  index: number;
  onSelect: (route: TransitRoute) => void;
}

const typeStyles: Record<string, { icon: string; label: string; accent: string; bg: string }> = {
  fastest: { icon: '⚡', label: 'Time Saver', accent: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  cheapest: { icon: '💰', label: 'Money Saver', accent: 'text-gray-700', bg: 'bg-gray-100' },
  balanced: { icon: '✨', label: 'Recommended', accent: 'text-brand-success', bg: 'bg-brand-success/10' },
  comfortable: { icon: '🚕', label: 'Comfortable', accent: 'text-brand-success', bg: 'bg-brand-success/10' },
};

export function RouteCard({ route, index, onSelect }: RouteCardProps) {
  const style = typeStyles[route.type] || typeStyles.balanced;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer ${
        route.recommended ? 'ring-2 ring-brand-success/50 border-brand-success/30 shadow-brand-success/10' : 'border-gray-200'
      }`}
      onClick={() => onSelect(route)}
    >
      {route.recommended && (
        <div className="bg-brand-success text-white text-xs font-bold tracking-wide px-4 py-1.5 rounded-t-2xl text-center uppercase">
          ★ Recommended
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative">
          <div>
            <span className={`inline-block mb-2 ${style.bg} ${style.accent} rounded-lg px-2.5 py-1 text-xs font-bold`}>{style.icon} {style.label}</span>
            <h3 className="font-bold text-gray-900 text-sm">{route.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{route.distance} km · {route.legs.length} leg{route.legs.length > 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 text-gray-800">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-bold text-sm">{route.timeMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${route.timeMinutes < 30 ? 'bg-brand-success' : route.timeMinutes < 50 ? 'bg-amber-400' : 'bg-red-500'}`} />
              <span className="text-[10px] uppercase font-bold text-gray-500">
                {route.timeMinutes < 30 ? 'Smooth' : route.timeMinutes < 50 ? 'Medium' : 'Heavy'}
              </span>
            </div>
          </div>
        </div>

        {/* Journey legs */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          {route.legs.map((leg, i) => (
            <div key={i} className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <span className="text-base">{leg.icon}</span>
                <span className="text-xs font-medium text-gray-600 capitalize">{leg.mode}</span>
              </div>
              {i < route.legs.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
          <div>
            <span className="text-xl font-bold text-gray-900">₹{route.cost}</span>
            {route.savings > 0 && (
              <span className="ml-2 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                Save ₹{route.savings}
              </span>
            )}
          </div>
          <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            route.recommended
              ? 'bg-brand-cta text-white shadow-md hover:brightness-95'
              : 'border border-brand-cta text-brand-cta hover:bg-brand-cta/10'
          }`}>
            Select
          </button>
        </div>
      </div>
    </motion.div>
  );
}
