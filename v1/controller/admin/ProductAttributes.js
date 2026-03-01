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

// SizeScale APIs
module.exports.createSizeScale = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
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
    
    let sizeScale;
    
    if (id) {
      const existingRecord = await Model.SizeScale.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Size scale not found");
      }
      
      const codeConflict = await Model.SizeScale.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Size scale with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      sizeScale = await Model.SizeScale.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, sizeScale);
    } else {
      const existing = await Model.SizeScale.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Size scale with this code already exists");
      }
      
      sizeScale = await Model.SizeScale.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, sizeScale);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getSizeScales = async (req, res, next) => {
  try {
    let sizeScales = await Model.SizeScale.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, sizeScales);
  } catch (error) {
    next(error);
  }
}

// FlexibilityType APIs
module.exports.createFlexibilityType = async (req, res, next) => {
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
    
    let flexibilityType;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.FlexibilityType.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Flexibility type not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.FlexibilityType.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Flexibility type with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      flexibilityType = await Model.FlexibilityType.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, flexibilityType);
    } else {
      // Check if flexibility type with same code already exists
      const existing = await Model.FlexibilityType.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Flexibility type with this code already exists");
      }
      
      // Create new record
      flexibilityType = await Model.FlexibilityType.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, flexibilityType);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getFlexibilityTypes = async (req, res, next) => {
  try {
    let flexibilityTypes = await Model.FlexibilityType.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, flexibilityTypes);
  } catch (error) {
    next(error);
  }
}

// ProductSpecials APIs
module.exports.createProductSpecial = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
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
    
    let productSpecial;
    
    if (id) {
      const existingRecord = await Model.ProductSpecials.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Product special not found");
      }
      
      const codeConflict = await Model.ProductSpecials.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Product special with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      productSpecial = await Model.ProductSpecials.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, productSpecial);
    } else {
      const existing = await Model.ProductSpecials.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Product special with this code already exists");
      }
      
      productSpecial = await Model.ProductSpecials.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, productSpecial);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getProductSpecials = async (req, res, next) => {
  try {
    let productSpecials = await Model.ProductSpecials.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, productSpecials);
  } catch (error) {
    next(error);
  }
}

// Collections APIs
module.exports.createCollection = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
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
    
    let collection;
    
    if (id) {
      const existingRecord = await Model.Collections.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Collection not found");
      }
      
      const codeConflict = await Model.Collections.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Collection with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      collection = await Model.Collections.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, collection);
    } else {
      const existing = await Model.Collections.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Collection with this code already exists");
      }
      
      collection = await Model.Collections.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, collection);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getCollections = async (req, res, next) => {
  try {
    let collections = await Model.Collections.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, collections);
  } catch (error) {
    next(error);
  }
}

// ChainLinkType APIs
module.exports.createChainLinkType = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
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
    
    let chainLinkType;
    
    if (id) {
      const existingRecord = await Model.ChainLinkType.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Chain link type not found");
      }
      
      const codeConflict = await Model.ChainLinkType.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Chain link type with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      chainLinkType = await Model.ChainLinkType.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, chainLinkType);
    } else {
      const existing = await Model.ChainLinkType.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Chain link type with this code already exists");
      }
      
      chainLinkType = await Model.ChainLinkType.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, chainLinkType);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getChainLinkTypes = async (req, res, next) => {
  try {
    let chainLinkTypes = await Model.ChainLinkType.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, chainLinkTypes);
  } catch (error) {
    next(error);
  }
}

// ClosureType APIs
module.exports.createClosureType = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
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
    
    let closureType;
    
    if (id) {
      const existingRecord = await Model.ClosureType.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Closure type not found");
      }
      
      const codeConflict = await Model.ClosureType.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Closure type with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      closureType = await Model.ClosureType.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, closureType);
    } else {
      const existing = await Model.ClosureType.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Closure type with this code already exists");
      }
      
      closureType = await Model.ClosureType.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, closureType);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getClosureTypes = async (req, res, next) => {
  try {
    let closureTypes = await Model.ClosureType.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, closureTypes);
  } catch (error) {
    next(error);
  }
}

// StoneSetting APIs
module.exports.createStoneSetting = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
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
    
    let stoneSetting;
    
    if (id) {
      const existingRecord = await Model.StoneSetting.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Stone setting not found");
      }
      
      const codeConflict = await Model.StoneSetting.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Stone setting with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      stoneSetting = await Model.StoneSetting.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, stoneSetting);
    } else {
      const existing = await Model.StoneSetting.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Stone setting with this code already exists");
      }
      
      stoneSetting = await Model.StoneSetting.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, stoneSetting);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getStoneSettings = async (req, res, next) => {
  try {
    let stoneSettings = await Model.StoneSetting.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, stoneSettings);
  } catch (error) {
    next(error);
  }
}

// PlacementFit APIs
module.exports.createPlacementFit = async (req, res, next) => {
  try {
    const { code, displayName, id } = req.body;
    
    if (!code || !displayName) {
      throw new Error("Code and displayName are required");
    }
    
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
    
    let placementFit;
    
    if (id) {
      const existingRecord = await Model.PlacementFit.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Placement fit not found");
      }
      
      const codeConflict = await Model.PlacementFit.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Placement fit with this code already exists");
      }
      
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      placementFit = await Model.PlacementFit.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, placementFit);
    } else {
      const existing = await Model.PlacementFit.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Placement fit with this code already exists");
      }
      
      placementFit = await Model.PlacementFit.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, placementFit);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getPlacementFits = async (req, res, next) => {
  try {
    let placementFits = await Model.PlacementFit.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, placementFits);
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

// AssemblyType APIs
module.exports.createAssemblyType = async (req, res, next) => {
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
    
    let assemblyType;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.AssemblyType.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Assembly type not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.AssemblyType.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Assembly type with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      assemblyType = await Model.AssemblyType.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, assemblyType);
    } else {
      // Check if assembly type with same code already exists
      const existing = await Model.AssemblyType.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Assembly type with this code already exists");
      }
      
      // Create new record
      assemblyType = await Model.AssemblyType.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, assemblyType);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getAssemblyTypes = async (req, res, next) => {
  try {
    let assemblyTypes = await Model.AssemblyType.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, assemblyTypes);
  } catch (error) {
    next(error);
  }
}

