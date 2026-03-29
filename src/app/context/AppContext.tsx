// AppContext — simplified for transit planning (no booking/payment logic)
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { findTransitRoutes, getAllLocations } from '../services/transitService';
import type { RouteResult } from '../types/transit';

interface AppState {
  currentRoute: RouteResult | null;
  selectedRoute: any | null;
  currentTrip: any | null;
  locations: { id: string; name: string; lat: number; lng: number; lines: string[] }[];
  isLoading: boolean;
  user: any | null;
  insights: any | null;
}

interface AppContextType extends AppState {
  loadLocations: () => void;
  findRoutes: (from: string, to: string) => void;
  setSelectedRoute: (route: any | null) => void;
  setCurrentTrip: (trip: any | null) => void;
  bookTrip: (vehicle: any, paymentMode: string) => Promise<void>;
  loadUser: () => Promise<void>;
  loadInsights: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentRoute: null,
    selectedRoute: null,
    currentTrip: null,
    locations: [],
    isLoading: false,
    user: null,
    insights: null,
  });

  const loadLocations = useCallback(() => {
    const locations = getAllLocations();
    setState(prev => ({ ...prev, locations }));
  }, []);

  const findRoutes = useCallback((from: string, to: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const result = findTransitRoutes(from, to);
    setState(prev => ({ ...prev, currentRoute: result, isLoading: false }));
  }, []);

  const setSelectedRoute = useCallback((selectedRoute: any | null) => {
    setState(prev => ({ ...prev, selectedRoute }));
  }, []);

  const setCurrentTrip = useCallback((currentTrip: any | null) => {
    setState(prev => ({ ...prev, currentTrip }));
  }, []);

  const loadInsights = useCallback(async () => {
    setState(prev => ({
      ...prev,
      insights: {
        summary: { totalTrips: 4, completedTrips: 4, totalSavings: 750, totalSpent: 90, totalDistance: 65, totalTime: 122, averageTripCost: 23 },
        weekly: { trips: 2, savings: 200, timeMinutes: 37, avgTripTime: 19 },
        streak: { current: 3, message: '🔥 3 day streak! Keep it up!' },
        achievements: [
          { id: 'first-trip', name: 'First Journey', icon: '🎯', description: 'Completed your first trip' },
          { id: 'saver', name: 'Money Saver', icon: '💰', description: 'Saved ₹500+' },
        ],
      }
    }));
  }, []);

  const loadUser = useCallback(async () => {
    setState(prev => ({
      ...prev,
      user: {
        id: 'user-1',
        name: 'Sarang Gole',
        email: 'sarang@example.com',
        avatar: 'https://github.com/shadcn.png',
        wallet: { balance: 1450, currency: 'INR' }
      }
    }));
  }, []);

  const bookTrip = useCallback(async (vehicle: any, paymentMode: string) => {
    setState(prev => ({
      ...prev,
      currentTrip: {
        id: `TRIP-${Math.floor(Math.random() * 10000)}`,
        vehicle,
        fare: vehicle.cost,
        progress: 0,
        status: 'active',
        route: prev.selectedRoute,
        paymentMode,
        timestamp: new Date().toISOString()
      }
    }));
  }, []);

  return (
    <AppContext.Provider value={{ ...state, loadLocations, findRoutes, setSelectedRoute, setCurrentTrip, bookTrip, loadUser, loadInsights }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
