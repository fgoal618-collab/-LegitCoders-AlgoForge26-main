import { Router } from 'express';
import { db } from '../data/database.js';

const router = Router();

// GET all trips for user
router.get('/user/:userId', (req, res) => {
  const userTrips = Array.from(db.trips.values())
    .filter(trip => trip.userId === req.params.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({ trips: userTrips });
});

// POST create new trip
router.post('/', (req, res) => {
  const { userId, route, vehicle, paymentMethod } = req.body;
  
  const trip = {
    id: db.generateTripId(),
    userId,
    route,
    vehicle,
    paymentMethod,
    status: 'active',
    progress: 0,
    currentLeg: 0,
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + route.timeMinutes * 60000).toISOString(),
    actualArrival: null,
    fare: vehicle ? vehicle.cost : route.cost,
    savings: route.savings || 0,
    liveTracking: {
      active: true,
      lastUpdate: new Date().toISOString(),
      currentLocation: route.from,
    },
  };
  
  db.trips.set(trip.id, trip);
  
  // Deduct from wallet if wallet payment
  if (paymentMethod === 'wallet') {
    const user = db.users.get(userId);
    if (user) {
      user.wallet -= trip.fare;
    }
  }
  
  res.json({ success: true, trip });
});

// GET trip details
router.get('/:tripId', (req, res) => {
  const trip = db.trips.get(req.params.tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  res.json({ trip });
});

// GET live tracking data
router.get('/:tripId/tracking', (req, res) => {
  const trip = db.trips.get(req.params.tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  
  // Simulate progress
  const elapsed = Date.now() - new Date(trip.startedAt).getTime();
  const total = trip.route.timeMinutes * 60000;
  trip.progress = Math.min(100, Math.round((elapsed / total) * 100));
  
  // Calculate current leg
  const legProgress = trip.route.legs.map((leg, idx) => {
    const previousLegsTime = trip.route.legs.slice(0, idx).reduce((sum, l) => sum + l.duration + l.waitTime, 0);
    const legStartPercent = (previousLegsTime / trip.route.timeMinutes) * 100;
    const legPercent = ((leg.duration + leg.waitTime) / trip.route.timeMinutes) * 100;
    return { leg, start: legStartPercent, end: legStartPercent + legPercent };
  });
  
  const current = legProgress.find(lp => trip.progress >= lp.start && trip.progress < lp.end);
  trip.currentLeg = current ? current.leg : trip.route.legs[trip.route.legs.length - 1];
  
  // Update live tracking
  trip.liveTracking.lastUpdate = new Date().toISOString();
  trip.liveTracking.progress = trip.progress;
  
  // Check if arrived
  if (trip.progress >= 100) {
    trip.status = 'completed';
    trip.actualArrival = new Date().toISOString();
    trip.liveTracking.active = false;
  }
  
  res.json({
    trip: {
      id: trip.id,
      status: trip.status,
      progress: trip.progress,
      currentLeg: trip.currentLeg,
      estimatedArrival: trip.estimatedArrival,
      liveTracking: trip.liveTracking,
    },
  });
});

// POST update trip status
router.post('/:tripId/status', (req, res) => {
  const { status } = req.body;
  const trip = db.trips.get(req.params.tripId);
  
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  
  trip.status = status;
  if (status === 'completed') {
    trip.actualArrival = new Date().toISOString();
    trip.liveTracking.active = false;
  } else if (status === 'cancelled') {
    trip.liveTracking.active = false;
    // Refund if needed
    if (trip.paymentMethod === 'wallet') {
      const user = db.users.get(trip.userId);
      if (user) {
        user.wallet += trip.fare;
      }
    }
  }
  
  res.json({ success: true, trip });
});

// POST rate trip
router.post('/:tripId/rate', (req, res) => {
  const { rating, feedback } = req.body;
  const trip = db.trips.get(req.params.tripId);
  
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  
  trip.rating = rating;
  trip.feedback = feedback;
  
  res.json({ success: true });
});

export default router;
