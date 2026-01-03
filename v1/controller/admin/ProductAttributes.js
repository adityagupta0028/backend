const Model = require("../../../models/index");
const constants = require("../../../common/constants");

// BandFits APIs
module.exports.createBandFit = async (req, res, next) => {
  try {
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if band fit with same code already exists
    let existing = await Model.BandFits.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Band fit with this code already exists");
    }
    
    let bandFit = await Model.BandFits.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, bandFit);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if band profile shape with same code already exists
    let existing = await Model.BandProfileShapes.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Band profile shape with this code already exists");
    }
    
    let bandProfileShape = await Model.BandProfileShapes.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, bandProfileShape);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if band width category with same code already exists
    let existing = await Model.BandWidthCategories.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Band width category with this code already exists");
    }
    
    let bandWidthCategory = await Model.BandWidthCategories.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, bandWidthCategory);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if holding method with same code already exists
    let existing = await Model.HoldingMethods.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Holding method with this code already exists");
    }
    
    let holdingMethod = await Model.HoldingMethods.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, holdingMethod);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if setting configuration with same code already exists
    let existing = await Model.SettingConfigurations.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Setting configuration with this code already exists");
    }
    
    let settingConfiguration = await Model.SettingConfigurations.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, settingConfiguration);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if shank configuration with same code already exists
    let existing = await Model.ShankConfigurations.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Shank configuration with this code already exists");
    }
    
    let shankConfiguration = await Model.ShankConfigurations.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, shankConfiguration);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if shank treatment with same code already exists
    let existing = await Model.ShankTreatments.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Shank treatment with this code already exists");
    }
    
    let shankTreatment = await Model.ShankTreatments.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, shankTreatment);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if style with same code already exists
    let existing = await Model.Styles.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Style with this code already exists");
    }
    
    let style = await Model.Styles.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, style);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if setting feature with same code already exists
    let existing = await Model.SettingFeatures.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Setting feature with this code already exists");
    }
    
    let settingFeature = await Model.SettingFeatures.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, settingFeature);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if motif theme with same code already exists
    let existing = await Model.MotifThemes.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Motif theme with this code already exists");
    }
    
    let motifTheme = await Model.MotifThemes.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, motifTheme);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if ornament detail with same code already exists
    let existing = await Model.OrnamentDetails.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Ornament detail with this code already exists");
    }
    
    let ornamentDetail = await Model.OrnamentDetails.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, ornamentDetail);
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
    const { code, displayName } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
    // Check if accent stone shape with same code already exists
    let existing = await Model.AccentStoneShapes.findOne({
      code: code,
      isDeleted: false
    });
    
    if (existing) {
      throw new Error("Accent stone shape with this code already exists");
    }
    
    let accentStoneShape = await Model.AccentStoneShapes.create({ code, displayName });
    return res.success(constants.MESSAGES.DATA_UPLOADED, accentStoneShape);
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

