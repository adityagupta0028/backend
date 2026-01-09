const mongoose = require('mongoose');

const filterVisibilitySchema = new mongoose.Schema({
  filterKey: {
    type: String,
    required: true,
    unique: true
  },
  filterName: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('filter_visibility', filterVisibilitySchema);

