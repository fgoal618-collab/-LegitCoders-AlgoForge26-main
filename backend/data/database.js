// In-memory database for TransitWin
class Database {
  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.savedRoutes = new Map();
    this.transportModes = {
      metro: { name: 'Metro', costPerKm: 12, speedKmh: 35, icon: '🚇', color: '#0066CC' },
      train: { name: 'Train', costPerKm: 8, speedKmh: 50, icon: '🚆', color: '#FF6600' },
      bus: { name: 'Bus', costPerKm: 5, speedKmh: 20, icon: '🚌', color: '#00AA00' },
      auto: { name: 'Auto', costPerKm: 15, speedKmh: 25, icon: '🛺', color: '#FFAA00' },
      cab: { name: 'Cab', costPerKm: 25, speedKmh: 30, icon: '🚕', color: '#CC0000' },
      bike: { name: 'Bike', costPerKm: 8, speedKmh: 30, icon: '🏍️', color: '#FF6600' },
      walk: { name: 'Walk', costPerKm: 0, speedKmh: 5, icon: '🚶', color: '#666666' },
    };
    
    // Sample locations (Bangalore/Mumbai focused)
    this.locations = {
      'koramangala': { name: 'Koramangala', lat: 12.9352, lng: 77.6245, city: 'Bangalore' },
      'mg-road': { name: 'MG Road', lat: 12.9766, lng: 77.5993, city: 'Bangalore' },
      'marathahalli': { name: 'Marathahalli', lat: 12.9591, lng: 77.6974, city: 'Bangalore' },
      'whitefield': { name: 'Whitefield', lat: 12.9698, lng: 77.7500, city: 'Bangalore' },
      'indiranagar': { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, city: 'Bangalore' },
      'hsr-layout': { name: 'HSR Layout', lat: 12.9081, lng: 77.6476, city: 'Bangalore' },
      'electronic-city': { name: 'Electronic City', lat: 12.8458, lng: 77.6715, city: 'Bangalore' },
      'airport': { name: 'Airport', lat: 13.1986, lng: 77.7066, city: 'Bangalore' },
      'andheri': { name: 'Andheri', lat: 19.1136, lng: 72.8697, city: 'Mumbai' },
      'bandra': { name: 'Bandra', lat: 19.0596, lng: 72.8295, city: 'Mumbai' },
      'csmt': { name: 'CSMT', lat: 18.9438, lng: 72.8358, city: 'Mumbai' },
      'dadar': { name: 'Dadar', lat: 19.0178, lng: 72.8478, city: 'Mumbai' },
    };
    
    this.initSampleData();
  }

  initSampleData() {
    // Sample user
    this.users.set('user-1', {
      id: 'user-1',
      name: 'Nivedita',
      email: 'user@transitwin.com',
      wallet: 500,
      preferences: { preferredMode: 'balanced', maxWalk: 1.5 },
      savedRoutes: [
        { id: 'home', name: 'Home', from: 'koramangala', to: 'mg-road' },
        { id: 'work', name: 'Work', from: 'hsr-layout', to: 'whitefield' },
      ],
      createdAt: new Date().toISOString(),
    });
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getLocationDistance(fromId, toId) {
    const from = this.locations[fromId];
    const to = this.locations[toId];
    if (!from || !to) return 10; // Default 10km
    return this.calculateDistance(from.lat, from.lng, to.lat, to.lng);
  }

  generateRouteId() {
    return 'route-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  generateTripId() {
    return 'trip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

export const db = new Database();
