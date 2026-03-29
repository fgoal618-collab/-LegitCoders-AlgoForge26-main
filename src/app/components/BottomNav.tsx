import { useNavigate } from "react-router";
import { Home, Route, CreditCard, User } from "lucide-react";
import { motion } from "motion/react";

export function BottomNav({ active }: { active: 'home' | 'trips' | 'payments' | 'profile' }) {
  const navigate = useNavigate();

  const items = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'trips', label: 'Trips', icon: Route, path: '/trips' },
    { id: 'payments', label: 'Wallet', icon: CreditCard, path: '/payment' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm">
      <div className="bg-white/90 backdrop-blur-xl border border-white/50 h-18 rounded-full flex items-center justify-between px-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] group overflow-hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex-1 h-14 flex items-center justify-center group/nav"
              title={item.label}
            >
              <div className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover/nav:scale-105'}`}>
                <div className={`p-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-gray-400 group-hover/nav:bg-gray-50 group-hover/nav:text-gray-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'text-brand-primary opacity-100' : 'text-gray-400 opacity-0 group-hover/nav:opacity-100 h-0 group-hover/nav:h-auto overflow-hidden'}`}>
                  {item.label}
                </span>
              </div>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-brand-primary/5 rounded-full -z-10"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
