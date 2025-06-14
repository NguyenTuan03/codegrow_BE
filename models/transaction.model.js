const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  orderId: String,
  amount: Number,
  status: { type: String, enum: ['pending', 'success', 'fail'], default: 'pending' },
  vnpParams: Object,
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
});

module.exports = mongoose.model('Transaction', transactionSchema);
