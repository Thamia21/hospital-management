const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', default: null },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'cash', 'other','stripe'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
    transactionId: { type: String },
    paymentProvider: { type: String, default: 'MANUAL' },
    description: { type: String },
    processedAt: { type: Date },
    metadata: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
