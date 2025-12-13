const Model = require("../../../models/index");
const constants = require("../../../common/constants");
const mongoose = require("mongoose");

module.exports.getCategories = async (req, res, next) => {
  try {
    // Find all active and non-deleted categories
    const categories = await Model.Category.find({
      isDeleted: false,
      isActive: true
    })
    .select('_id title categoryName image createdAt updatedAt')
    .sort({ createdAt: -1 });

    return res.success(constants.MESSAGES.DATA_FETCHED, {
      categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getSubcategories = async (req, res, next) => {
  try {
    // Get categoryId from query params or body
    const { categoryId } = req.query || req.body || {};

    if (!categoryId) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Category ID is required"
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Invalid Category ID format"
      });
    }

    // Find all active and non-deleted subcategories for the given category
    const subcategories = await Model.SubCategory.find({
      categoryId: new mongoose.Types.ObjectId(categoryId),
      isDeleted: false,
      isActive: true
    })
    .select('_id title subCategoryName image categoryId createdAt updatedAt')
    .sort({ createdAt: -1 });

    return res.success(constants.MESSAGES.DATA_FETCHED, {
      subcategories
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getCategoryDetail = async (req, res, next) => {
  try {
    // Get categoryId from query params or body
    const { categoryId } = req.query || req.body || {};

    if (!categoryId) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Category ID is required"
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Invalid Category ID format"
      });
    }

    // Find the category by ID
    const category = await Model.Category.findOne({
      _id: new mongoose.Types.ObjectId(categoryId),
      isDeleted: false,
      isActive: true
    })
    .select('_id title categoryName image createdAt updatedAt');

    if (!category) {
      return res.error(404, constants.MESSAGES.NOT_FOUND, {
        message: "Category not found"
      });
    }

    return res.success(constants.MESSAGES.DATA_FETCHED, {
      category
    });
  } catch (error) {
    next(error);
  }
};

