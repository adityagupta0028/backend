const mongoose = require('mongoose');

const menuFilterSettingsSchema = new mongoose.Schema({
  menuName: {
    type: String,
    required: true,
    enum: ['Main Menu', 'Side Menu', 'Hero Menu']
  },
  categoryId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  menuItem: {
    type: String,
    required: true
  },
  item: {
    type: String,
    required: true
  },
  itemKey: {
    type: String,
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemKey'
  }]
}, {
  timestamps: true
});

// Compound index to ensure uniqueness per menuName, menuItem, and itemKey combination
menuFilterSettingsSchema.index({ menuName: 1, menuItem: 1, itemKey: 1 }, { unique: true });

module.exports = mongoose.model('menu_filter_settings', menuFilterSettingsSchema);

