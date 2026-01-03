const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  selectedVariant: {
    diamond_type: String,
    carat_weight: String,
    metal_type: String,
    ring_size: Number,
    necklace_size: String,
    back_type: String
  },
  engraving_text: {
    type: String,
    default: ''
  }
}, {
  _id: true
});

const cartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

cartSchema.index({ customerId: 1, isDeleted: 1 });

cartSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => {
    const price = item.discountedPrice || item.price;
    return sum + (price * item.quantity);
  }, 0);
  
  this.total = this.subtotal + this.tax + this.shipping;
  return this;
};

module.exports = mongoose.model('Cart', cartSchema);

