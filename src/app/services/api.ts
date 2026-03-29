import { getAllLocations, findTransitRoutes, findNearestStation, transitLines, allStations } from '../data/transitData';

const BASE_URL = 'http://localhost:3001/api';

class TransitAPI {
  private userId = 'user-1';

  private async fetchJson(url: string, options?: RequestInit) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  async getLocations() {
    // Use real CSV data directly — no backend needed
    const locations = getAllLocations();
    return { locations };
  }

  async findRoutes(from: string, to: string, _preference = 'balanced') {
    // Use real CSV data route-finding algorithm
    const result = findTransitRoutes(from, to);
    return result;
  }

  async getUser() {
    try {
      return await this.fetchJson(`${BASE_URL}/users/${this.userId}`);
    } catch {
      return {
        user: {
          id: 'user-1',
          name: 'Sarang',
          email: 'sarang@transittwin.com',
          wallet: 750,
          preferences: { preferredMode: 'metro', maxWalkDistance: 500, notifications: true },
        },
      };
    }
  }

  async getTrips() {
    try {
      return await this.fetchJson(`${BASE_URL}/trips/user/${this.userId}`);
    } catch {
      return {
        trips: [
          { id: 't1', route: { from: 'CSMT', to: 'Dadar', legs: [{ mode: 'train', from: 'CSMT', to: 'Dadar', line: 'Central Line', lineColor: '#E53935', duration: 15, distance: 8, cost: 10, stops: 7, waitTime: 3, icon: '🚆' }], timeMinutes: 15, distance: 8, savings: 120 }, vehicle: { type: 'train', name: 'Local Train' }, fare: 10, savings: 120, rating: 4.5, status: 'completed', createdAt: '2026-03-27T08:30:00Z', paymentMethod: 'wallet' },
          { id: 't2', route: { from: 'Andheri', to: 'Ghatkopar', legs: [{ mode: 'metro', from: 'Andheri', to: 'Ghatkopar', line: 'Metro Line 1', lineColor: '#43A047', duration: 22, distance: 9, cost: 40, stops: 8, waitTime: 2, icon: '🚇' }], timeMinutes: 22, distance: 9, savings: 80 }, vehicle: { type: 'metro', name: 'Metro' }, fare: 40, savings: 80, rating: 5, status: 'completed', createdAt: '2026-03-26T17:00:00Z', paymentMethod: 'upi' },
          { id: 't3', route: { from: 'Churchgate', to: 'Bandra', legs: [{ mode: 'train', from: 'Churchgate', to: 'Bandra', line: 'Western Line', lineColor: '#1E88E5', duration: 30, distance: 14, cost: 15, stops: 11, waitTime: 4, icon: '🚆' }], timeMinutes: 30, distance: 14, savings: 200 }, vehicle: { type: 'train', name: 'Local Train' }, fare: 15, savings: 200, rating: 4.8, status: 'completed', createdAt: '2026-03-25T09:00:00Z', paymentMethod: 'wallet' },
          { id: 't4', route: { from: 'Thane', to: 'CSMT', legs: [{ mode: 'train', from: 'Thane', to: 'CSMT', line: 'Central Line', lineColor: '#E53935', duration: 55, distance: 34, cost: 25, stops: 18, waitTime: 5, icon: '🚆' }], timeMinutes: 55, distance: 34 }, vehicle: { type: 'train', name: 'Local Train' }, fare: 25, savings: 350, rating: 4.2, status: 'completed', createdAt: '2026-03-23T07:00:00Z', paymentMethod: 'cash' },
        ],
      };
    }
  }

  async getInsights() {
    try {
      return await this.fetchJson(`${BASE_URL}/insights/${this.userId}`);
    } catch {
      return {
        insights: {
          summary: { totalTrips: 4, completedTrips: 4, totalSavings: 750, totalSpent: 90, totalDistance: 65, totalTime: 122, averageTripCost: 23 },
          weekly: { trips: 2, savings: 200, timeMinutes: 37, avgTripTime: 19 },
          transportModes: [
            { mode: 'train', name: 'Local Train', icon: '🚆', count: 3, percentage: 75 },
            { mode: 'metro', name: 'Metro', icon: '🚇', count: 1, percentage: 25 },
          ],
          comparison: { vsCab: 750, message: "You've saved ₹750 compared to taking cabs everywhere!" },
          streak: { current: 3, message: '🔥 3 day streak! Keep it up!' },
          achievements: [
            { id: 'first-trip', name: 'First Journey', icon: '🎯', description: 'Completed your first trip' },
            { id: 'saver', name: 'Money Saver', icon: '💰', description: 'Saved ₹500+' },
          ],
        },
      };
    }
  }

  async createTrip(route: any, vehicle: any, paymentMethod: string) {
    try {
      return await this.fetchJson(`${BASE_URL}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId, route, vehicle, paymentMethod }),
      });
    } catch {
      return {
        success: true,
        trip: {
          id: `trip-${Date.now()}`,
          userId: this.userId,
          route,
          vehicle,
          paymentMethod,
          status: 'active',
          progress: 0,
          fare: vehicle?.cost || route.cost,
          savings: route.savings || 0,
          createdAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          estimatedArrival: new Date(Date.now() + route.timeMinutes * 60000).toISOString(),
          liveTracking: { active: true, lastUpdate: new Date().toISOString(), currentLocation: route.from },
        },
      };
    }
  }

  async getVehicles(routeId: string) {
    try {
      return await this.fetchJson(`${BASE_URL}/vehicles?routeId=${routeId}`);
    } catch {
      return {
        vehicles: {
          recommended: { id: 'v-rec', type: 'train', name: 'Mumbai Local', icon: '🚆', cost: 15, eta: '3 min', rating: 4.5, features: ['AC coaches available', 'Ladies special', 'Fast local option'], color: 'blue' },
          options: [
            { id: 'v1', type: 'train', name: 'Slow Local', icon: '🚆', cost: 10, eta: '5 min', rating: 4.2, features: ['All stations'], color: 'blue' },
            { id: 'v2', type: 'metro', name: 'Metro', icon: '🚇', cost: 40, eta: '2 min', rating: 4.8, features: ['AC', 'Less crowded'], color: 'green' },
            { id: 'v3', type: 'auto', name: 'Auto Rickshaw', icon: '🛺', cost: 80, eta: '1 min', rating: 4.0, features: ['Door to door'], color: 'yellow' },
            { id: 'v4', type: 'cab', name: 'Ola/Uber', icon: '🚕', cost: 180, eta: '4 min', rating: 4.6, features: ['AC', 'Door to door', 'Comfortable'], color: 'black' },
          ],
        },
      };
    }
  }

  async getWallet() {
    return { wallet: { balance: 750, currency: 'INR' } };
  }

  async processPayment(data: { tripId: string; amount: number; method: string }) {
    return {
      success: true,
      payment: {
        id: `pay-${Date.now()}`,
        amount: data.amount,
        method: data.method,
        status: 'completed',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Track trip progress (simulated)
  private _progress = 0;
  async getTripTracking(tripId: string) {
    this._progress = Math.min(100, this._progress + Math.floor(Math.random() * 8) + 3);
    return {
      trip: {
        id: tripId,
        status: this._progress >= 100 ? 'completed' : 'active',
        progress: this._progress,
      },
    };
  }

  async cancelTrip(_tripId: string) {
    this._progress = 0;
    return { success: true };
  }
}

export const api = new TransitAPI();
