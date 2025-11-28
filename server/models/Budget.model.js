import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food', 'Rent', 'Travel', 'Bills', 'Shopping', 'Entertainment',
      'Healthcare', 'Education', 'Other', 'Food Delivery', 'Transport',
      'Utilities', 'Subscriptions'
    ]
  },
  monthlyLimit: {
    type: Number,
    required: true,
    min: 0
  },
  currentSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  alerts: {
    enabled: { type: Boolean, default: true },
    threshold80: { type: Boolean, default: false },
    threshold100: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique budget per category per month
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);

