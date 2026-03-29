// Profile Page — User profile, payment history, stats, and trips
import { useState, useEffect } from 'react';
import {
  User, Mail, Map, CreditCard, TrendingDown, TrendingUp, Zap, 
  Award, Calendar, MapPin, ArrowRight, Share2, Settings, 
  MoreVertical, Filter, Download, IndianRupee, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { getSavedTrips, deleteTrip } from '../services/tripStorage';
import { getPaymentHistory, getPaymentStats, deletePayment, PaymentTransaction } from '../services/paymentHistory';
import type { SavedTrip } from '../types/transit';

export function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState({ total: 0, totalTrips: 0, totalDistance: 0, totalDiscount: 0, avgFare: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'trips'>('overview');
  const [filterMethod, setFilterMethod] = useState<'all' | 'wallet' | 'upi' | 'cash' | 'card'>('all');

  // Mock user data
  const user = {
    name: 'Khushi Sharma',
    email: 'khushi@example.com',
    phone: '+91 98765 43210',
    avatar: '👤',
    memberSince: 'January 2024',
  };

  useEffect(() => {
    setTrips(getSavedTrips());
    setPayments(getPaymentHistory());
    setStats(getPaymentStats());
  }, []);

  const getTierEarned = (totalTrips: number, spent: number) => {
    if (totalTrips >= 50 || spent >= 5000) return { tier: 'Transit Pro', color: 'from-yellow-400 to-orange-500', icon: '👑' };
    if (totalTrips >= 20 || spent >= 2000) return { tier: 'Gold Commuter', color: 'from-yellow-300 to-yellow-400', icon: '🌟' };
    return { tier: 'Silver Rider', color: 'from-gray-300 to-gray-400', icon: '⭐' };
  };

  const tier = getTierEarned(stats.totalTrips, stats.total);

  const filteredPayments = payments.filter(p => 
    filterMethod === 'all' ? true : p.method === filterMethod
  );

  const paymentMethodIcons = {
    wallet: <CreditCard className="w-5 h-5" />,
    upi: <Zap className="w-5 h-5" />,
    cash: <IndianRupee className="w-5 h-5" />,
    card: <CreditCard className="w-5 h-5" />,
  };

  const paymentMethodColors = {
    wallet: 'bg-blue-50 border-blue-200 text-blue-700',
    upi: 'bg-purple-50 border-purple-200 text-purple-700',
    cash: 'bg-green-50 border-green-200 text-green-700',
    card: 'bg-orange-50 border-orange-200 text-orange-700',
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
      <div className="min-h-screen pb-24 bg-gradient-to-b from-[#faf9f7] via-[#ffffff] to-[#f5f0e8]">
        {/* Hero Profile Section */}
        <div className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/5 via-transparent to-[#b8954f]/5 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            {/* Profile Header with Backdrop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-xl rounded-4xl border border-[#e8e4de] p-8 mb-8 shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                {/* Profile Info */}
                <div className="flex-1 flex items-start gap-6">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-5xl shadow-lg`}>
                    {tier.icon}
                  </div>
                  <div className="flex-1 pt-2">
                    <h1 className="text-4xl font-black text-[#1a1a1a] mb-1">{user.name}</h1>
                    <p className="text-[#b8954f] font-bold uppercase text-xs tracking-widest mb-4">{tier.tier}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#6b6560]">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6b6560]">
                        <User className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#6b6560]">
                        <Calendar className="w-4 h-4" />
                        <span>Member since {user.memberSince}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                  <button className="p-3 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f]/20 transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] hover:bg-[#1e3a5f]/20 transition-all">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Trips', value: stats.totalTrips, icon: Map, color: 'from-blue-500 to-blue-600' },
                { label: 'Total Spent', value: `₹${stats.total}`, icon: IndianRupee, color: 'from-green-500 to-green-600' },
                { label: 'Distance', value: `${Math.round(stats.totalDistance)} km`, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
                { label: 'Saved', value: `₹${stats.totalDiscount}`, icon: TrendingDown, color: 'from-purple-500 to-purple-600' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="bg-white/60 backdrop-blur rounded-2xl border border-[#e8e4de] p-4 hover:shadow-lg transition-all"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-[#6b6560] font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-[#1a1a1a]">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
              {[
                { id: 'overview', label: 'Overview', color: 'text-[#1e3a5f]' },
                { id: 'payments', label: 'Payment History', color: 'text-green-600' },
                { id: 'trips', label: 'Trip History', color: 'text-blue-600' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? `bg-[#1e3a5f] text-white shadow-lg`
                      : `bg-white/60 border border-[#e8e4de] text-[#6b6560] hover:bg-white`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Recent Trips */}
                    <div className="bg-white/70 backdrop-blur rounded-3xl border border-[#e8e4de] p-6 shadow-lg">
                      <h3 className="text-xl font-black text-[#1a1a1a] mb-4 flex items-center gap-2">
                        <Map className="w-5 h-5 text-blue-600" />
                        Recent Trips
                      </h3>
                      <div className="space-y-3">
                        {trips.slice(0, 4).map((trip, i) => (
                          <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-3 bg-[#faf9f7] rounded-xl hover:bg-[#f5f0e8] transition-all border border-[#e8e4de]/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#1a1a1a] truncate">{trip.originName} → {trip.destinationName}</p>
                              <p className="text-xs text-[#6b6560]">{formatDate(trip.timestamp)}</p>
                            </div>
                            {trip.selectedRoute && (
                              <div className="text-right ml-2">
                                <p className="text-sm font-black text-[#1e3a5f]">₹{trip.selectedRoute.cost}</p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-white/70 backdrop-blur rounded-3xl border border-[#e8e4de] p-6 shadow-lg">
                      <h3 className="text-xl font-black text-[#1a1a1a] mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        Recent Payments
                      </h3>
                      <div className="space-y-3">
                        {filteredPayments.slice(0, 4).map((payment, i) => (
                          <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-3 bg-[#faf9f7] rounded-xl hover:bg-[#f5f0e8] transition-all border border-[#e8e4de]/50"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`p-2 rounded-lg border ${paymentMethodColors[payment.method]}`}>
                                {paymentMethodIcons[payment.method]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#1a1a1a] truncate">{payment.from} → {payment.to}</p>
                                <p className="text-xs text-[#6b6560]">{formatDate(payment.timestamp)}</p>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <p className="text-sm font-black text-[#1e3a5f]">₹{payment.amount}</p>
                              <p className="text-xs text-[#6b6560]">{payment.method.toUpperCase()}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment History Tab */}
              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white/70 backdrop-blur rounded-3xl border border-[#e8e4de] p-6 shadow-lg">
                    {/* Filter Bar */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#e8e4de]">
                      <h3 className="text-xl font-black text-[#1a1a1a] flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-green-600" />
                        Payment History
                      </h3>
                      <div className="flex gap-2">
                        {['all', 'wallet', 'upi', 'cash', 'card'].map(method => (
                          <button
                            key={method}
                            onClick={() => setFilterMethod(method as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                              filterMethod === method
                                ? 'bg-[#1e3a5f] text-white'
                                : 'bg-[#f5f0e8] text-[#6b6560] hover:bg-[#e8e4de]'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment List */}
                    {filteredPayments.length > 0 ? (
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-4">
                        {filteredPayments.map((payment, i) => (
                          <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-4 bg-[#faf9f7] rounded-2xl border border-[#e8e4de] hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`p-3 rounded-xl border ${paymentMethodColors[payment.method]}`}>
                                {paymentMethodIcons[payment.method]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#1a1a1a] truncate">{payment.from} → {payment.to}</p>
                                <p className="text-sm text-[#6b6560]">{payment.distance} km • {payment.duration} min</p>
                                <p className="text-xs text-[#b8954f] font-semibold mt-1">{formatDate(payment.timestamp)}</p>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="flex items-center gap-2 justify-end mb-2">
                                <p className="text-2xl font-black text-[#1e3a5f]">₹{payment.amount}</p>
                                {payment.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {payment.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                                {payment.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                              </div>
                              {payment.discount && (
                                <p className="text-xs text-green-600 font-bold">Saved ₹{payment.discount}</p>
                              )}
                            </div>
                            <button
                              onClick={() => deletePayment(payment.id) && setPayments(getPaymentHistory())}
                              className="opacity-0 group-hover:opacity-100 ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 text-[#e8e4de] mx-auto mb-4" />
                        <p className="text-[#6b6560] font-bold">No payments found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Trip History Tab */}
              {activeTab === 'trips' && (
                <motion.div
                  key="trips"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.length > 0 ? (
                      trips.map((trip, i) => (
                        <motion.div
                          key={trip.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white/70 backdrop-blur rounded-3xl border border-[#e8e4de] overflow-hidden hover:shadow-lg transition-all group"
                        >
                          {/* Trip Routes */}
                          <div className="p-6 pb-4">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-600" />
                                <div className="w-0.5 h-12 bg-[#e8e4de]" />
                                <div className="w-3 h-3 rounded-full bg-[#b8954f]" />
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-sm font-bold text-[#1a1a1a] truncate">{trip.originName}</p>
                                <p className="text-xs text-[#6b6560] mt-10 truncate">{trip.destinationName}</p>
                              </div>
                            </div>

                            {/* Trip Info */}
                            <div className="flex items-center justify-between text-xs text-[#6b6560] mb-4">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
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

                          {/* Action Buttons */}
                          <div className="px-6 py-4 flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a5f]/10 text-[#1e3a5f] py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-[#1e3a5f]/20 transition-all">
                              <ArrowRight className="w-4 h-4" />
                              Re-plan
                            </button>
                            <button
                              onClick={() => {
                                deleteTrip(trip.id);
                                setTrips(getSavedTrips());
                              }}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20">
                        <Map className="w-16 h-16 text-[#e8e4de] mx-auto mb-4" />
                        <p className="text-[#6b6560] font-bold text-lg">No trips recorded yet</p>
                        <p className="text-[#b8954f] text-sm mt-2">Start planning your first journey!</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
