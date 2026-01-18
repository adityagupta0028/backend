const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");

// Create HeroMenu
module.exports.createHeroMenu = async (req, res, next) => {
  try {
    await Validation.HeroMenu.createHeroMenu.validateAsync(req.body);
    
    // Check if category exists
    const category = await Model.Category.findOne({
      _id: req.body.categoryId,
      isDeleted: false
    });
    
    if (!category) {
      throw new Error("Category not found");
    }
    
    // Check if HeroMenu already exists for this category
    const existingHeroMenu = await Model.HeroMenu.findOne({
      categoryId: req.body.categoryId,
      isDeleted: false
    });
    
    if (existingHeroMenu) {
      throw new Error("Hero Menu already exists for this category. Please update the existing one.");
    }
    
    // Ensure we have exactly 4 columns
    if (!req.body.columns || req.body.columns.length !== 4) {
      throw new Error("Exactly 4 columns are required");
    }
    
    // Validate column indices are 0-3
    const columnIndices = req.body.columns.map(col => col.columnIndex).sort();
    for (let i = 0; i < 4; i++) {
      if (columnIndices[i] !== i) {
        throw new Error("Column indices must be 0, 1, 2, and 3");
      }
    }
    
    const heroMenu = await Model.HeroMenu.create(req.body);
    await heroMenu.populate('categoryId');
    
    return res.success(constants.MESSAGES.DATA_UPLOADED, heroMenu);
  } catch (error) {
    next(error);
  }
};

// Get All HeroMenus
module.exports.getHeroMenus = async (req, res, next) => {
  try {
    const heroMenus = await Model.HeroMenu.find({
      isDeleted: false
    })
      .populate('categoryId')
      .sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, heroMenus);
  } catch (error) {
    next(error);
  }
};

// Get HeroMenu by Category
module.exports.getHeroMenuByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    
    if (!categoryId) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "categoryId is required"
      });
    }
    
    const heroMenu = await Model.HeroMenu.findOne({
      categoryId,
      isDeleted: false
    }).populate('categoryId');
    
    if (!heroMenu) {
      return res.error(404, constants.MESSAGES.NOT_FOUND, {
        message: "Hero Menu not found for this category"
      });
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, heroMenu);
  } catch (error) {
    next(error);
  }
};

// Get HeroMenu Detail
module.exports.getHeroMenuDetail = async (req, res, next) => {
  try {
    const heroMenu = await Model.HeroMenu.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('categoryId');
    
    if (!heroMenu) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, heroMenu);
  } catch (error) {
    next(error);
  }
};

// Update HeroMenu
module.exports.updateHeroMenu = async (req, res, next) => {
  try {
    await Validation.HeroMenu.updateHeroMenu.validateAsync(req.body);
    
    const heroMenu = await Model.HeroMenu.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!heroMenu) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    // If category is being updated, verify it exists
    if (req.body.categoryId) {
      const category = await Model.Category.findOne({
        _id: req.body.categoryId,
        isDeleted: false
      });
      
      if (!category) {
        throw new Error("Category not found");
      }
      
      // Check if another HeroMenu exists for the new category
      const existingHeroMenu = await Model.HeroMenu.findOne({
        categoryId: req.body.categoryId,
        isDeleted: false,
        _id: { $ne: req.params.id }
      });
      
      if (existingHeroMenu) {
        throw new Error("Hero Menu already exists for this category");
      }
    }
    
    // If columns are being updated, validate them
    if (req.body.columns) {
      if (req.body.columns.length !== 4) {
        throw new Error("Exactly 4 columns are required");
      }
      
      // Validate column indices are 0-3
      const columnIndices = req.body.columns.map(col => col.columnIndex).sort();
      for (let i = 0; i < 4; i++) {
        if (columnIndices[i] !== i) {
          throw new Error("Column indices must be 0, 1, 2, and 3");
        }
      }
    }
    
    Object.assign(heroMenu, req.body);
    await heroMenu.save();
    await heroMenu.populate('categoryId');
    
    return res.success(constants.MESSAGES.UPDATED_SUCCESSFULLY, heroMenu);
  } catch (error) {
    next(error);
  }
};

// Delete HeroMenu
module.exports.deleteHeroMenu = async (req, res, next) => {
  try {
    const heroMenu = await Model.HeroMenu.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!heroMenu) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    heroMenu.isDeleted = true;
    await heroMenu.save();
    
    return res.success(constants.MESSAGES.DELETE_SUCCESSFUL, heroMenu);
  } catch (error) {
    next(error);
  }
};

