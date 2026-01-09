const mongoose = require('mongoose');

    const ornamentDetailsSchema = new mongoose.Schema({
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

module.exports = mongoose.model('ornament_details', ornamentDetailsSchema);

