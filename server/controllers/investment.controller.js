import Investment from '../models/Investment.model.js';
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

export const getInvestments = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const { type } = req.query;
    const query = { userId: user._id };
    if (type) query.type = type;

    const investments = await Investment.find(query).sort({ purchaseDate: -1 });

    // Calculate totals
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalProfitLoss = totalCurrent - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: investments,
      summary: {
        totalInvested,
        totalCurrent,
        totalProfitLoss,
        totalProfitLossPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getInvestment = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const investment = await Investment.findOne({ _id: req.params.id, userId: user._id });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};

export const createInvestment = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const investment = await Investment.create({
      ...req.body,
      userId: user._id,
      currentValue: req.body.currentValue || req.body.investedAmount,
      currentPrice: req.body.currentPrice || req.body.purchasePrice
    });

    // Calculate profit/loss
    investment.profitLoss = investment.currentValue - investment.investedAmount;
    investment.profitLossPercentage = investment.investedAmount > 0 
      ? (investment.profitLoss / investment.investedAmount * 100).toFixed(2) 
      : 0;
    await investment.save();

    req.app.get('io').to(`user-${user._id}`).emit('investment-added', investment);

    res.status(201).json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};

export const updateInvestment = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!investment) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Recalculate profit/loss
    investment.profitLoss = investment.currentValue - investment.investedAmount;
    investment.profitLossPercentage = investment.investedAmount > 0 
      ? (investment.profitLoss / investment.investedAmount * 100).toFixed(2) 
      : 0;
    await investment.save();

    req.app.get('io').to(`user-${user._id}`).emit('investment-updated', investment);

    res.json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};

export const deleteInvestment = async (req, res, next) => {
  try {
    const user = await getOrCreateUser(
      req.user.userId,
      req.user.email,
      req.user.firstName,
      req.user.lastName
    );

    const investment = await Investment.findOneAndDelete({ _id: req.params.id, userId: user._id });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    req.app.get('io').to(`user-${user._id}`).emit('investment-deleted', { id: req.params.id });

    res.json({ success: true, message: 'Investment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

