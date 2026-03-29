import { Router } from 'express';
import { db } from '../data/database.js';

const router = Router();

// GET user profile
router.get('/:userId', (req, res) => {
  const user = db.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// GET user's saved routes
router.get('/:userId/routes', (req, res) => {
  const user = db.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ savedRoutes: user.savedRoutes || [] });
});

// POST save a route
router.post('/:userId/routes', (req, res) => {
  const { name, from, to } = req.body;
  const user = db.users.get(req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const newRoute = {
    id: `saved-${Date.now()}`,
    name,
    from,
    to,
    createdAt: new Date().toISOString(),
  };
  
  if (!user.savedRoutes) user.savedRoutes = [];
  user.savedRoutes.push(newRoute);
  
  res.json({ success: true, route: newRoute });
});

// DELETE saved route
router.delete('/:userId/routes/:routeId', (req, res) => {
  const user = db.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  user.savedRoutes = user.savedRoutes.filter(r => r.id !== req.params.routeId);
  res.json({ success: true });
});

// GET user preferences
router.get('/:userId/preferences', (req, res) => {
  const user = db.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ preferences: user.preferences });
});

// PUT update preferences
router.put('/:userId/preferences', (req, res) => {
  const user = db.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  user.preferences = { ...user.preferences, ...req.body };
  res.json({ success: true, preferences: user.preferences });
});

// GET wallet balance
router.get('/:userId/wallet', (req, res) => {
  const user = db.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ balance: user.wallet || 0 });
});

// POST add funds to wallet
router.post('/:userId/wallet/add', (req, res) => {
  const { amount } = req.body;
  const user = db.users.get(req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  user.wallet = (user.wallet || 0) + amount;
  res.json({ success: true, balance: user.wallet });
});

export default router;
