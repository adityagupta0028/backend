const mongoose = require('mongoose');

const shankConfigurationsSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
    timestamps: true
});

module.exports = mongoose.model('shank_configurations', shankConfigurationsSchema);

