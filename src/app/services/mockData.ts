// Mock data that mirrors the backend API responses
// Used as fallback when the backend is not running

export const mockLocations = [
  { id: 'koramangala', name: 'Koramangala', city: 'Bangalore' },
  { id: 'mg-road', name: 'MG Road', city: 'Bangalore' },
  { id: 'marathahalli', name: 'Marathahalli', city: 'Bangalore' },
  { id: 'whitefield', name: 'Whitefield', city: 'Bangalore' },
  { id: 'indiranagar', name: 'Indiranagar', city: 'Bangalore' },
  { id: 'hsr-layout', name: 'HSR Layout', city: 'Bangalore' },
  { id: 'electronic-city', name: 'Electronic City', city: 'Bangalore' },
  { id: 'airport', name: 'Airport', city: 'Bangalore' },
  { id: 'andheri', name: 'Andheri', city: 'Mumbai' },
  { id: 'bandra', name: 'Bandra', city: 'Mumbai' },
  { id: 'csmt', name: 'CSMT', city: 'Mumbai' },
  { id: 'dadar', name: 'Dadar', city: 'Mumbai' },
];

export const mockUser = {
  id: 'user-1',
  name: 'Sarang',
  email: 'sarang@transittwin.com',
  wallet: 500,
  preferences: { preferredMode: 'balanced', maxWalk: 1.5 },
  savedRoutes: [
    { id: 'home', name: 'Home', from: 'koramangala', to: 'mg-road' },
    { id: 'work', name: 'Work', from: 'hsr-layout', to: 'whitefield' },
  ],
  createdAt: new Date().toISOString(),
};

export function mockFindRoutes(from: string, to: string) {
  const fromLoc = mockLocations.find(l => l.id === from) || { id: from, name: from, city: 'Bangalore' };
  const toLoc = mockLocations.find(l => l.id === to) || { id: to, name: to, city: 'Bangalore' };

  return {
    from: fromLoc,
    to: toLoc,
    distance: 12.5,
    routes: [
      {
        id: 'route-balanced-1',
        type: 'balanced',
        title: 'Balanced Route',
        subtitle: 'Best of both worlds',
        time: '35 min',
        timeMinutes: 35,
        cost: 85,
        savings: 65,
        distance: 12.5,
        legs: [
          { id: 'leg-0', mode: 'walk', modeName: 'Walk', icon: '🚶', color: '#666666', distance: 0.5, duration: 6, cost: 0, instructions: 'Walk 0.5km to metro station', stops: 0, waitTime: 0 },
          { id: 'leg-1', mode: 'metro', modeName: 'Metro', icon: '🚇', color: '#0066CC', distance: 8.2, duration: 14, cost: 35, instructions: 'Take Metro Line A for 8.2km', stops: 5, waitTime: 3 },
          { id: 'leg-2', mode: 'auto', modeName: 'Auto', icon: '🛺', color: '#FFAA00', distance: 3.8, duration: 9, cost: 50, instructions: 'Auto ride: 3.8km to destination', stops: 0, waitTime: 0 },
        ],
        traffic: 'Medium',
        weather: 'Good',
        icon: '⚖️',
        color: '#FF8800',
      },
      {
        id: 'route-fastest-1',
        type: 'fastest',
        title: 'Fastest Route',
        subtitle: 'Get there quickest',
        time: '22 min',
        timeMinutes: 22,
        cost: 150,
        savings: 0,
        distance: 12.5,
        legs: [
          { id: 'leg-0', mode: 'walk', modeName: 'Walk', icon: '🚶', color: '#666666', distance: 0.3, duration: 4, cost: 0, instructions: 'Walk 0.3km to pickup', stops: 0, waitTime: 0 },
          { id: 'leg-1', mode: 'cab', modeName: 'Cab', icon: '🚕', color: '#CC0000', distance: 12.2, duration: 18, cost: 150, instructions: 'Cab ride: 12.2km direct', stops: 0, waitTime: 0 },
        ],
        traffic: 'Medium',
        weather: 'Good',
        icon: '⚡',
        color: '#0066FF',
      },
      {
        id: 'route-cheapest-1',
        type: 'cheapest',
        title: 'Cheapest Route',
        subtitle: 'Save ₹105 vs fastest',
        time: '52 min',
        timeMinutes: 52,
        cost: 45,
        savings: 105,
        distance: 12.5,
        legs: [
          { id: 'leg-0', mode: 'walk', modeName: 'Walk', icon: '🚶', color: '#666666', distance: 1.2, duration: 14, cost: 0, instructions: 'Walk 1.2km to bus stop', stops: 0, waitTime: 0 },
          { id: 'leg-1', mode: 'bus', modeName: 'Bus', icon: '🚌', color: '#00AA00', distance: 6.5, duration: 20, cost: 20, instructions: 'Take Bus route 335 for 6.5km', stops: 8, waitTime: 4 },
          { id: 'leg-2', mode: 'metro', modeName: 'Metro', icon: '🚇', color: '#0066CC', distance: 3.5, duration: 7, cost: 20, instructions: 'Take Metro Line B for 3.5km', stops: 3, waitTime: 3 },
          { id: 'leg-3', mode: 'walk', modeName: 'Walk', icon: '🚶', color: '#666666', distance: 1.3, duration: 7, cost: 5, instructions: 'Walk 1.3km to destination', stops: 0, waitTime: 0 },
        ],
        traffic: 'Low',
        weather: 'Good',
        icon: '💰',
        color: '#00AA44',
      },
    ],
  };
}

