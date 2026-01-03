const mongoose = require('mongoose');

const settingConfigurationsSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
    timestamps: true
});

module.exports = mongoose.model('setting_configurations', settingConfigurationsSchema);

