const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const { uploadFileToS3 } = require("../../../services/uploadS3Service");
const fs = require("fs");

// Create Category
module.exports.createCategory = async (req, res, next) => {
  try {
    await Validation.Category.createCategory.validateAsync(req.body);
    
    // Check if category with same categoryName already exists
    let existingCategory = await Model.Category.findOne({
      categoryName: req.body.categoryName,
      isDeleted: false
    });
    
    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }
    if (req.file) {
          const fileFullPath = req.file.path;
          let filePath = `uploads/${req.file.filename}`;
          const bucketName = "merefunds";
          const fileUrl = await uploadFileToS3(
            fileFullPath,
            bucketName,
            filePath
          );
          fs.unlinkSync(fileFullPath);
          req.body.image = "/" + filePath;
        } 
    
    let category = await Model.Category.create(req.body);
    return res.success(constants.MESSAGES.DATA_UPLOADED, category);
  } catch (error) {
    next(error);
  }
}

// Get All Categories
module.exports.getCategories = async (req, res, next) => {
  try {
    let categories = await Model.Category.find({
      isDeleted: false,
      isActive: true
    }).sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, categories);
  } catch (error) {
    next(error);
  }
}

// Get Category Detail
module.exports.getCategoryDetail = async (req, res, next) => {
  try {
    let category = await Model.Category.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!category) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, category);
  } catch (error) {
    next(error);
  }
}

// Update Category
module.exports.updateCategory = async (req, res, next) => {
  try {
    await Validation.Category.updateCategory.validateAsync(req.body);
    
    let category = await Model.Category.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!category) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    // Check if categoryName is being updated and if it already exists
    if (req.body.categoryName && req.body.categoryName !== category.categoryName) {
      let existingCategory = await Model.Category.findOne({
        categoryName: req.body.categoryName,
        isDeleted: false,
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        throw new Error("Category with this name already exists");
      }
    }
    
    if (req.file) {
      const fileFullPath = req.file.path;
      let filePath = `uploads/${req.file.filename}`;
      const bucketName = "merefunds";
      const fileUrl = await uploadFileToS3(
        fileFullPath,
        bucketName,
        filePath
      );
      fs.unlinkSync(fileFullPath);
      req.body.image = "/" + filePath;
    } 
    Object.assign(category, req.body);
    await category.save();
    
    return res.success(constants.MESSAGES.UPDATED_SUCCESSFULLY, category);
  } catch (error) {
    next(error);
  }
}

// Delete Category
module.exports.deleteCategory = async (req, res, next) => {
  try {
    let category = await Model.Category.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!category) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    category.isDeleted = true;
    await category.save();
    
    return res.success(constants.MESSAGES.DELETE_SUCCESSFUL, category);
  } catch (error) {
    next(error);
  }
}

// Create SubCategory
module.exports.createSubCategory = async (req, res, next) => {
  try {
    await Validation.Category.createSubCategory.validateAsync(req.body);
    
    // Check if category exists
    let category = await Model.Category.findOne({
      _id: req.body.categoryId,
      isDeleted: false
    });
    
    if (!category) {
      throw new Error("Category not found");
    }
    
  
    if (req.file) {
      const fileFullPath = req.file.path;
      let filePath = `uploads/${req.file.filename}`;
      const bucketName = "merefunds";
      const fileUrl = await uploadFileToS3(
        fileFullPath,
        bucketName,
        filePath
      );
      fs.unlinkSync(fileFullPath);
      req.body.image = "/" + filePath;
    } 
    
    let subCategory = await Model.SubCategory.create(req.body);
    // Populate category info
    await subCategory.populate('categoryId');
    
    return res.success(constants.MESSAGES.DATA_UPLOADED, subCategory);
  } catch (error) {
    next(error);
  }
}

// Get All SubCategories
module.exports.getSubCategories = async (req, res, next) => {
  try {
    let query = {
      isDeleted: false,
      isActive: true
    };
    
    // If category ID is provided, filter by category
    if (req.query.categoryId) {
      query.categoryId = req.query.categoryId;
    }
    
    let subCategories = await Model.SubCategory.find(query)
      .populate('categoryId')
      .sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, subCategories);
  } catch (error) {
    next(error);
  }
}

// Get SubCategory Detail
module.exports.getSubCategoryDetail = async (req, res, next) => {
  try {
    let subCategory = await Model.SubCategory.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('category');
    
    if (!subCategory) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, subCategory);
  } catch (error) {
    next(error);
  }
}

// Update SubCategory
module.exports.updateSubCategory = async (req, res, next) => {
  try {
    await Validation.Category.updateSubCategory.validateAsync(req.body);
    
    let subCategory = await Model.SubCategory.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!subCategory) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    // If category is being updated, verify it exists
    if (req.body.categoryId) {
      let category = await Model.Category.findOne({
        _id: req.body.categoryId,
        isDeleted: false
      });
      
      if (!category) {
        throw new Error("Category not found");
      }
    }
    
    if (req.file) {
      const fileFullPath = req.file.path;
      let filePath = `uploads/${req.file.filename}`;
      const bucketName = "merefunds";
      const fileUrl = await uploadFileToS3(
        fileFullPath,
        bucketName,
        filePath
      );
      fs.unlinkSync(fileFullPath);
      req.body.image = "/" + filePath;
    } 
    
    Object.assign(subCategory, req.body);
    await subCategory.save();
    await subCategory.populate('categoryId');
    
    return res.success(constants.MESSAGES.UPDATED_SUCCESSFULLY, subCategory);
  } catch (error) {
    next(error);
  }
}

// Delete SubCategory
module.exports.deleteSubCategory = async (req, res, next) => {
  try {
    let subCategory = await Model.SubCategory.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!subCategory) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    subCategory.isDeleted = true;
    await subCategory.save();
    
    return res.success(constants.MESSAGES.DELETE_SUCCESSFUL, subCategory);
  } catch (error) {
    next(error);
  }
}

