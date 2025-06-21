
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'pending', 'declined'], default: 'completed' }
});

module.exports = mongoose.model('Transaction', transactionSchema);
