import Transaction from '../models/Transaction.model.js';
import Budget from '../models/Budget.model.js';
import FraudAlert from '../models/FraudAlert.model.js';
import User from '../models/User.model.js';

// Get or create user in our database
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

// Get all transactions for a user
export const getTransactions = async (req, res, next) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected. Please check MongoDB connection.',
        data: []
      });
    }

    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { type, category, startDate, endDate, search, page = 1, limit = 50 } = req.query;
    
    const query = { userId: user._id };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    next(error);
  }
};

// Get single transaction
export const getTransaction = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// Create transaction
export const createTransaction = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const transaction = await Transaction.create({
      ...req.body,
      userId: user._id
    });

    // Update budget if it's an expense
    if (transaction.type === 'expense') {
      const now = new Date();
      const budget = await Budget.findOne({
        userId: user._id,
        category: transaction.category,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });

      if (budget) {
        budget.currentSpent += transaction.amount;
        
        // Check thresholds
        const percentage = (budget.currentSpent / budget.monthlyLimit) * 100;
        if (percentage >= 100 && !budget.alerts.threshold100) {
          budget.alerts.threshold100 = true;
          // Emit socket event
          req.app.get('io').to(`user-${user._id}`).emit('budget-alert', {
            type: 'exceeded',
            category: transaction.category,
            percentage: 100
          });
        } else if (percentage >= 80 && !budget.alerts.threshold80) {
          budget.alerts.threshold80 = true;
          req.app.get('io').to(`user-${user._id}`).emit('budget-alert', {
            type: 'warning',
            category: transaction.category,
            percentage: 80
          });
        }
        
        await budget.save();
      }
    }

    // Fraud detection for large transactions
    if (transaction.amount > 20000) {
      await FraudAlert.create({
        userId: user._id,
        transactionId: transaction._id,
        alertType: 'large_transaction',
        severity: transaction.amount > 50000 ? 'high' : 'medium',
        description: `Large ${transaction.type} of ₹${transaction.amount} in ${transaction.category}`,
        amount: transaction.amount
      });
      
      // Notify admin
      req.app.get('io').to('admin-room').emit('fraud-alert', {
        userId: user._id,
        transactionId: transaction._id,
        amount: transaction.amount
      });
    }

    // Emit socket event
    req.app.get('io').to(`user-${user._id}`).emit('transaction-added', transaction);

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// Update transaction
export const updateTransaction = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    req.app.get('io').to(`user-${user._id}`).emit('transaction-updated', transaction);

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// Delete transaction
export const deleteTransaction = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update budget if it was an expense
    if (transaction.type === 'expense') {
      const now = new Date();
      const budget = await Budget.findOne({
        userId: user._id,
        category: transaction.category,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });

      if (budget) {
        budget.currentSpent = Math.max(0, budget.currentSpent - transaction.amount);
        await budget.save();
      }
    }

    req.app.get('io').to(`user-${user._id}`).emit('transaction-deleted', { id: req.params.id });

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

