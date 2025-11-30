const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");

// Create Product
module.exports.createProduct = async (req, res, next) => {
  try {
    await Validation.Product.createProduct.validateAsync(req.body);
    
    // Check if product_id already exists
    let existingProduct = await Model.Product.findOne({
      product_id: req.body.product_id,
      isDeleted: false
    });
    
    if (existingProduct) {
      throw new Error("Product with this product_id already exists");
    }
    
    // Check if category exists
    let category = await Model.Category.findOne({
      _id: req.body.categoryId,
      isDeleted: false
    });
    
    if (!category) {
      throw new Error("Category not found");
    }
    
    // Check if subcategory exists and belongs to the category
    let subCategory = await Model.SubCategory.findOne({
      _id: req.body.subCategoryId,
      categoryId: req.body.categoryId,
      isDeleted: false
    });
    
    if (!subCategory) {
      throw new Error("SubCategory not found or does not belong to the specified category");
    }
    
    // Handle images - if files are uploaded, add their paths
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => "/uploads/" + file.filename);
    } else if (req.body.images) {
      // If images are provided in body
      if (typeof req.body.images === 'string') {
        // If images is a string (single image), convert to array
        req.body.images = [req.body.images];
      } else if (Array.isArray(req.body.images) && req.body.images.length === 0) {
        throw new Error("At least one image is required");
      }
    } else {
      throw new Error("At least one image is required");
    }
    
    // Handle videos - if files are uploaded
    // if (req.body.videos && typeof req.body.videos === 'string') {
    //   req.body.videos = [req.body.videos];
    // }
    
    // Convert tags string to array if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    let product = await Model.Product.create(req.body);
    await product.populate('categoryId subCategoryId');
    
    return res.success(constants.MESSAGES.DATA_UPLOADED, product);
  } catch (error) {
    next(error);
  }
}

// Get All Products
module.exports.getProducts = async (req, res, next) => {
  try {
    let query = {
      isDeleted: false
    };
    
    // Filter by category
    if (req.query.categoryId) {
      query.categoryId = req.query.categoryId;
    }
    
    // Filter by subcategory
    if (req.query.subCategoryId) {
      query.subCategoryId = req.query.subCategoryId;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = "Active"; // Default to active products
    }
    
    // Filter by product type
    if (req.query.product_type) {
      query.product_type = req.query.product_type;
    }
    
    // Filter by metal type
    if (req.query.metal_type) {
      query.metal_type = req.query.metal_type;
    }
    
    // Filter by diamond origin
    if (req.query.diamond_origin) {
      query.diamond_origin = req.query.diamond_origin;
    }
    
    let products = await Model.Product.find(query)
      .populate('categoryId subCategoryId')
      .sort({ createdAt: -1 });
    
    return res.success(constants.MESSAGES.DATA_FETCHED, products);
  } catch (error) {
    next(error);
  }
}

// Get Product Detail
module.exports.getProductDetail = async (req, res, next) => {
  try {
    let product = await Model.Product.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('categoryId subCategoryId');
    
    if (!product) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, product);
  } catch (error) {
    next(error);
  }
}

// Get Product by product_id
module.exports.getProductByProductId = async (req, res, next) => {
  try {
    let product = await Model.Product.findOne({
      product_id: req.params.product_id,
      isDeleted: false
    }).populate('categoryId subCategoryId');
    
    if (!product) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, product);
  } catch (error) {
    next(error);
  }
}

// Update Product
module.exports.updateProduct = async (req, res, next) => {
  try {
    await Validation.Product.updateProduct.validateAsync(req.body);
    
    let product = await Model.Product.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!product) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    // Check if product_id is being updated and if it already exists
    if (req.body.product_id && req.body.product_id !== product.product_id) {
      let existingProduct = await Model.Product.findOne({
        product_id: req.body.product_id,
        isDeleted: false,
        _id: { $ne: req.params.id }
      });
      
      if (existingProduct) {
        throw new Error("Product with this product_id already exists");
      }
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
    
    // If subcategory is being updated, verify it exists and belongs to category
    if (req.body.subCategoryId) {
      const categoryId = req.body.categoryId || product.categoryId;
      let subCategory = await Model.SubCategory.findOne({
        _id: req.body.subCategoryId,
        categoryId: categoryId,
        isDeleted: false
      });
      
      if (!subCategory) {
        throw new Error("SubCategory not found or does not belong to the specified category");
      }
    }
    
    // Handle images - if files are uploaded, add their paths
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => "/uploads/" + file.filename);
      req.body.images = req.body.images 
        ? [...req.body.images, ...newImages] 
        : [...product.images, ...newImages];
    } else if (req.body.images && typeof req.body.images === 'string') {
      req.body.images = [req.body.images];
    }
    
    // Handle videos
    if (req.body.videos && typeof req.body.videos === 'string') {
      req.body.videos = [req.body.videos];
    }
    
    // Convert tags string to array if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    Object.assign(product, req.body);
    await product.save();
    await product.populate('categoryId subCategoryId');
    
    return res.success(constants.MESSAGES.UPDATED_SUCCESSFULLY, product);
  } catch (error) {
    next(error);
  }
}

// Delete Product
module.exports.deleteProduct = async (req, res, next) => {
  try {
    let product = await Model.Product.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!product) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    product.isDeleted = true;
    await product.save();
    
    return res.success(constants.MESSAGES.DELETE_SUCCESSFUL, product);
  } catch (error) {
    next(error);
  }
}

