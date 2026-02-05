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
  shape: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'shape must be an array'
    }
  },
  karat: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'karat must be an array'
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
      shape: {
        type: String,
        required: true
      },
      view_angle: {
        type: String,
        enum: ["Angled view", "Top view", "Side view", "Image 1", "Image 2", "Image 3"],
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
  carat_min_weights: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  diamond_quality: {
    type: [String],
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
  gift: {
    type: Boolean,
    default: false
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
    enum: ["Rings", "Bracelets", "Necklace", "Earrings"],
    default: "Rings",
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
  design_styles: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'design_styles must be an array'
    }
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
    required: false,
    default: []
  },
  subSubCategoryId: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SubSubCategory',
    required: false,
    default: []
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
  productDetailsConfiguration: {
    type: {
      product_details: String,
      average_width: String,
      rhodium_plate: String
    },
    default: {
      product_details: '',
      average_width: '',
      rhodium_plate: 'Yes'
    }
  },
  centerStoneDetailsConfiguration: [{
    stone: {
      type: String,
      enum: ['Diamond', 'Color Diamond', 'Gemstone'],
      required: true
    },
    diamond_origin: {
      type: String,
      default: ''
    },
    diamond_shapes: {
      type: [String],
      default: []
    },
    min_diamond_weight: {
      type: String,
      default: ''
    },
    quantity: {
      type: String,
      default: ''
    },
    average_color: {
      type: String,
      default: ''
    },
    average_clarity: {
      type: String,
      default: ''
    },
    dimensions: {
      type: String,
      default: ''
    },
    gemstone_type: {
      type: String,
      default: ''
    },
    holding_methods: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'holding_methods',
      default: []
    }
  }],
  center_stone_details: {
    type: String,
    default: ''
  },
  sideStoneDetailsConfiguration: [{
    stone: {
      type: String,
      enum: ['Diamond', 'Color Diamond', 'Gemstone'],
      required: true
    },
    diamond_origin: {
      type: String,
      default: ''
    },
    diamond_shapes: {
      type: [String],
      default: []
    },
    min_diamond_weight: {
      type: String,
      default: ''
    },
    quantity: {
      type: String,
      default: ''
    },
    average_color: {
      type: String,
      default: ''
    },
    average_clarity: {
      type: String,
      default: ''
    },
    dimensions: {
      type: String,
      default: ''
    },
    gemstone_type: {
      type: String,
      default: ''
    },
    holding_methods: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'holding_methods',
      default: []
    }
  }],
  side_stone_details: {
    type: String,
    default: ''
  },
  stoneDetailsFormConfiguration: [{
    stone: {
      type: String,
      enum: ['Diamond', 'Color Diamond', 'Gemstone'],
      required: true
    },
    certified: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No'
    },
    color: {
      type: String,
      default: ''
    },
    diamond_origin: {
      type: String,
      default: ''
    },
    diamond_shapes: {
      type: [String],
      default: []
    },
    min_diamond_weight: {
      type: String,
      default: ''
    },
    quantity: {
      type: String,
      default: ''
    },
    average_color: {
      type: String,
      default: ''
    },
    average_clarity: {
      type: String,
      default: ''
    },
    dimensions: {
      type: String,
      default: ''
    },
    gemstone_type: {
      type: String,
      default: ''
    },
    holding_methods: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'holding_methods',
      default: []
    }
  }],
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
      diamond_quality: String,
      shape: String,
      price: Number,
      discounted_price: Number
    }
  ],
  settingConfigurations:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'setting_configurations'
  },
  shankConfigurations:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'shank_configurations',
  },
  holdingMethods:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'holding_methods'
  },
  bandProfileShapes:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'band_profile_shapes'
  },
  bandWidthCategories:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'band_width_categories'
  },
  bandFits:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'band_fits',
  },
  shankTreatments:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'shank_treatments'
  },
  styles:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'styles'
  },
  settingFeatures:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'setting_features',
  },
  motifThemes:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'motif_themes'
  },
  ornamentDetails:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'ornament_details',
  },
  flexibilityType:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'flexibility_type',
  },
  ProductSpecials:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product_specials',
  },
  CollectionsList:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'collections',
  },
  chainLinkypes:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chain_link_type',
  },
  stoneSettings:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'stone_setting',
  },
  placementFits:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'placement_fit',
  },
  closureTypes:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'closure_type',
  },
  assemblyTypes:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'assembly_type',
  },
  chainTypes:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chain_type',
  },
  finishDetails:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'finish_detail',
  },
  unitOfSale:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'unit_of_sale',
  },
  dropShape:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'drop_shape',
  },
  attachmentType:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'attachment_type',
  },
  earringOrientation:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'earring_orientation',
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
productSchema.index({ subSubCategoryId: 1 });
productSchema.index({ product_id: 1 }, { unique: true });
productSchema.index({ status: 1, isDeleted: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

