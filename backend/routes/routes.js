import { Router } from 'express';
import { db } from '../data/database.js';

const router = Router();

// Smart Multi-Modal Route Finder
function findMultiModalRoutes(from, to, preferences = {}) {
  const distance = db.getLocationDistance(from, to);
  const fromLoc = db.locations[from];
  const toLoc = db.locations[to];
  
  // Generate 3 optimized routes: Fastest, Cheapest, Balanced
  const routes = [];

  // 1. FASTEST ROUTE (more cabs/autos, less walking)
  const fastestLegs = generateOptimalLegs(distance, 'fastest');
  const fastestTime = calculateTotalTime(fastestLegs);
  const fastestCost = calculateTotalCost(fastestLegs);
  
  routes.push({
    id: db.generateRouteId(),
    type: 'fastest',
    title: 'Fastest Route',
    subtitle: 'Get there quickest',
    time: formatDuration(fastestTime),
    timeMinutes: fastestTime,
    cost: fastestCost,
    savings: 0,
    legs: fastestLegs,
    traffic: getTrafficCondition(),
    weather: 'Good',
    icon: '⚡',
    color: '#0066FF',
  });

  // 2. CHEAPEST ROUTE (more public transport)
  const cheapestLegs = generateOptimalLegs(distance, 'cheapest');
  const cheapestTime = calculateTotalTime(cheapestLegs);
  const cheapestCost = calculateTotalCost(cheapestLegs);
  
  routes.push({
    id: db.generateRouteId(),
    type: 'cheapest',
    title: 'Cheapest Route',
    subtitle: `Save ₹${fastestCost - cheapestCost} vs fastest`,
    time: formatDuration(cheapestTime),
    timeMinutes: cheapestTime,
    cost: cheapestCost,
    savings: fastestCost - cheapestCost,
    legs: cheapestLegs,
    traffic: 'Low',
    weather: 'Good',
    icon: '💰',
    color: '#00AA44',
  });

  // 3. BALANCED ROUTE (mix of speed and cost)
  const balancedLegs = generateOptimalLegs(distance, 'balanced');
  const balancedTime = calculateTotalTime(balancedLegs);
  const balancedCost = calculateTotalCost(balancedLegs);
  
  routes.push({
    id: db.generateRouteId(),
    type: 'balanced',
    title: 'Balanced Route',
    subtitle: 'Best of both worlds',
    time: formatDuration(balancedTime),
    timeMinutes: balancedTime,
    cost: balancedCost,
    savings: fastestCost - balancedCost,
    legs: balancedLegs,
    traffic: 'Medium',
    weather: 'Good',
    icon: '⚖️',
    color: '#FF8800',
  });

  return {
    from: fromLoc,
    to: toLoc,
    distance: Math.round(distance * 10) / 10,
    routes: routes.sort((a, b) => {
      // Default sort: balanced first, then fastest, then cheapest
      const order = { balanced: 0, fastest: 1, cheapest: 2 };
      return order[a.type] - order[b.type];
    }),
  };
}

function generateOptimalLegs(distance, optimization) {
  const legs = [];
  let remainingDistance = distance;
  let currentLeg = 0;
  
  // Walking threshold based on optimization
  const maxWalk = optimization === 'fastest' ? 0.3 : optimization === 'cheapest' ? 1.5 : 0.8;
  
  while (remainingDistance > 0.1 && currentLeg < 5) {
    let mode, legDistance;
    
    if (currentLeg === 0 && remainingDistance > 1) {
      // First mile - walk to pickup point
      legDistance = Math.min(0.5, remainingDistance * 0.1);
      mode = 'walk';
    } else if (remainingDistance <= maxWalk && currentLeg > 0) {
      // Last mile walk
      legDistance = remainingDistance;
      mode = 'walk';
    } else {
      // Main transport based on optimization
      if (optimization === 'fastest') {
        if (remainingDistance > 5) {
          mode = Math.random() > 0.5 ? 'metro' : 'cab';
        } else {
          mode = 'bike';
        }
      } else if (optimization === 'cheapest') {
        if (remainingDistance > 8) {
          mode = Math.random() > 0.6 ? 'train' : 'metro';
        } else if (remainingDistance > 3) {
          mode = 'bus';
        } else {
          mode = 'auto';
        }
      } else {
        // Balanced
        if (remainingDistance > 6) {
          mode = Math.random() > 0.5 ? 'metro' : 'train';
        } else if (remainingDistance > 2) {
          mode = Math.random() > 0.5 ? 'bus' : 'auto';
        } else {
          mode = 'bike';
        }
      }
      legDistance = Math.min(remainingDistance * (0.4 + Math.random() * 0.4), remainingDistance);
    }
    
    legDistance = Math.round(legDistance * 10) / 10;
    const transport = db.transportModes[mode];
    const duration = Math.round((legDistance / transport.speedKmh) * 60);
    const cost = Math.round(legDistance * transport.costPerKm);
    
    legs.push({
      id: `leg-${currentLeg}`,
      mode: mode,
      modeName: transport.name,
      icon: transport.icon,
      color: transport.color,
      distance: legDistance,
      duration: duration,
      cost: cost,
      instructions: generateInstructions(mode, legDistance, currentLeg),
      stops: mode === 'metro' || mode === 'train' || mode === 'bus' ? Math.floor(legDistance / 2) + 1 : 0,
      waitTime: ['metro', 'train', 'bus'].includes(mode) ? Math.floor(Math.random() * 5) + 2 : 0,
    });
    
    remainingDistance -= legDistance;
    currentLeg++;
  }
  
  return legs;
}

