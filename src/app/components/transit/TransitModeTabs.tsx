import { Bus, TrainFront, Train, Car } from 'lucide-react';

export type TransitTab = 'bus' | 'train' | 'metro' | 'auto';

interface TransitModeTabsProps {
  active: TransitTab;
  onChange: (tab: TransitTab) => void;
  counts?: { bus?: number; train?: number; metro?: number; auto?: number };
}

const tabs: { key: TransitTab; icon: typeof Bus; label: string; color: string }[] = [
  { key: 'bus', icon: Bus, label: 'Bus', color: 'text-amber-600' },
  { key: 'train', icon: TrainFront, label: 'Train', color: 'text-red-700' },
  { key: 'metro', icon: Train, label: 'Metro', color: 'text-emerald-600' },
  { key: 'auto', icon: Car, label: 'Auto/Cab', color: 'text-brand-primary' },
];

export function TransitModeTabs({ active, onChange, counts }: TransitModeTabsProps) {
  return (
    <div className="flex gap-1 p-1.5 bg-gray-50 rounded-full border border-gray-100">
      {tabs.map(({ key, icon: Icon, label, color }) => {
        const count = counts?.[key] ?? 0;
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-full text-[11px] font-extrabold transition-all border border-transparent ${
              isActive
                ? 'bg-white shadow-sm text-gray-900 border-gray-100 scale-[1.02]'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? color : ''}`} />
            <span className="uppercase tracking-tight leading-none">{label}</span>
            {count > 0 && <span className="text-[9px] font-bold text-gray-400 opacity-60">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
