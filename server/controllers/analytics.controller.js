import Transaction from '../models/Transaction.model.js';
import Budget from '../models/Budget.model.js';
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

// Get income vs expenses
export const getIncomeVsExpenses = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { startDate, endDate } = req.query;
    const query = { userId: user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query);
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        income,
        expenses,
        savings: income - expenses,
        percentage: income > 0 ? ((expenses / income) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get spending by category (pie chart data)
export const getSpendingByCategory = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { startDate, endDate } = req.query;
    const query = { userId: user._id, type: 'expense' };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query);
    
    const categoryMap = {};
    transactions.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const data = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / transactions.reduce((sum, t) => sum + t.amount, 0) * 100).toFixed(2)
    })).sort((a, b) => b.amount - a.amount);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get monthly trends
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { months = 6 } = req.query;
    const data = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const transactions = await Transaction.find({
        userId: user._id,
        date: { $gte: startDate, $lte: endDate }
      });

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        savings: income - expenses
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get dashboard summary
export const getDashboardSummary = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Current month transactions
    const transactions = await Transaction.find({
      userId: user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Budgets
    const budgets = await Budget.find({
      userId: user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.currentSpent, 0);

    // Recent transactions
    const recentTransactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        walletBalance: monthlyIncome - monthlyExpenses,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings: monthlyIncome - monthlyExpenses,
        totalBudgetLimit,
        totalBudgetSpent,
        budgetPercentage: totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit * 100).toFixed(2) : 0,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

