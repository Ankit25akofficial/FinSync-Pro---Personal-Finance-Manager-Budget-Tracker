import Budget from '../models/Budget.model.js';
import Transaction from '../models/Transaction.model.js';
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

// Get all budgets for a user
export const getBudgets = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { month, year } = req.query;
    const now = new Date();
    const queryMonth = month ? parseInt(month) : now.getMonth() + 1;
    const queryYear = year ? parseInt(year) : now.getFullYear();

    const budgets = await Budget.find({
      userId: user._id,
      month: queryMonth,
      year: queryYear
    });

    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

// Get single budget
export const getBudget = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// Create or update budget
export const createBudget = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { month, year } = req.body;
    const now = new Date();
    const budgetMonth = month || now.getMonth() + 1;
    const budgetYear = year || now.getFullYear();

    // Calculate current spent from transactions
    const startDate = new Date(budgetYear, budgetMonth - 1, 1);
    const endDate = new Date(budgetYear, budgetMonth, 0, 23, 59, 59);

    const expenses = await Transaction.find({
      userId: user._id,
      type: 'expense',
      category: req.body.category,
      date: { $gte: startDate, $lte: endDate }
    });

    const currentSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

    const budget = await Budget.findOneAndUpdate(
      {
        userId: user._id,
        category: req.body.category,
        month: budgetMonth,
        year: budgetYear
      },
      {
        ...req.body,
        userId: user._id,
        month: budgetMonth,
        year: budgetYear,
        currentSpent
      },
      { new: true, upsert: true, runValidators: true }
    );

    req.app.get('io').to(`user-${user._id}`).emit('budget-updated', budget);

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// Update budget
export const updateBudget = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    req.app.get('io').to(`user-${user._id}`).emit('budget-updated', budget);

    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// Delete budget
export const deleteBudget = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: user._id
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    req.app.get('io').to(`user-${user._id}`).emit('budget-deleted', { id: req.params.id });

    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
};

