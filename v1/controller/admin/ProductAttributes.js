const Model = require("../../../models/index");
const constants = require("../../../common/constants");
const { uploadFileToS3 } = require("../../../services/uploadS3Service");
const fs = require("fs");
require("dotenv").config();
const axios = require("axios");

// BandFits APIs


module.exports.uploadFileS3Get = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const s3BaseUrl = "https://merefunds.s3.us-east-1.amazonaws.com"
    const s3Url = `${s3BaseUrl}/uploads/${filename}`;
    const headResponse = await axios.head(s3Url).catch(() => null);
    if (!headResponse) {
      return res.status(404).json({ success: false, message: "File not found on S3" });
    }
    const response = await axios.get(s3Url, { responseType: "stream" });
    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


module.exports.createBandFit = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      
      const fileFullPath = req.file.path;
      let filePath = `uploads/${req.file.filename}`;
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      const fileUrl = await uploadFileToS3(
        fileFullPath,
        bucketName,
        filePath
      );
      fs.unlinkSync(fileFullPath);
      imagePath = "/" + filePath;
    } 
    
    let bandFit;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.BandFits.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Band fit not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.BandFits.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Band fit with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      bandFit = await Model.BandFits.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, bandFit);
    } else {
      // Check if band fit with same code already exists
      const existing = await Model.BandFits.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Band fit with this code already exists");
      }
      
      // Create new record
      bandFit = await Model.BandFits.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, bandFit);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getBandFits = async (req, res, next) => {
  try {
    let bandFits = await Model.BandFits.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, bandFits);
  } catch (error) {
    next(error);
  }
}

// BandProfileShapes APIs
module.exports.createBandProfileShape = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let bandProfileShape;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.BandProfileShapes.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Band profile shape not found");
      }
      
      const codeConflict = await Model.BandProfileShapes.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Band profile shape with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      bandProfileShape = await Model.BandProfileShapes.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, bandProfileShape);
    } else {
      const existing = await Model.BandProfileShapes.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Band profile shape with this code already exists");
      }
      
      bandProfileShape = await Model.BandProfileShapes.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, bandProfileShape);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getBandProfileShapes = async (req, res, next) => {
  try {
    let bandProfileShapes = await Model.BandProfileShapes.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, bandProfileShapes);
  } catch (error) {
    next(error);
  }
}

// BandWidthCategories APIs
module.exports.createBandWidthCategory = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let bandWidthCategory;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.BandWidthCategories.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Band width category not found");
      }
      
      const codeConflict = await Model.BandWidthCategories.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Band width category with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      bandWidthCategory = await Model.BandWidthCategories.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, bandWidthCategory);
    } else {
      const existing = await Model.BandWidthCategories.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Band width category with this code already exists");
      }
      
      bandWidthCategory = await Model.BandWidthCategories.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, bandWidthCategory);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getBandWidthCategories = async (req, res, next) => {
  try {
    let bandWidthCategories = await Model.BandWidthCategories.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, bandWidthCategories);
  } catch (error) {
    next(error);
  }
}

// HoldingMethods APIs
module.exports.createHoldingMethod = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let holdingMethod;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.HoldingMethods.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Holding method not found");
      }
      
      const codeConflict = await Model.HoldingMethods.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Holding method with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      holdingMethod = await Model.HoldingMethods.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, holdingMethod);
    } else {
      const existing = await Model.HoldingMethods.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Holding method with this code already exists");
      }
      
      holdingMethod = await Model.HoldingMethods.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, holdingMethod);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getHoldingMethods = async (req, res, next) => {
  try {
    let holdingMethods = await Model.HoldingMethods.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, holdingMethods);
  } catch (error) {
    next(error);
  }
}

// SettingConfigurations APIs
module.exports.createSettingConfiguration = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let settingConfiguration;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.SettingConfigurations.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Setting configuration not found");
      }
      
      const codeConflict = await Model.SettingConfigurations.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Setting configuration with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      settingConfiguration = await Model.SettingConfigurations.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, settingConfiguration);
    } else {
      const existing = await Model.SettingConfigurations.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Setting configuration with this code already exists");
      }
      
      settingConfiguration = await Model.SettingConfigurations.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, settingConfiguration);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getSettingConfigurations = async (req, res, next) => {
  try {
    let settingConfigurations = await Model.SettingConfigurations.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, settingConfigurations);
  } catch (error) {
    next(error);
  }
}

