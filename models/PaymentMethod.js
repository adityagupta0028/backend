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
  orderUuid: {
    type: String,
    default: '',
    trim: true,
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

// Index for faster queries
paymentMethodSchema.index({ customerId: 1, isDeleted: 1 });
paymentMethodSchema.index({ customerId: 1, isDefault: 1, isActive: 1 });

// Method to format card display (e.g., "Visa •••• 4242")
paymentMethodSchema.methods.getDisplayName = function () {
  const brand = this.cardBrand.charAt(0).toUpperCase() + this.cardBrand.slice(1);
  return `${brand} •••• ${this.last4}`;
};

// Method to check if card is expired
paymentMethodSchema.methods.isExpired = function () {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (this.expiryYear < currentYear) return true;
  if (this.expiryYear === currentYear && this.expiryMonth < currentMonth) return true;
  return false;
};

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);

