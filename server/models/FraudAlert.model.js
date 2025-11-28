import mongoose from 'mongoose';

const fraudAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  alertType: {
    type: String,
    enum: ['large_transaction', 'unusual_pattern', 'rapid_spending', 'suspicious_category'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'false_positive'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

fraudAlertSchema.index({ userId: 1, status: 1 });
fraudAlertSchema.index({ status: 1 });

export default mongoose.model('FraudAlert', fraudAlertSchema);

