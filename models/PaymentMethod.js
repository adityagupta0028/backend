const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  email: {
    type: String,
  },
  setupIntentId: {
    type: String,
    required: true,
    unique: true
  },
  // Stripe payment method ID (secure token - never store actual card details)
  stripePaymentMethodId: {
    type: String,
    required: true,
    unique: true
  },
  // Stripe customer ID (if customer wants to save card for future use)
  stripeCustomerId: {
    type: String,
    default: null
  },
  // Safe card details for display (PCI compliant)
  cardBrand: {
    type: String, // visa, mastercard, amex, etc.
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    maxlength: 4
  },
  expiryMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  expiryYear: {
    type: Number,
    required: true,
    min: new Date().getFullYear()
  },
  cardholderName: {
    type: String,
    required: true,
    trim: true
  },
  // Card type (credit, debit)
  cardType: {
    type: String,
    enum: ['credit', 'debit', 'unknown'],
    default: 'unknown'
  },
  amount: {
    type: Number,
    default: 0,
    trim: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  },
  // Whether this is the default payment method
  isDefault: {
    type: Boolean,
    default: false
  },
  // Whether card is active
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);

