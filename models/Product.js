const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  product_name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  average_rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  review_count: {
    type: Number,
    min: 0,
    default: 0
  },
  original_price: {
    type: Number,
    required: false,
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v > 0;
      },
      message: 'original_price must be greater than 0'
    }
  },
  discounted_price: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'discounted_price must be greater than 0'
    }
  },
  discount_label: {
    type: String,
    default: ''
  },
  promotion_label: {
    type: String,
    default: ''
  },
  promotion_end_date: {
    type: Date
  },
  metal_type: {
    type: String,
    required: true,
    enum: [
      "14K White Gold", "14K Yellow Gold", "14K Rose Gold",
      "18K White Gold", "18K Yellow Gold", "18K Rose Gold",
      "Platinum"
    ]
  },
  metal_code: {
    type: String,
    default: ''
  },
  metal_price: {
    type: Number,
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v === 0 || v > 0;
      },
      message: 'metal_price must be greater than 0'
    },
    default: 0
  },
  diamond_origin: {
    type: String,
    required: true,
    enum: ["Natural", "Lab Grown"]
  },
  carat_weight: {
    type: Number,
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v === 0 || v > 0;
      },
      message: 'carat_weight must be greater than 0'
    },
    default: 0
  },
  diamond_quality: {
    type: String,
    enum: ["Best - D, VVS", "Better - E, VS1", "Good - F, VS2"],
    default: ''
  },
  diamond_color_grade: {
    type: String,
    default: ''
  },
  diamond_clarity_grade: {
    type: String,
    default: ''
  },
  ring_size: {
    type: Number,
    required: true,
    min: 3,
    max: 10
  },
  engraving_text: {
    type: String,
    maxLength: 15,
    default: ''
  },
  engraving_allowed: {
    type: Boolean,
    default: true
  },
  back_type: {
    type: String,
    enum: ["Push Back", "Screw Back", "Guardian Back"],
    default: ''
  },
  matching_band_available: {
    type: Boolean,
    default: false
  },
  product_type: {
    type: String,
    enum: ["Engagement Ring", "Earrings", "Pendant", "Bracelet"],
    default: ''
  },
  collection_name: {
    type: String,
    default: ''
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  videos: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Draft"],
    default: "Active"
  },
  tags: {
    type: [String],
    default: []
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ categoryId: 1, subCategoryId: 1 });
productSchema.index({ product_id: 1 });
productSchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.model('Product', productSchema);

