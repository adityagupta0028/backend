const mongoose = require('mongoose');

const subSubCategorySchema = new mongoose.Schema({
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subSubCategoryName: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubSubCategory', subSubCategorySchema);

