const mongoose = require('mongoose');

const heroMenuSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  columns: [{
    columnIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    headers: [{
      title: {
        type: String,
        required: true
      },
      variables: {
        settingConfigurations: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'setting_configurations'
        }],
        shankConfigurations: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'shank_configurations'
        }],
        holdingMethods: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'holding_methods'
        }],
        bandProfileShapes: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'band_profile_shapes'
        }],
        bandWidthCategories: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'band_width_categories'
        }],
        bandFits: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'band_fits'
        }],
        shankTreatments: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'shank_treatments'
        }],
        styles: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'styles'
        }],
        settingFeatures: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'setting_features'
        }],
        motifThemes: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'motif_themes'
        }],
        ornamentDetails: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ornament_details'
        }]
      },
      blogs: [{
        title: {
          type: String,
          required: true
        },
        link: {
          type: String,
          required: true
        }
      }]
    }]
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one HeroMenu per category
heroMenuSchema.index({ categoryId: 1 }, { unique: true });

module.exports = mongoose.model('hero_menu', heroMenuSchema);

