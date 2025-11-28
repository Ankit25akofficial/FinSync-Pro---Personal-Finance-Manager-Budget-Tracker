import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import FraudAlert from '../models/FraudAlert.model.js';

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// Get fraud alerts
export const getFraudAlerts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const alerts = await FraudAlert.find(query)
      .populate('userId', 'email firstName lastName')
      .populate('transactionId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

// Update fraud alert status
export const updateFraudAlert = async (req, res, next) => {
  try {
    const { status, reviewedBy } = req.body;
    const alert = await FraudAlert.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewedBy: req.user.userId,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'email firstName lastName');

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// Get system statistics
export const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalAlerts = await FraudAlert.countDocuments({ status: 'pending' });
    
    const totalIncome = await Transaction.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        pendingAlerts: totalAlerts,
        totalIncome: totalIncome[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

