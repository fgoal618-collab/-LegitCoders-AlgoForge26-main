import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Wallet, Banknote, CheckCircle, Sparkles, Gift, Shield, ChevronRight, ArrowLeft, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { Layout } from "../components/Layout";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { motion } from "motion/react";
import { speak, announcePaymentSuccess, announcePaymentFailure } from "../services/voiceService";

export function PaymentPage() {
  const navigate = useNavigate();
  const { currentTrip, loadUser, user } = useApp();
  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [walletBalance, setWalletBalance] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mockPaymentResult, setMockPaymentResult] = useState<'success' | 'failure'>('success');
  const [failureReason, setFailureReason] = useState('Insufficient balance');

  useEffect(() => {
    loadUser();
    loadWallet();
  }, [loadUser]);

  const loadWallet = async () => {
    try {
      const { wallet } = await api.getWallet();
      setWalletBalance(wallet.balance);
    } catch (err) {
      console.error('Failed to load wallet:', err);
    }
  };

  const amount = currentTrip?.fare || 80;
  const savings = currentTrip?.savings || 0;
  const walletDiscount = Math.round(amount * 0.2);
  const finalAmount = selectedMethod === 'wallet' ? amount - walletDiscount : amount;

  const paymentMethods = [
    { id: 'wallet', title: 'Pay from Wallet', subtitle: `Balance: ₹${walletBalance}`, discount: `Save ₹${walletDiscount} (20% off)`, icon: Wallet, iconColor: 'text-brand-cta', bgColor: 'bg-brand-cta/10', borderColor: 'border-brand-cta/30', recommended: true },
    { id: 'upi', title: 'Pay via UPI', subtitle: 'Google Pay, PhonePe, Paytm', icon: CreditCard, iconColor: 'text-brand-primary', bgColor: 'bg-brand-primary/10', borderColor: 'border-brand-primary/30' },
    { id: 'cash', title: 'Pay with Cash', subtitle: 'Pay driver directly', icon: Banknote, iconColor: 'text-brand-success', bgColor: 'bg-brand-success/10', borderColor: 'border-brand-success/30' },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    
    // Mock payment result
    if (mockPaymentResult === 'success') {
      setPaymentStatus('success');
      if (voiceEnabled) {
        announcePaymentSuccess(finalAmount);
      }
      setTimeout(() => navigate('/'), 3000);
    } else {
      setPaymentStatus('failed');
      if (voiceEnabled) {
        announcePaymentFailure(failureReason);
      }
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40 px-4 bg-brand-background">
          <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="text-center max-w-lg bg-white p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-success" />
            <div className="w-28 h-28 bg-brand-success/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle className="w-14 h-14 text-brand-success drop-shadow-sm" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Payment Successful!</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">Your journey is officially complete</p>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 inline-block w-full">
              <p className="text-sm font-bold text-gray-500 mb-1">Total Paid</p>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{finalAmount}</p>
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-2">via {paymentMethods.find(m => m.id === selectedMethod)?.title}</p>
            </div>

            {savings > 0 && (
              <div className="flex items-center justify-center gap-2 bg-brand-success text-white px-6 py-3 rounded-full font-black text-sm shadow-lg shadow-brand-success/20 mb-10">
                <Sparkles className="w-4 h-4" />
                <span>YOU SAVED ₹{savings} ON THIS TRIP</span>
              </div>
            )}

            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Redirecting to Dashboard...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Layout>
        <div className="flex items-center justify-center py-40 px-4 bg-brand-background">
          <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="text-center max-w-lg bg-white p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            <div className="w-28 h-28 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertCircle className="w-14 h-14 text-red-500 drop-shadow-sm" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Payment Failed!</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">{failureReason}</p>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 inline-block w-full">
              <p className="text-sm font-bold text-gray-500 mb-1">Amount</p>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{finalAmount}</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setPaymentStatus('idle')} 
                className="flex-1 bg-brand-primary text-white py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg hover:brightness-105 transition-all"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Go Home
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary mb-10 transition-all hover:-translate-x-1 group">
          <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">Back</span>
        </button>

        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Complete Payment</h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-12">Finalize your transaction securely</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Payment Methods */}
          <div className="lg:col-span-2 space-y-5">
            {/* Amount Card */}
            <div className="bg-brand-primary rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-primary/20 border border-brand-primary/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-3">Amount to be Paid</p>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black text-white tracking-tighter">₹{finalAmount}</span>
                {selectedMethod === 'wallet' && walletDiscount > 0 && (
                  <span className="text-white/40 line-through text-xl font-bold">₹{amount}</span>
                )}
              </div>
              {savings > 0 && (
                <div className="flex items-center gap-2 mt-8 bg-white text-brand-primary rounded-full px-5 py-2.5 inline-flex font-black text-[11px] uppercase tracking-widest shadow-lg shadow-black/10">
                  <Sparkles className="w-4 h-4" />
                  <span>Personal Savings: ₹{savings}</span>
                </div>
              )}
            </div>

            {/* Savings Tip */}
            {selectedMethod !== 'wallet' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Gift className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Save ₹{walletDiscount} more!</p>
                  <p className="text-xs text-amber-700">Use your wallet for 20% instant discount</p>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="pt-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Select Payment Method</h3>
              <div className="grid gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <motion.button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full bg-white border-2 ${isSelected ? 'border-brand-primary shadow-xl shadow-brand-primary/5' : 'border-gray-100'} rounded-[2rem] p-6 flex items-center justify-between transition-all group overflow-hidden relative`}
                    >
                      {isSelected && <div className="absolute top-0 right-0 w-2 h-full bg-brand-primary" />}
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 font-black rounded-2xl flex items-center justify-center shadow-inner border border-gray-100 ${isSelected ? 'bg-brand-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-black text-gray-900 tracking-tight">{method.title}</p>
                            {method.recommended && (
                              <span className="text-[9px] bg-brand-success text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-md shadow-brand-success/20">Recommended</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">{method.subtitle}</p>
                          {method.discount && <p className="text-[11px] font-black mt-1 text-brand-cta uppercase tracking-widest">{method.discount}</p>}
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-brand-primary bg-brand-primary scale-110 shadow-lg shadow-brand-primary/20' : 'border-gray-200 group-hover:border-brand-primary/30'}`}>
                        {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Mock Payment Controls */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-700">Mock Payment Result</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMockPaymentResult('success')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      mockPaymentResult === 'success' 
                        ? 'bg-brand-success text-white' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    Success
                  </button>
                  <button
                    onClick={() => setMockPaymentResult('failure')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      mockPaymentResult === 'failure' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    Failure
                  </button>
                </div>
              </div>
              
              {mockPaymentResult === 'failure' && (
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                    Failure Reason
                  </label>
                  <select
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-medium bg-white"
                  >
                    <option value="Insufficient balance">Insufficient balance</option>
                    <option value="Card declined">Card declined</option>
                    <option value="Network error">Network error</option>
                    <option value="Payment timeout">Payment timeout</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-700">Voice Announcements</span>
                <button
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (!voiceEnabled) {
                      speak('Voice announcements enabled');
                    }
                  }}
                  className={`p-2 rounded-full transition-all ${voiceEnabled ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          {/* Right: Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 sticky top-24">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Final Trip Summary</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Route</span>
                  <span className="font-black text-gray-900 tracking-tight">{currentTrip?.route?.from?.name || 'Start'} → {currentTrip?.route?.to?.name || 'Dest'}</span>
                </div>
                <div className="h-px bg-gray-50" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Duration</span>
                  <span className="font-black text-gray-900 tracking-tight">{currentTrip?.route?.time || '25 min'}</span>
                </div>
                <div className="h-px bg-gray-50" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Vehicle</span>
                  <span className="font-black text-gray-900 tracking-tight">{currentTrip?.vehicle?.name || 'Auto'}</span>
                </div>
                <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                  <span className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Grand Total</span>
                  <span className="font-black text-3xl text-gray-900 tracking-tighter">₹{finalAmount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3 text-gray-400 mt-8">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secure encrypted payment</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || (selectedMethod === 'wallet' && walletBalance < finalAmount)}
                className="w-full mt-6 bg-brand-cta text-white py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-cta/30 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span className="tracking-widest">PROCESSING</span>
                  </div>
                ) : selectedMethod === 'wallet' && walletBalance < finalAmount ? (
                  'INSUFFICIENT FUNDS'
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>PAY ₹{finalAmount} NOW</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </button>

              {selectedMethod === 'wallet' && walletBalance < finalAmount && (
                <button className="w-full mt-4 bg-white text-brand-primary border-2 border-brand-primary/10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-brand-primary/5 transition-all">
                  Topup ₹{finalAmount - walletBalance}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
