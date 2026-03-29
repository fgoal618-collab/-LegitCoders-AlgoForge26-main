import type { RouteLeg } from '../../types/transit';

interface Props {
  legs: RouteLeg[];
}

export function JourneyLegTimeline({ legs }: Props) {
  return (
    <div className="space-y-0">
      {legs.map((leg, i) => (
        <div key={i} className="relative flex gap-3">
          {/* Timeline */}
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border-2"
              style={{ borderColor: leg.lineColor, backgroundColor: leg.lineColor + '15' }}
            >
              {leg.icon}
            </div>
            {i < legs.length - 1 && (
              <div className="w-0.5 flex-1 min-h-[20px]" style={{ backgroundColor: leg.lineColor + '30' }} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 capitalize">{leg.mode}</p>
                <p className="text-xs text-gray-500">{leg.line}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-700">{leg.duration} min</p>
                <p className="text-xs text-gray-400">₹{leg.cost}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-gray-500">{leg.from}</span>
              <span className="text-xs text-gray-300">→</span>
              <span className="text-xs text-gray-500">{leg.to}</span>
            </div>
            {leg.stops > 0 && (
              <p className="text-[11px] text-gray-400 mt-0.5">{leg.stops} stops · ~{leg.waitTime} min wait</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