// ShankConfigurations APIs
module.exports.createShankConfiguration = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let shankConfiguration;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.ShankConfigurations.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Shank configuration not found");
      }
      
      const codeConflict = await Model.ShankConfigurations.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Shank configuration with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      shankConfiguration = await Model.ShankConfigurations.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, shankConfiguration);
    } else {
      const existing = await Model.ShankConfigurations.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Shank configuration with this code already exists");
      }
      
      shankConfiguration = await Model.ShankConfigurations.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, shankConfiguration);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getShankConfigurations = async (req, res, next) => {
  try {
    let shankConfigurations = await Model.ShankConfigurations.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, shankConfigurations);
  } catch (error) {
    next(error);
  }
}

// ShankTreatments APIs
module.exports.createShankTreatment = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let shankTreatment;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.ShankTreatments.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Shank treatment not found");
      }
      
      const codeConflict = await Model.ShankTreatments.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Shank treatment with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      shankTreatment = await Model.ShankTreatments.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, shankTreatment);
    } else {
      const existing = await Model.ShankTreatments.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Shank treatment with this code already exists");
      }
      
      shankTreatment = await Model.ShankTreatments.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, shankTreatment);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getShankTreatments = async (req, res, next) => {
  try {
    let shankTreatments = await Model.ShankTreatments.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, shankTreatments);
  } catch (error) {
    next(error);
  }
}

// Styles APIs
module.exports.createStyle = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let style;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.Styles.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Style not found");
      }
      
      const codeConflict = await Model.Styles.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Style with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      style = await Model.Styles.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, style);
    } else {
      const existing = await Model.Styles.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Style with this code already exists");
      }
      
      style = await Model.Styles.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, style);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getStyles = async (req, res, next) => {
  try {
    let styles = await Model.Styles.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, styles);
  } catch (error) {
    next(error);
  }
}

// SettingFeatures APIs
module.exports.createSettingFeature = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let settingFeature;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.SettingFeatures.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Setting feature not found");
      }
      
      const codeConflict = await Model.SettingFeatures.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Setting feature with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      settingFeature = await Model.SettingFeatures.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, settingFeature);
    } else {
      const existing = await Model.SettingFeatures.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Setting feature with this code already exists");
      }
      
      settingFeature = await Model.SettingFeatures.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, settingFeature);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getSettingFeatures = async (req, res, next) => {
  try {
    let settingFeatures = await Model.SettingFeatures.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, settingFeatures);
  } catch (error) {
    next(error);
  }
}

// MotifThemes APIs
module.exports.createMotifTheme = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let motifTheme;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.MotifThemes.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Motif theme not found");
      }
      
      const codeConflict = await Model.MotifThemes.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Motif theme with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      motifTheme = await Model.MotifThemes.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, motifTheme);
    } else {
      const existing = await Model.MotifThemes.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Motif theme with this code already exists");
      }
      
      motifTheme = await Model.MotifThemes.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, motifTheme);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getMotifThemes = async (req, res, next) => {
  try {
    let motifThemes = await Model.MotifThemes.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, motifThemes);
  } catch (error) {
    next(error);
  }
}

// OrnamentDetails APIs
module.exports.createOrnamentDetail = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let ornamentDetail;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.OrnamentDetails.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Ornament detail not found");
      }
      
      const codeConflict = await Model.OrnamentDetails.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Ornament detail with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      ornamentDetail = await Model.OrnamentDetails.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, ornamentDetail);
    } else {
      const existing = await Model.OrnamentDetails.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Ornament detail with this code already exists");
      }
      
      ornamentDetail = await Model.OrnamentDetails.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, ornamentDetail);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getOrnamentDetails = async (req, res, next) => {
  try {
    let ornamentDetails = await Model.OrnamentDetails.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, ornamentDetails);
  } catch (error) {
    next(error);
  }
}

// AccentStoneShapes APIs
module.exports.createAccentStoneShape = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Handle image - if file is uploaded, use its path, otherwise use image from body
    let imagePath = '';
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    let accentStoneShape;
    
    // If id exists, update the existing record
    if (id) {
      const existingRecord = await Model.AccentStoneShapes.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Accent stone shape not found");
      }
      
      const codeConflict = await Model.AccentStoneShapes.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Accent stone shape with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      accentStoneShape = await Model.AccentStoneShapes.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, accentStoneShape);
    } else {
      const existing = await Model.AccentStoneShapes.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Accent stone shape with this code already exists");
      }
      
      accentStoneShape = await Model.AccentStoneShapes.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, accentStoneShape);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getAccentStoneShapes = async (req, res, next) => {
  try {
    let accentStoneShapes = await Model.AccentStoneShapes.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, accentStoneShapes);
  } catch (error) {
    next(error);
  }
}

