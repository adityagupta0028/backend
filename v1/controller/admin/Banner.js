const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const mongoose = require('mongoose');
const { uploadFileToS3 } = require("../../../services/uploadS3Service");

module.exports.addBanner = async (req, res, next) => {
  try {
    let homePageBanner1 = "";
    let homePageBanner2 = "";
    let bannerPage3 = ""
   
    req.files.forEach(file => {
      if (file.fieldname === "home_image1") {
        homePageBanner1 = "/" + file.path;
      } else if (file.fieldname === "home_image2") {
        homePageBanner2 = "/" + file.path;
      }
      else if (file.fieldname === "bannner_image3") {
        bannerPage3 = "/" + file.path;
      }
    });
    const bannerData = {
      homePageBanner1,
      homePageBanner2,
      bannerPage3
    };
    const banner = await Model.BannerModel.create(bannerData);
    return res.success(constants.MESSAGES.BANNER_ADDED, banner);
  } catch (error) {
    next(error);
  }
};

module.exports.getAllBanner = async (req, res, next) => {
  try {
    const banner = await Model.BannerModel.find();
    return res.success(constants.MESSAGES.FETCH_BANNER, banner);
  } catch (error) {
    next(error);
  }
};  
module.exports.getBannerById = async (req, res, next) => {
  try {
    const banner = await Model.BannerModel.findById(req.params.id);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    return res.success(constants.MESSAGES.FETCH_BANNER, banner);
  } catch (error) {
    next(error);
  }
};  

module.exports.updateBanner = async (req, res, next) => {
  try {
     let homePageBanner1;
    let homePageBanner2 
   
    req.files.forEach(file => {
      if (file.fieldname === "home_image1") {
        homePageBanner1 = "/" + file.path;
      } else if (file.fieldname === "home_image2") {
        homePageBanner2 = "/" + file.path;
      }
    });
    const bannerData = {
      homePageBanner1,
      homePageBanner2,
    };
    const banner = await Model.BannerModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: bannerData,
      },
      {
        new: true,
      }
    );
    if (banner) {
      return res.success(
        constants.MESSAGES.BANNER_UPDATED,
        banner
      );
    } else {
      throw new Error(constants.MESSAGES.BANNER_NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.deleteBanner = async (req, res, next) => {
  try {
    const deleted = await Model.BannerModel.findByIdAndDelete(req.params.id);
    if (!deleted) throw new Error(constants.MESSAGES.BANNER_NOT_FOUND);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    return res.success(constants.MESSAGES.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};          