export function mockGetTrips() {
  return {
    trips: [
      {
        id: 'trip-1',
        userId: 'user-1',
        route: {
          from: { name: 'Koramangala' },
          to: { name: 'MG Road' },
          time: '25 min',
        },
        vehicle: { name: 'Auto', icon: '🛺', rating: 4.8 },
        fare: 85,
        savings: 65,
        status: 'completed',
        rating: 4.5,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'trip-2',
        userId: 'user-1',
        route: {
          from: { name: 'HSR Layout' },
          to: { name: 'Whitefield' },
          time: '45 min',
        },
        vehicle: { name: 'Metro + Bus', icon: '🚇', rating: 4.6 },
        fare: 55,
        savings: 120,
        status: 'completed',
        rating: 5,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'trip-3',
        userId: 'user-1',
        route: {
          from: { name: 'Indiranagar' },
          to: { name: 'Airport' },
          time: '55 min',
        },
        vehicle: { name: 'Cab', icon: '🚕', rating: 4.9 },
        fare: 350,
        savings: 0,
        status: 'completed',
        rating: 4.8,
        createdAt: new Date(Date.now() - 432000000).toISOString(),
      },
      {
        id: 'trip-4',
        userId: 'user-1',
        route: {
          from: { name: 'Marathahalli' },
          to: { name: 'Electronic City' },
          time: '35 min',
        },
        vehicle: { name: 'Bike', icon: '🏍️', rating: 4.7 },
        fare: 120,
        savings: 80,
        status: 'cancelled',
        createdAt: new Date(Date.now() - 604800000).toISOString(),
      },
    ],
  };
}

export function mockGetWallet() {
  return { balance: 500 };
}

export function mockGetInsights() {
  return {
    insights: {
      summary: {
        totalTrips: 24,
        totalSavings: 1850,
        totalSpent: 3200,
        avgTripCost: 133,
        favoriteMode: 'Metro',
      },
      streak: { current: 5, best: 12 },
      comparison: {
        savings: 1850,
        message: 'You saved ₹1,850 this month by choosing smart multi-modal routes!',
      },
      achievements: [
        { id: 'ach-1', name: 'First Ride', description: 'Completed your first trip!', icon: '🎉' },
        { id: 'ach-2', name: 'Saver Star', description: 'Saved ₹500+ on rides', icon: '⭐' },
        { id: 'ach-3', name: 'Metro Master', description: 'Took 10+ metro rides', icon: '🚇' },
        { id: 'ach-4', name: 'Green Commuter', description: 'Used public transit 20+ times', icon: '🌿' },
        { id: 'ach-5', name: 'Explorer', description: 'Visited 5+ locations', icon: '🗺️' },
        { id: 'ach-6', name: 'Streak King', description: '5-day ride streak!', icon: '🔥' },
      ],
      weekly: {
        trips: 6,
        savings: 420,
        avgTripTime: 32,
      },
    },
  };
}

export function mockGetTripTracking(tripId: string) {
  return {
    trip: {
      id: tripId,
      status: 'in_progress',
      progress: 45,
      currentLeg: {
        id: 'leg-1',
        mode: 'metro',
        modeName: 'Metro',
        icon: '🚇',
      },
      estimatedArrival: new Date(Date.now() + 1200000).toISOString(),
    },
  };
}

export function mockCreateTrip(route: any, vehicle: any, paymentMethod: string) {
  return {
    trip: {
      id: 'trip-' + Date.now(),
      userId: 'user-1',
      route,
      vehicle,
      fare: route.cost || 85,
      savings: route.savings || 0,
      paymentMethod,
      status: 'in_progress',
      progress: 0,
      currentLeg: route.legs?.[0] || null,
      estimatedArrival: new Date(Date.now() + (route.timeMinutes || 30) * 60000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  };
}
