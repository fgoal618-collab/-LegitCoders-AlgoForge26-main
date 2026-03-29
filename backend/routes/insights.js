import { Router } from 'express';
import { db } from '../data/database.js';

const router = Router();

// GET user travel insights
router.get('/:userId', (req, res) => {
  const user = db.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const trips = Array.from(db.trips.values())
    .filter(trip => trip.userId === req.params.userId);
  
  // Calculate insights
  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const totalSavings = trips.reduce((sum, t) => sum + (t.savings || 0), 0);
  const totalSpent = trips.reduce((sum, t) => sum + (t.fare || 0), 0);
  const totalDistance = trips.reduce((sum, t) => sum + (t.route?.distance || 0), 0);
  const totalTime = trips.reduce((sum, t) => sum + (t.route?.timeMinutes || 0), 0);
  
  // Transport mode usage
  const modeUsage = {};
  trips.forEach(trip => {
    if (trip.route?.legs) {
      trip.route.legs.forEach(leg => {
        modeUsage[leg.mode] = (modeUsage[leg.mode] || 0) + 1;
      });
    }
  });
  
  const favoriteMode = Object.entries(modeUsage)
    .sort((a, b) => b[1] - a[1])[0];
  
  // Weekly stats
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyTrips = trips.filter(t => new Date(t.createdAt) > oneWeekAgo);
  const weeklySavings = weeklyTrips.reduce((sum, t) => sum + (t.savings || 0), 0);
  const weeklyTime = weeklyTrips.reduce((sum, t) => sum + (t.route?.timeMinutes || 0), 0);
  
  // Compare to cab-only travel
  const cabCostEstimate = totalDistance * db.transportModes.cab.costPerKm;
  const totalSavedVsCab = Math.round(cabCostEstimate - totalSpent);
  
  // Streak calculation
  const today = new Date().toDateString();
  const tripDates = [...new Set(trips.map(t => new Date(t.createdAt).toDateString()))];
  const streak = calculateStreak(tripDates);
  
  const insights = {
    summary: {
      totalTrips,
      completedTrips,
      totalSavings,
      totalSpent,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime,
      averageTripCost: totalTrips > 0 ? Math.round(totalSpent / totalTrips) : 0,
    },
    weekly: {
      trips: weeklyTrips.length,
      savings: weeklySavings,
      timeMinutes: weeklyTime,
      avgTripTime: weeklyTrips.length > 0 ? Math.round(weeklyTime / weeklyTrips.length) : 0,
    },
    transportModes: Object.entries(modeUsage).map(([mode, count]) => ({
      mode,
      name: db.transportModes[mode]?.name || mode,
      icon: db.transportModes[mode]?.icon || '🚗',
      count,
      percentage: totalTrips > 0 ? Math.round((count / totalTrips) * 100) : 0,
    })),
    favoriteMode: favoriteMode ? {
      mode: favoriteMode[0],
      name: db.transportModes[favoriteMode[0]]?.name || favoriteMode[0],
      count: favoriteMode[1],
    } : null,
    comparison: {
      vsCab: totalSavedVsCab,
      message: totalSavedVsCab > 0 
        ? `You've saved ₹${totalSavedVsCab} compared to taking cabs everywhere!`
        : 'Start saving by using public transport more!',
    },
    streak: {
      current: streak,
      message: streak > 1 ? `🔥 ${streak} day streak! Keep it up!` : 'Start your streak today!',
    },
    achievements: generateAchievements(totalTrips, totalSavings, streak),
  };
  
  res.json({ insights });
});

function calculateStreak(dates) {
  if (dates.length === 0) return 0;
  
  const sorted = dates.map(d => new Date(d).getTime()).sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = today.getTime();
  
  for (const date of sorted) {
    const tripDate = new Date(date);
    tripDate.setHours(0, 0, 0, 0);
    
    if (tripDate.getTime() === checkDate || 
        (streak === 0 && tripDate.getTime() === checkDate - 86400000)) {
      streak++;
      checkDate = tripDate.getTime() - 86400000;
    } else if (tripDate.getTime() < checkDate) {
      break;
    }
  }
  
  return streak;
}

function generateAchievements(trips, savings, streak) {
  const achievements = [];
  
  if (trips >= 1) achievements.push({ id: 'first-trip', name: 'First Journey', icon: '🎯', description: 'Completed your first trip' });
  if (trips >= 10) achievements.push({ id: 'regular', name: 'Regular Commuter', icon: '🚌', description: 'Completed 10 trips' });
  if (trips >= 50) achievements.push({ id: 'expert', name: 'Transit Expert', icon: '🏆', description: 'Completed 50 trips' });
  if (savings >= 500) achievements.push({ id: 'saver', name: 'Money Saver', icon: '💰', description: 'Saved ₹500+' });
  if (savings >= 2000) achievements.push({ id: 'super-saver', name: 'Super Saver', icon: '💎', description: 'Saved ₹2000+' });
  if (streak >= 3) achievements.push({ id: 'streak-3', name: 'On a Roll', icon: '🔥', description: '3 day streak' });
  if (streak >= 7) achievements.push({ id: 'streak-7', name: 'Week Warrior', icon: '⭐', description: '7 day streak' });
  
  return achievements;
}

// GET weekly report
router.get('/:userId/weekly', (req, res) => {
  const user = db.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const trips = Array.from(db.trips.values())
    .filter(trip => trip.userId === req.params.userId && new Date(trip.createdAt) > oneWeekAgo);
  
  // Daily breakdown
  const dailyBreakdown = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    dailyBreakdown[dateStr] = { trips: 0, savings: 0, time: 0 };
  }
  
  trips.forEach(trip => {
    const dateStr = new Date(trip.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    if (dailyBreakdown[dateStr]) {
      dailyBreakdown[dateStr].trips++;
      dailyBreakdown[dateStr].savings += trip.savings || 0;
      dailyBreakdown[dateStr].time += trip.route?.timeMinutes || 0;
    }
  });
  
  res.json({
    week: Object.entries(dailyBreakdown).map(([day, data]) => ({ day, ...data })).reverse(),
    summary: {
      totalTrips: trips.length,
      totalSavings: trips.reduce((sum, t) => sum + (t.savings || 0), 0),
      totalTime: trips.reduce((sum, t) => sum + (t.route?.timeMinutes || 0), 0),
    },
  });
});

export default router;
