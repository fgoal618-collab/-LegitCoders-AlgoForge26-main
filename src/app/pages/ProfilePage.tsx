import { useEffect, useState } from "react";
import { User, Mail, MapPin, CreditCard, Settings, LogOut, Award, TrendingUp, Wallet, ChevronRight, Star } from "lucide-react";
import { Layout } from "../components/Layout";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { motion } from "motion/react";

export function ProfilePage() {
  const { user, loadUser, insights, loadInsights } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');

  useEffect(() => {
    loadUser();
    loadInsights();
  }, [loadUser, loadInsights]);

  const menuItems = [
    { icon: MapPin, title: "Saved Places", subtitle: "Home, Work, and more", action: () => { } },
    { icon: CreditCard, title: "Payment Methods", subtitle: "UPI, Wallet, Cards", action: () => { } },
    { icon: Settings, title: "Preferences", subtitle: "Notifications, Language", action: () => { } },
    { icon: Award, title: "Rewards", subtitle: "View your rewards", action: () => { } },
  ];

  

  const getTierColor = (trips: number) => {
    if (trips >= 50) return 'bg-brand-cta';
    if (trips >= 20) return 'bg-brand-primary';
    return 'bg-gray-400';
  };

  const getTierName = (trips: number) => {
    if (trips >= 50) return 'Transit Pro';
    if (trips >= 20) return 'Gold Commuter';
    return 'Silver Rider';
  };

  const tier = getTierName(insights?.summary?.totalTrips || 0);
  const tierColor = getTierColor(insights?.summary?.totalTrips || 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">My Profile</h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-10">Manage your account and view journey insights</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Profile & Wallet */}
          <div className="space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
              <div className="flex flex-col items-center text-center mb-8 relative z-10">
                <div className={`w-24 h-24 rounded-[2rem] ${tierColor} flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-black/10 mb-4 group-hover:scale-105 transition-transform`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user?.name || 'User'}</h2>
                <div className="flex items-center gap-2 mt-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                  <span className={`w-2 h-2 rounded-full ${tierColor}`} />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tier}</span>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-gray-50 relative z-10">
                <div className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover/item:bg-brand-primary/10 transition-colors">
                      <Mail className="w-4 h-4 text-gray-400 group-hover/item:text-brand-primary" />
                    </div>
                    <span className="text-sm font-bold text-gray-600 truncate max-w-[150px]">{user?.email || 'user@transittwin.com'}</span>
                  </div>
                  <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Edit</button>
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="bg-brand-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand-primary/20 border border-brand-primary/50 relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Wallet className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transit Wallet</span>
                </div>
                <span className="text-[9px] font-black bg-brand-cta text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-brand-cta/20">Active</span>
              </div>
              <div className="relative z-10">
                <p className="text-5xl font-black tracking-tighter mb-1">₹{user?.wallet?.balance || 1450}</p>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Available Credit</p>
                <button className="mt-8 w-full bg-white text-brand-primary py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-black/10 hover:brightness-105 active:scale-[0.98] transition-all">
                  Topup Balance
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-[2rem] p-5 text-center shadow-lg shadow-gray-100/50 border border-gray-50 group hover:border-brand-primary/20 transition-all">
                <p className="text-2xl font-black text-brand-primary tracking-tighter group-hover:scale-110 transition-transform">{insights?.summary?.totalTrips || 0}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Trips</p>
              </div>
              <div className="bg-white rounded-[2rem] p-5 text-center shadow-lg shadow-gray-100/50 border border-gray-50 group hover:border-brand-success/20 transition-all">
                <p className="text-2xl font-black text-brand-success tracking-tighter group-hover:scale-110 transition-transform">₹{insights?.summary?.totalSavings || 0}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Saved</p>
              </div>
              <div className="bg-white rounded-[2rem] p-5 text-center shadow-lg shadow-gray-100/50 border border-gray-50 group hover:border-brand-cta/20 transition-all">
                <p className="text-2xl font-black text-brand-cta tracking-tighter group-hover:scale-110 transition-transform">{insights?.streak?.current || 0}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Streak</p>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tabs */}
            <div className="flex bg-gray-50 p-1.5 rounded-full border border-gray-100 w-fit">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-8 py-2.5 rounded-full font-black text-xs transition-all uppercase tracking-widest ${activeTab === 'overview' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-8 py-2.5 rounded-full font-black text-xs transition-all uppercase tracking-widest ${activeTab === 'achievements' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Achievements
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {/* Comparison Card */}
                  {insights?.comparison && (
                    <div className="bg-brand-success/10 rounded-xl p-5 border border-brand-success/20 overflow-hidden relative group">
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="w-10 h-10 bg-brand-success/20 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-brand-success" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Money Saver!</p>
                          <p className="text-sm text-gray-600 font-medium">{insights.comparison.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu Items */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={index}
                        whileTap={{ scale: 0.98 }}
                        onClick={item.action}
                        className="bg-white rounded-[2rem] p-6 flex items-center gap-4 hover:shadow-xl transition-all border border-gray-100 text-left group"
                      >
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                          <Icon className="w-5 h-5 text-gray-400 group-hover:text-brand-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-gray-900 tracking-tight text-sm">{item.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">{item.subtitle}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Weekly Stats */}
                {insights?.weekly && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-black text-brand-primary">{insights.weekly.trips}</p>
                        <p className="text-xs text-gray-500 font-medium">Trips</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-brand-success">₹{insights.weekly.savings}</p>
                        <p className="text-xs text-gray-500 font-medium">Saved</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-brand-cta">{insights.weekly.avgTripTime}m</p>
                        <p className="text-xs text-gray-500 font-medium">Avg Time</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights?.achievements?.map((achievement: any, index: number) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="font-medium text-gray-900 text-sm">{achievement.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                    </motion.div>
                  )) || (
                      <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
                        <p className="text-gray-500">Start traveling to unlock achievements!</p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Logout */}
            <button className="w-full bg-red-50 text-red-600 rounded-full py-5 flex items-center justify-center gap-3 hover:bg-red-100 transition-all font-black text-xs uppercase tracking-[0.2em] border border-red-100 shadow-sm hover:shadow-md">
              <LogOut className="w-5 h-5" />
              <span>Logout Account</span>
            </button>

            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-4">TransitTwin Architecture v1.0.0</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
