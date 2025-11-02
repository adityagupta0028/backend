const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs")

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  remember: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  },
  image: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super_admin']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

adminSchema.methods.authenticate = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
      if (!password) reject(new Error("MISSING_PASSWORD"));
      bcrypt.compare(password, this.password, (error, result) => {
        if (!result) {
          reject(new Error("Invalid Password"));
        }
        resolve(this);
      });
    });
  
    if (typeof callback !== "function") return promise;
    promise
      .then((result) => callback(null, result))
      .catch((err) => callback(err));
  };
  
  adminSchema.methods.setPassword = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
      if (!password) reject(new Error("Missing Password"));
  
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) reject(err);
        this.password = hash;
        resolve(this);
      });
    });
  
    if (typeof callback !== "function") return promise;
    promise
      .then((result) => callback(null, result))
      .catch((err) => callback(err));
  };
  
  adminSchema.pre(/save|create|update/i, function (next) {
    if (this.get("latitude") && this.get("longitude")) {
      const longitude = this.get("longitude");
      const latitude = this.get("latitude");
      const location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
      this.set({
        location
      });
    }
    next();
  });

module.exports = mongoose.model('Admin', adminSchema);