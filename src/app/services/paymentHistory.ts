// Payment History Service — localStorage-backed payment transactions
import { STORAGE_KEYS } from '../utils/constants';

export interface PaymentTransaction {
  id: string;
  tripId: string;
  amount: number;
  method: 'wallet' | 'upi' | 'cash' | 'card';
  status: 'success' | 'failed' | 'pending';
  from: string;
  to: string;
  distance: number;
  duration: number;
  timestamp: number;
  discount?: number;
  vehicleType?: string;
}

const PAYMENT_STORAGE_KEY = 'algoforge_payments';

function getPayments(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(payments: PaymentTransaction[]) {
  localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
}

export function recordPayment(payment: Omit<PaymentTransaction, 'id'>): PaymentTransaction {
  const transaction: PaymentTransaction = {
    ...payment,
    id: `payment-${Date.now()}`,
  };
  const payments = getPayments();
  payments.unshift(transaction);
  persist(payments.slice(0, 500)); // keep last 500
  return transaction;
}

export function getPaymentHistory(): PaymentTransaction[] {
  return getPayments().sort((a, b) => b.timestamp - a.timestamp);
}

export function getPaymentStats() {
  const payments = getPayments().filter(p => p.status === 'success');
  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalTrips = payments.length;
  const totalDistance = payments.reduce((sum, p) => sum + p.distance, 0);
  const totalDiscount = payments.reduce((sum, p) => sum + (p.discount || 0), 0);
  const avgFare = totalTrips > 0 ? total / totalTrips : 0;

  return { total, totalTrips, totalDistance, totalDiscount, avgFare };
}

export function getPaymentsByMonth(months: number = 3) {
  const payments = getPayments().filter(p => p.status === 'success');
  const now = Date.now();
  const cutoff = now - months * 30 * 24 * 60 * 60 * 1000;
  return payments.filter(p => p.timestamp >= cutoff);
}

export function deletePayment(id: string) {
  persist(getPayments().filter(p => p.id !== id));
}

export function clearAllPayments() {
  localStorage.removeItem(PAYMENT_STORAGE_KEY);
}
