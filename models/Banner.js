const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var bannerModel = new Schema({
    homePageBanner1: {
        type: String,
        default: null
    },
    homePageBanner2:{
        type: String,
        default: null
    },
    bannerPage3:{
        type: String,
        default: null
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('banner', bannerModel);