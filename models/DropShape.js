const mongoose = require('mongoose');

const dropShapeSchema = new mongoose.Schema({
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

module.exports = mongoose.model('drop_shape', dropShapeSchema);