// ChainType APIs
module.exports.createChainType = async (req, res, next) => {
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
    
    let chainType;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.ChainType.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Chain type not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.ChainType.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Chain type with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      chainType = await Model.ChainType.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, chainType);
    } else {
      // Check if chain type with same code already exists
      const existing = await Model.ChainType.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Chain type with this code already exists");
      }
      
      // Create new record
      chainType = await Model.ChainType.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, chainType);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getChainTypes = async (req, res, next) => {
  try {
    let chainTypes = await Model.ChainType.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, chainTypes);
  } catch (error) {
    next(error);
  }
}

// FinishDetail APIs
module.exports.createFinishDetail = async (req, res, next) => {
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
    
    let finishDetail;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.FinishDetail.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Finish detail not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.FinishDetail.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Finish detail with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      finishDetail = await Model.FinishDetail.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, finishDetail);
    } else {
      // Check if finish detail with same code already exists
      const existing = await Model.FinishDetail.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Finish detail with this code already exists");
      }
      
      // Create new record
      finishDetail = await Model.FinishDetail.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, finishDetail);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getFinishDetails = async (req, res, next) => {
  try {
    let finishDetails = await Model.FinishDetail.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, finishDetails);
  } catch (error) {
    next(error);
  }
}

// UnitOfSale APIs
module.exports.createUnitOfSale = async (req, res, next) => {
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
    
    let unitOfSale;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.UnitOfSale.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Unit of sale not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.UnitOfSale.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Unit of sale with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      unitOfSale = await Model.UnitOfSale.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, unitOfSale);
    } else {
      // Check if unit of sale with same code already exists
      const existing = await Model.UnitOfSale.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Unit of sale with this code already exists");
      }
      
      // Create new record
      unitOfSale = await Model.UnitOfSale.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, unitOfSale);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getUnitOfSales = async (req, res, next) => {
  try {
    let unitOfSales = await Model.UnitOfSale.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, unitOfSales);
  } catch (error) {
    next(error);
  }
}

// DropShape APIs
module.exports.createDropShape = async (req, res, next) => {
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
    
    let dropShape;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.DropShape.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Drop shape not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.DropShape.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Drop shape with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      dropShape = await Model.DropShape.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, dropShape);
    } else {
      // Check if drop shape with same code already exists
      const existing = await Model.DropShape.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Drop shape with this code already exists");
      }
      
      // Create new record
      dropShape = await Model.DropShape.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, dropShape);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getDropShapes = async (req, res, next) => {
  try {
    let dropShapes = await Model.DropShape.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, dropShapes);
  } catch (error) {
    next(error);
  }
}

// AttachmentType APIs
module.exports.createAttachmentType = async (req, res, next) => {
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
    
    let attachmentType;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.AttachmentType.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Attachment type not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.AttachmentType.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Attachment type with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      attachmentType = await Model.AttachmentType.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, attachmentType);
    } else {
      // Check if attachment type with same code already exists
      const existing = await Model.AttachmentType.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Attachment type with this code already exists");
      }
      
      // Create new record
      attachmentType = await Model.AttachmentType.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, attachmentType);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getAttachmentTypes = async (req, res, next) => {
  try {
    let attachmentTypes = await Model.AttachmentType.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, attachmentTypes);
  } catch (error) {
    next(error);
  }
}

// EarringOrientation APIs
module.exports.createEarringOrientation = async (req, res, next) => {
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
    
    let earringOrientation;
    
    // If id exists, update the existing record
    if (id) {
      // Check if record exists and is not deleted
      const existingRecord = await Model.EarringOrientation.findOne({
        _id: id,
        isDeleted: false
      });
      
      if (!existingRecord) {
        throw new Error("Earring orientation not found");
      }
      
      // Check if code conflicts with another record (excluding current record)
      const codeConflict = await Model.EarringOrientation.findOne({
        code: code,
        _id: { $ne: id },
        isDeleted: false
      });
      
      if (codeConflict) {
        throw new Error("Earring orientation with this code already exists");
      }
      
      // Update the record
      const updateData = { code, displayName };
      if (imagePath) {
        updateData.image = imagePath;
      }
      
      earringOrientation = await Model.EarringOrientation.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      return res.success(constants.MESSAGES.DATA_UPDATED, earringOrientation);
    } else {
      // Check if earring orientation with same code already exists
      const existing = await Model.EarringOrientation.findOne({
        code: code,
        isDeleted: false
      });
      
      if (existing) {
        throw new Error("Earring orientation with this code already exists");
      }
      
      // Create new record
      earringOrientation = await Model.EarringOrientation.create({ code, displayName, image: imagePath });
      return res.success(constants.MESSAGES.DATA_UPLOADED, earringOrientation);
    }
  } catch (error) {
    next(error);
  }
}

module.exports.getEarringOrientations = async (req, res, next) => {
  try {
    let earringOrientations = await Model.EarringOrientation.find({
      isDeleted: false
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, earringOrientations);
  } catch (error) {
    next(error);
  }
}

