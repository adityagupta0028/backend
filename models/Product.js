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
    // validate: {
    //   validator: function(v) {
    //     return v === undefined || v === null || v > 0;
    //   },
    //   message: 'original_price must be greater than 0'
    // }
  },
  discounted_price: {
    type: Number,
    required: false,
    // validate: {
    //   validator: function(v) {
    //     return v > 0;
    //   },
    //   message: 'discounted_price must be greater than 0'
    // }
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
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'metal_type must be an array'
    }
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
  viewAngle: {
    type: String,
    enum: ["Angled view", "Top view", "Side view"],
    default: null
  },
  metal_images: {
    type: [{
      metal_type: {
        type: String,
        required: true
      },
      view_angle: {
        type: String,
        enum: ["Angled view", "Top view", "Side view"],
        required: true
      },
      image: {
        type: String,
        required: true
      }
    }],
    default: []
  },
  diamond_origin: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'diamond_origin must be an array'
    }
  },
  carat_weight: {
    type: [Number],
    default: [],
    validate: {
      validator: function(v) {
        if (!Array.isArray(v)) return false;
        return v.every(weight => weight > 0);
      },
      message: 'All carat weights must be greater than 0'
    }
  },
  diamond_quality: {
    type: [String],
    enum: ["Best - D, VVS", "Better - E, VS1", "Good - F, VS2"],
    default: []
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
    type: [Number],
    default: [],
    validate: {
      validator: function(v) {
        if (!Array.isArray(v)) return false;
        return v.every(size => size >= 3 && size <= 10);
      },
      message: 'Ring sizes must be between 3 and 10'
    }
  },
  necklace_size: {
    type: [String],
    default: []
  },
  engraving_text: {
    type: String,
    default: ''
  },
  engraving_allowed: {
    type: Boolean,
    default: true
  },
  back_type: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        // Allow null, undefined, empty string, or valid enum values
        return !v || ["Push Back", "Screw Back", "Guardian Back"].includes(v);
      },
      message: '{VALUE} is not a valid enum value for path `{PATH}`'
    }
  },
  matching_band_available: {
    type: Boolean,
    default: false
  },
  matching_band_product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  product_type: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        // Allow null, undefined, empty string, or valid enum values
        return !v || ["Engagement Ring", "Earrings", "Pendant", "Bracelet"].includes(v);
      },
      message: '{VALUE} is not a valid enum value for path `{PATH}`'
    }
  },
  collection_name: {
    type: String,
    default: ''
  },
  collections: {
    type: String,
    default: ''
  },
  productSpecials: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    default: "Male"
  },
  categoryId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Category',
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one category is required'
    }
  },
  subCategoryId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SubCategory',
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one subcategory is required'
    }
  },
  images: {
    type: [String],
    default: []
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
  product_details: {
    type: String,
    default: ''
  },
  center_stone_details: {
    type: String,
    default: ''
  },
  side_stone_details: {
    type: String,
    default: ''
  },
  stone_details: {
    type: String,
    default: ''
  },
  stone: {
    type: [String],
    enum: ["Diamond", "Color Diamond", "Gemstone", "None"],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'stone must be an array'
    }
  },
  variants:[
    {
      diamond_type: String,
      carat_weight: String,
      metal_type: String,
      price: Number,
      discounted_price: Number
    }
  ],
  settingConfigurations:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'setting_configurations',
   required: true
  },
  shankConfigurations:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'shank_configurations',
    required: true
  },
  holdingMethods:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'holding_methods',
    required: true
  },
  bandProfileShapes:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'band_profile_shapes',
    required: true
  },
  bandWidthCategories:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'band_width_categories',
    required: true
  },
  bandFits:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'band_fits',
    required: true
  },
  shankTreatments:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'shank_treatments',
    required: true
  },
  styles:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'styles',
    required: true
  },
  settingFeatures:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'setting_features',
    required: true
  },
  motifThemes:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'motif_themes',
    required: true
  },
  ornamentDetails:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'ornament_details',
    required: true
  },
  accentStoneShapes:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'accent_stone_shapes',
      required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

productSchema.index({ categoryId: 1 });
productSchema.index({ subCategoryId: 1 });
productSchema.index({ product_id: 1 }, { unique: true });
productSchema.index({ status: 1, isDeleted: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

