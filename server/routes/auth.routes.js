import express from 'express';
import User from '../models/User.model.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { resetAllData, getUserStats } from '../controllers/user.controller.js';

const router = express.Router();

// Get current user profile
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    let user = await User.findOne({ clerkUserId: req.user.userId });
    
    if (!user) {
      user = await User.create({
        clerkUserId: req.user.userId,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: 'user'
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Update user preferences
router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { clerkUserId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/stats', requireAuth, getUserStats);

// Reset all user data
router.delete('/reset', requireAuth, resetAllData);

export default router;

