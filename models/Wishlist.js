const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  product_id: {
    type: String,
    required: true
  },
  selectedVariant: {
    diamond_type: String,
    carat_weight: String,
    metal_type: String,
    ring_size: Number,
    necklace_size: String,
    back_type: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true
});

const wishlistSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

wishlistSchema.index({ customerId: 1, isDeleted: 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);

