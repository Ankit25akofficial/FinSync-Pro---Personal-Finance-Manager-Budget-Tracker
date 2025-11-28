import Goal from '../models/Goal.model.js';
import User from '../models/User.model.js';

const getOrCreateUser = async (clerkUserId, email, firstName, lastName) => {
  let user = await User.findOne({ clerkUserId });
  if (!user) {
    user = await User.create({
      clerkUserId,
      email,
      firstName,
      lastName,
      role: 'user'
    });
  }
  return user;
};

export const getGoals = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { status } = req.query;
    const query = { userId: user._id };
    if (status) query.status = status;

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

export const getGoal = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const goal = await Goal.findOne({ _id: req.params.id, userId: user._id });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    // Calculate AI suggestions
    const remaining = req.body.targetAmount - (req.body.currentAmount || 0);
    const daysUntilTarget = Math.ceil((new Date(req.body.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    const weeklyAmount = daysUntilTarget > 0 ? remaining / Math.ceil(daysUntilTarget / 7) : 0;

    const goal = await Goal.create({
      ...req.body,
      userId: user._id,
      aiSuggestions: {
        weeklyAmount: Math.max(0, weeklyAmount),
        timelinePrediction: req.body.targetDate
      }
    });

    req.app.get('io').to(`user-${user._id}`).emit('goal-created', goal);

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed';
      await goal.save();
      req.app.get('io').to(`user-${user._id}`).emit('goal-completed', goal);
    }

    req.app.get('io').to(`user-${user._id}`).emit('goal-updated', goal);

    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: user._id });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    req.app.get('io').to(`user-${user._id}`).emit('goal-deleted', { id: req.params.id });

    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

