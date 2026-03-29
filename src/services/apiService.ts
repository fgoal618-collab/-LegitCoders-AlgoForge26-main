// API service for connecting to TransitWin backend
const API_BASE_URL = 'http://localhost:3001/api';

// Generic fetch wrapper
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// Routes API
export async function findRoutes(from: string, to: string, preferences: Record<string, unknown> = {}) {
  return fetchAPI('/routes/find', {
    method: 'POST',
    body: JSON.stringify({ from, to, preferences }),
  });
}

export async function getRouteDetails(routeId: string) {
  return fetchAPI(`/routes/${routeId}`);
}

// Trips API
export async function getUserTrips(userId: string) {
  return fetchAPI(`/trips/user/${userId}`);
}

export async function createTrip(tripData: Record<string, unknown>) {
  return fetchAPI('/trips', {
    method: 'POST',
    body: JSON.stringify(tripData),
  });
}

export async function getTripDetails(tripId: string) {
  return fetchAPI(`/trips/${tripId}`);
}

export async function updateTripStatus(tripId: string, status: string) {
  return fetchAPI(`/trips/${tripId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function rateTrip(tripId: string, rating: number, feedback: string) {
  return fetchAPI(`/trips/${tripId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating, feedback }),
  });
}

// Live Tracking
export async function getLiveTracking(tripId: string) {
  return fetchAPI(`/trips/${tripId}/tracking`);
}

// Users API
export async function getUserProfile(userId: string) {
  return fetchAPI(`/users/${userId}`);
}

export async function updateUserProfile(userId: string, profileData: Record<string, unknown>) {
  return fetchAPI(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// Insights API
export async function getTransitInsights() {
  return fetchAPI('/insights');
}

// Health Check
export async function checkHealth() {
  return fetchAPI('/health');
}
