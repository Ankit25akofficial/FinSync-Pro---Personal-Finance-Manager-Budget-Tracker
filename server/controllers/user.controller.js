import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import Budget from '../models/Budget.model.js';
import Goal from '../models/Goal.model.js';
import Investment from '../models/Investment.model.js';

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

// Reset all user data
export const resetAllData = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    // Delete all user's data
    await Promise.all([
      Transaction.deleteMany({ userId: user._id }),
      Budget.deleteMany({ userId: user._id }),
      Goal.deleteMany({ userId: user._id }),
      Investment.deleteMany({ userId: user._id })
    ]);

    // Emit socket event
    req.app.get('io').to(`user-${user._id}`).emit('data-reset', {
      message: 'All data has been reset'
    });

    res.json({
      success: true,
      message: 'All data has been reset successfully',
      deleted: {
        transactions: true,
        budgets: true,
        goals: true,
        investments: true
      }
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    next(error);
  }
};

// Get user statistics
export const getUserStats = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const [transactionCount, budgetCount, goalCount, investmentCount] = await Promise.all([
      Transaction.countDocuments({ userId: user._id }),
      Budget.countDocuments({ userId: user._id }),
      Goal.countDocuments({ userId: user._id }),
      Investment.countDocuments({ userId: user._id })
    ]);

    res.json({
      success: true,
      data: {
        transactions: transactionCount,
        budgets: budgetCount,
        goals: goalCount,
        investments: investmentCount,
        total: transactionCount + budgetCount + goalCount + investmentCount
      }
    });
  } catch (error) {
    next(error);
  }
};