function generateInstructions(mode, distance, legIndex) {
  const instructions = {
    walk: [`Walk ${distance}km to pickup point`, `Continue walking for ${distance}km`, `Walk ${distance}km to destination`],
    metro: [`Take Metro for ${distance}km`, `Board Metro Line ${String.fromCharCode(65 + legIndex)}`, `Metro ride: ${distance}km`],
    train: [`Take Local Train ${distance}km`, `Board train towards destination`, `Train journey: ${distance}km`],
    bus: [`Take Bus for ${distance}km`, `Board bus route ${Math.floor(Math.random() * 500) + 1}`, `Bus ride: ${distance}km`],
    auto: [`Auto ride: ${distance}km`, `Take auto-rickshaw ${distance}km`, `Auto: ${distance}km`],
    cab: [`Cab ride: ${distance}km`, `Book cab for ${distance}km`, `Taxi: ${distance}km`],
    bike: [`Bike ride: ${distance}km`, `Take bike taxi ${distance}km`, `Two-wheeler: ${distance}km`],
  };
  
  const list = instructions[mode] || instructions.walk;
  return list[legIndex % list.length];
}

function calculateTotalTime(legs) {
  return legs.reduce((total, leg) => total + leg.duration + leg.waitTime, 0);
}

function calculateTotalCost(legs) {
  return legs.reduce((total, leg) => total + leg.cost, 0);
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function getTrafficCondition() {
  const conditions = ['Low', 'Medium', 'Heavy'];
  const weights = [0.4, 0.4, 0.2];
  const rand = Math.random();
  if (rand < weights[0]) return 'Low';
  if (rand < weights[0] + weights[1]) return 'Medium';
  return 'Heavy';
}

// GET available locations
router.get('/locations', (req, res) => {
  const locations = Object.entries(db.locations).map(([id, loc]) => ({
    id,
    name: loc.name,
    city: loc.city,
  }));
  res.json({ locations });
});

// POST find routes
router.post('/find', (req, res) => {
  const { from, to, preference, userId } = req.body;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'From and To locations required' });
  }
  
  if (!db.locations[from] || !db.locations[to]) {
    return res.status(400).json({ error: 'Invalid locations' });
  }
  
  const result = findMultiModalRoutes(from, to, { preference });
  
  // Log search for insights
  if (userId) {
    const user = db.users.get(userId);
    if (user) {
      if (!user.searchHistory) user.searchHistory = [];
      user.searchHistory.push({
        from, to, preference,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  res.json(result);
});

// GET route details
router.get('/:routeId', (req, res) => {
  // In a real app, we'd fetch from database
  res.json({ message: 'Route details endpoint' });
});

// GET real-time updates for a route
router.get('/:routeId/updates', (req, res) => {
  const updates = {
    delays: Math.random() > 0.7 ? [{ leg: 1, delay: Math.floor(Math.random() * 10) + 5 }] : [],
    traffic: getTrafficCondition(),
    weather: 'Good',
    timestamp: new Date().toISOString(),
  };
  res.json(updates);
});

export default router;
