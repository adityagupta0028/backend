const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const { uploadFileToS3 } = require("../../../services/uploadS3Service");

// Create Product
module.exports.createProduct = async (req, res, next) => {
  // Parse variants from JSON string (multipart/form-data case)
if (req.body.variants) {
  if (typeof req.body.variants === 'string') {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch (e) {
      // Invalid JSON from frontend
      return next(new Error('Invalid variants JSON'));
    }
  }
}

  try {
    await Validation.Product.createProduct.validateAsync(req.body);
   console.log("req.body", req.body);if (Array.isArray(req.body.variants)) {
    req.body.variants = req.body.variants.map(v => ({
      diamond_type: v.diamond_type,
      carat_weight: v.carat_weight,
      metal_type: v.metal_type,
      price: Number(v.price),
      discounted_price: Number(v.discounted_price),
    }));
  } else {
    req.body.variants = [];
  }
    if (!req.body.product_id || req.body.product_id.trim() === '') {
      // Generate a unique product_id
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      req.body.product_id = `PROD-${timestamp}-${random}`;
    }
    
    // Check if product_id already exists
    let existingProduct = await Model.Product.findOne({
      product_id: req.body.product_id,
      isDeleted: false
    });
    
    if (existingProduct) {
      throw new Error("Product with this product_id already exists");
    }
    
    // Normalize status (lowercase to capitalized)
    if (req.body.status) {
      const statusLower = req.body.status.toLowerCase();
      if (statusLower === 'active') {
        req.body.status = 'Active';
      } else if (statusLower === 'inactive') {
        req.body.status = 'Inactive';
      } else if (statusLower === 'draft') {
        req.body.status = 'Draft';
      } else {
        req.body.status = 'Active'; // Default to Active
      }
    } else {
      req.body.status = 'Active'; // Default to Active
    }
    
    // Normalize diamond origin values
    if (req.body.diamond_origin) {
      const normalizeDiamondOrigin = (value) => {
        const lower = value.toLowerCase();
        if (lower === 'natural') return 'Natural';
        if (lower === 'lab grown' || lower === 'lab-grown') return 'Lab Grown';
        return value; // Keep original if not recognized
      };
      
      if (Array.isArray(req.body.diamond_origin)) {
        req.body.diamond_origin = req.body.diamond_origin.map(normalizeDiamondOrigin);
      } else {
        req.body.diamond_origin = [normalizeDiamondOrigin(req.body.diamond_origin)];
      }
    }
    
    // Normalize metal type values (15K to 14K if needed, or keep as is)
    if (req.body.metal_type) {
      const normalizeMetalType = (value) => {
        // Map 15K to 14K if needed, or keep original
        if (typeof value === 'string') {
          return value.replace(/15K/g, '14K');
        }
        return value;
      };
      
      if (Array.isArray(req.body.metal_type)) {
        req.body.metal_type = req.body.metal_type.map(normalizeMetalType);
      } else {
        req.body.metal_type = [normalizeMetalType(req.body.metal_type)];
      }
    }
    
    // Normalize diamond quality values (map frontend values to backend values)
    if (req.body.diamond_quality) {
      const normalizeDiamondQuality = (value) => {
        const lower = value.toLowerCase();
        if (lower.includes('excellent') || lower.includes('best')) return 'Best - D, VVS';
        if (lower.includes('very good') || lower.includes('better')) return 'Better - E, VS1';
        if (lower.includes('good')) return 'Good - F, VS2';
        return value; // Keep original if not recognized
      };
      
      if (Array.isArray(req.body.diamond_quality)) {
        req.body.diamond_quality = req.body.diamond_quality.map(normalizeDiamondQuality);
      } else {
        req.body.diamond_quality = [normalizeDiamondQuality(req.body.diamond_quality)];
      }
    }
    
    // Normalize arrays - convert single values to arrays
    const normalizeArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };
    const normalizeArraySubCategory = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };
    // Normalize array fields
    if (req.body.categoryId) {
      req.body.categoryId = normalizeArray(req.body.categoryId);
    }
    if (req.body.subCategoryId) {
      req.body.subCategoryId = normalizeArraySubCategory(req.body.subCategoryId);
    }
    // metal_type and diamond_origin are already normalized above, but ensure they're arrays
    if (req.body.metal_type && !Array.isArray(req.body.metal_type)) {
      req.body.metal_type = [req.body.metal_type];
    }
    if (req.body.diamond_origin && !Array.isArray(req.body.diamond_origin)) {
      req.body.diamond_origin = [req.body.diamond_origin];
    }
    if (req.body.carat_weight) {
      req.body.carat_weight = normalizeArray(req.body.carat_weight);
      // Convert strings to numbers
      req.body.carat_weight = req.body.carat_weight.map(w => {
        const num = typeof w === 'string' ? parseFloat(w) : w;
        return isNaN(num) ? w : num;
      });
    }
    if (req.body.diamond_quality) {
      req.body.diamond_quality = normalizeArray(req.body.diamond_quality);
    }
    if (req.body.ring_size) {
      req.body.ring_size = normalizeArray(req.body.ring_size);
      // Convert strings to numbers
      req.body.ring_size = req.body.ring_size.map(s => {
        const num = typeof s === 'string' ? parseInt(s) : s;
        return isNaN(num) ? s : num;
      });
    }
    if (req.body.necklace_size) {
      req.body.necklace_size = normalizeArray(req.body.necklace_size);
    }

    if (req.body.categoryId && Array.isArray(req.body.categoryId)) {
      const categories = await Model.Category.find({
        _id: { $in: req.body.categoryId },
        isDeleted: false
      });
      
      if (categories.length !== req.body.categoryId.length) {
        throw new Error("One or more categories not found");
      }
    }
    
    // Check if subcategories exist
    if (req.body.subCategoryId && Array.isArray(req.body.subCategoryId)) {
      const subCategories = await Model.SubCategory.find({
        _id: { $in: req.body.subCategoryId },
        isDeleted: false
      });
      
      if (subCategories.length !== req.body.subCategoryId.length) {
        throw new Error("One or more subcategories not found");
      }
    }

    // Validate radio button fields (single ObjectId)
    if (req.body.settingConfigurations) {
      const settingConfig = await Model.SettingConfigurations.findOne({
        _id: req.body.settingConfigurations,
        isDeleted: false
      });
      if (!settingConfig) {
        throw new Error("Setting configuration not found");
      }
    }

    if (req.body.shankConfigurations) {
      const shankConfig = await Model.ShankConfigurations.findOne({
        _id: req.body.shankConfigurations,
        isDeleted: false
      });
      if (!shankConfig) {
        throw new Error("Shank configuration not found");
      }
    }

    if (req.body.holdingMethods) {
      const holdingMethod = await Model.HoldingMethods.findOne({
        _id: req.body.holdingMethods,
        isDeleted: false
      });
      if (!holdingMethod) {
        throw new Error("Holding method not found");
      }
    }

    if (req.body.bandProfileShapes) {
      const bandProfileShape = await Model.BandProfileShapes.findOne({
        _id: req.body.bandProfileShapes,
        isDeleted: false
      });
      if (!bandProfileShape) {
        throw new Error("Band profile shape not found");
      }
    }

    if (req.body.bandWidthCategories) {
      const bandWidthCategory = await Model.BandWidthCategories.findOne({
        _id: req.body.bandWidthCategories,
        isDeleted: false
      });
      if (!bandWidthCategory) {
        throw new Error("Band width category not found");
      }
    }

    if (req.body.bandFits) {
      const bandFit = await Model.BandFits.findOne({
        _id: req.body.bandFits,
        isDeleted: false
      });
      if (!bandFit) {
        throw new Error("Band fit not found");
      }
    }

    // Normalize and validate multi-select dropdown fields (array of ObjectIds)
    const normalizeObjectIdArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };

    if (req.body.shankTreatments) {
      req.body.shankTreatments = normalizeObjectIdArray(req.body.shankTreatments);
      const shankTreatments = await Model.ShankTreatments.find({
        _id: { $in: req.body.shankTreatments },
        isDeleted: false
      });
      if (shankTreatments.length !== req.body.shankTreatments.length) {
        throw new Error("One or more shank treatments not found");
      }
    }

    if (req.body.styles) {
      req.body.styles = normalizeObjectIdArray(req.body.styles);
      const styles = await Model.Styles.find({
        _id: { $in: req.body.styles },
        isDeleted: false
      });
      if (styles.length !== req.body.styles.length) {
        throw new Error("One or more styles not found");
      }
    }

    if (req.body.settingFeatures) {
      req.body.settingFeatures = normalizeObjectIdArray(req.body.settingFeatures);
      const settingFeatures = await Model.SettingFeatures.find({
        _id: { $in: req.body.settingFeatures },
        isDeleted: false
      });
      if (settingFeatures.length !== req.body.settingFeatures.length) {
        throw new Error("One or more setting features not found");
      }
    }

    if (req.body.motifThemes) {
      req.body.motifThemes = normalizeObjectIdArray(req.body.motifThemes);
      const motifThemes = await Model.MotifThemes.find({
        _id: { $in: req.body.motifThemes },
        isDeleted: false
      });
      if (motifThemes.length !== req.body.motifThemes.length) {
        throw new Error("One or more motif themes not found");
      }
    }

    if (req.body.ornamentDetails) {
      req.body.ornamentDetails = normalizeObjectIdArray(req.body.ornamentDetails);
      const ornamentDetails = await Model.OrnamentDetails.find({
        _id: { $in: req.body.ornamentDetails },
        isDeleted: false
      });
      if (ornamentDetails.length !== req.body.ornamentDetails.length) {
        throw new Error("One or more ornament details not found");
      }
    }

    if (req.body.accentStoneShapes) {
      req.body.accentStoneShapes = normalizeObjectIdArray(req.body.accentStoneShapes);
      const accentStoneShapes = await Model.AccentStoneShapes.find({
        _id: { $in: req.body.accentStoneShapes },
        isDeleted: false
      });
      if (accentStoneShapes.length !== req.body.accentStoneShapes.length) {
        throw new Error("One or more accent stone shapes not found");
      }
    }

    // Validate matching band product ID if matching band is available
    if (req.body.matching_band_available && req.body.matching_band_product_id) {
      const matchingProduct = await Model.Product.findOne({
        _id: req.body.matching_band_product_id,
        isDeleted: false
      });
      
      if (!matchingProduct) {
        throw new Error("Matching band product not found");
      }
    } else if (req.body.matching_band_available && !req.body.matching_band_product_id) {
      throw new Error("Matching band product ID is required when matching band is available");
    } else if (!req.body.matching_band_available) {
      req.body.matching_band_product_id = null;
    }
    
    // Handle images - if files are uploaded, add their paths
    if (req.files && req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map(file => "/uploads/" + file.filename);
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
    if (req.files && req.files.videos && req.files.videos.length > 0) {
      req.body.videos = req.files.videos.map(file => "/uploads/" + file.filename);
    } else if (req.body.videos) {
      // If videos are provided in body
      if (typeof req.body.videos === 'string') {
        req.body.videos = [req.body.videos];
      } else if (!Array.isArray(req.body.videos)) {
        req.body.videos = [];
      }
    } else {
      req.body.videos = [];
    }
    
    // Convert tags string to array if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    // Convert empty strings to null for enum fields to avoid validation errors
    if (req.body.back_type === '' || req.body.back_type === undefined) {
      req.body.back_type = null;
    }
    if (req.body.product_type === '' || req.body.product_type === undefined) {
      req.body.product_type = null;
    }
    if (req.body.viewAngle === '' || req.body.viewAngle === undefined) {
      req.body.viewAngle = null;
    }
   
    
    let product = await Model.Product.create(req.body);
    await product.populate([
      'categoryId',
      'subCategoryId',
      'settingConfigurations',
      'shankConfigurations',
      'holdingMethods',
      'bandProfileShapes',
      'bandWidthCategories',
      'bandFits',
      'shankTreatments',
      'styles',
      'settingFeatures',
      'motifThemes',
      'ornamentDetails',
      'accentStoneShapes'
    ]);
    
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
    
    // Filter by category (support both single and array)
    if (req.query.categoryId) {
      query.categoryId = Array.isArray(req.query.categoryId) 
        ? { $in: req.query.categoryId }
        : req.query.categoryId;
    }
    
    // Filter by subcategory (support both single and array)
    if (req.query.subCategoryId) {
      query.subCategoryId = Array.isArray(req.query.subCategoryId)
        ? { $in: req.query.subCategoryId }
        : req.query.subCategoryId;
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
    
    // Filter by metal type (support both single and array)
    if (req.query.metal_type) {
      query.metal_type = Array.isArray(req.query.metal_type)
        ? { $in: req.query.metal_type }
        : req.query.metal_type;
    }
    
    // Filter by diamond origin (support both single and array)
    if (req.query.diamond_origin) {
      query.diamond_origin = Array.isArray(req.query.diamond_origin)
        ? { $in: req.query.diamond_origin }
        : req.query.diamond_origin;
    }
    
    let products = await Model.Product.find(query)
      .populate([
        'categoryId',
        'subCategoryId',
        'settingConfigurations',
        'shankConfigurations',
        'holdingMethods',
        'bandProfileShapes',
        'bandWidthCategories',
        'bandFits',
        'shankTreatments',
        'styles',
        'settingFeatures',
        'motifThemes',
        'ornamentDetails',
        'accentStoneShapes'
      ])
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
    }).populate([
      'categoryId',
      'subCategoryId',
      'settingConfigurations',
      'shankConfigurations',
      'holdingMethods',
      'bandProfileShapes',
      'bandWidthCategories',
      'bandFits',
      'shankTreatments',
      'styles',
      'settingFeatures',
      'motifThemes',
      'ornamentDetails',
      'accentStoneShapes'
    ]);
    
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
    }).populate([
      'categoryId',
      'subCategoryId',
      'settingConfigurations',
      'shankConfigurations',
      'holdingMethods',
      'bandProfileShapes',
      'bandWidthCategories',
      'bandFits',
      'shankTreatments',
      'styles',
      'settingFeatures',
      'motifThemes',
      'ornamentDetails',
      'accentStoneShapes'
    ]);
    
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
    
    // Normalize arrays - convert single values to arrays
    const normalizeArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };

    // Normalize array fields
    if (req.body.categoryId) {
      req.body.categoryId = normalizeArray(req.body.categoryId);
    }
    if (req.body.subCategoryId) {
      req.body.subCategoryId = normalizeArray(req.body.subCategoryId);
    }
    if (req.body.metal_type) {
      req.body.metal_type = normalizeArray(req.body.metal_type);
    }
    if (req.body.diamond_origin) {
      req.body.diamond_origin = normalizeArray(req.body.diamond_origin);
    }
    if (req.body.carat_weight) {
      req.body.carat_weight = normalizeArray(req.body.carat_weight);
    }
    if (req.body.diamond_quality) {
      req.body.diamond_quality = normalizeArray(req.body.diamond_quality);
    }
    if (req.body.ring_size) {
      req.body.ring_size = normalizeArray(req.body.ring_size);
    }
    if (req.body.necklace_size) {
      req.body.necklace_size = normalizeArray(req.body.necklace_size);
    }

    // If categories are being updated, verify they exist
    if (req.body.categoryId && Array.isArray(req.body.categoryId)) {
      const categories = await Model.Category.find({
        _id: { $in: req.body.categoryId },
        isDeleted: false
      });
      
      if (categories.length !== req.body.categoryId.length) {
        throw new Error("One or more categories not found");
      }
    }
    
    // If subcategories are being updated, verify they exist
    if (req.body.subCategoryId && Array.isArray(req.body.subCategoryId)) {
      const subCategories = await Model.SubCategory.find({
        _id: { $in: req.body.subCategoryId },
        isDeleted: false
      });
      
      if (subCategories.length !== req.body.subCategoryId.length) {
        throw new Error("One or more subcategories not found");
      }
    }

    // Validate radio button fields (single ObjectId) if being updated
    if (req.body.settingConfigurations) {
      const settingConfig = await Model.SettingConfigurations.findOne({
        _id: req.body.settingConfigurations,
        isDeleted: false
      });
      if (!settingConfig) {
        throw new Error("Setting configuration not found");
      }
    }

    if (req.body.shankConfigurations) {
      const shankConfig = await Model.ShankConfigurations.findOne({
        _id: req.body.shankConfigurations,
        isDeleted: false
      });
      if (!shankConfig) {
        throw new Error("Shank configuration not found");
      }
    }

    if (req.body.holdingMethods) {
      const holdingMethod = await Model.HoldingMethods.findOne({
        _id: req.body.holdingMethods,
        isDeleted: false
      });
      if (!holdingMethod) {
        throw new Error("Holding method not found");
      }
    }

    if (req.body.bandProfileShapes) {
      const bandProfileShape = await Model.BandProfileShapes.findOne({
        _id: req.body.bandProfileShapes,
        isDeleted: false
      });
      if (!bandProfileShape) {
        throw new Error("Band profile shape not found");
      }
    }

    if (req.body.bandWidthCategories) {
      const bandWidthCategory = await Model.BandWidthCategories.findOne({
        _id: req.body.bandWidthCategories,
        isDeleted: false
      });
      if (!bandWidthCategory) {
        throw new Error("Band width category not found");
      }
    }

    if (req.body.bandFits) {
      const bandFit = await Model.BandFits.findOne({
        _id: req.body.bandFits,
        isDeleted: false
      });
      if (!bandFit) {
        throw new Error("Band fit not found");
      }
    }

    // Normalize and validate multi-select dropdown fields (array of ObjectIds) if being updated
    const normalizeObjectIdArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };

    if (req.body.shankTreatments) {
      req.body.shankTreatments = normalizeObjectIdArray(req.body.shankTreatments);
      const shankTreatments = await Model.ShankTreatments.find({
        _id: { $in: req.body.shankTreatments },
        isDeleted: false
      });
      if (shankTreatments.length !== req.body.shankTreatments.length) {
        throw new Error("One or more shank treatments not found");
      }
    }

    if (req.body.styles) {
      req.body.styles = normalizeObjectIdArray(req.body.styles);
      const styles = await Model.Styles.find({
        _id: { $in: req.body.styles },
        isDeleted: false
      });
      if (styles.length !== req.body.styles.length) {
        throw new Error("One or more styles not found");
      }
    }

    if (req.body.settingFeatures) {
      req.body.settingFeatures = normalizeObjectIdArray(req.body.settingFeatures);
      const settingFeatures = await Model.SettingFeatures.find({
        _id: { $in: req.body.settingFeatures },
        isDeleted: false
      });
      if (settingFeatures.length !== req.body.settingFeatures.length) {
        throw new Error("One or more setting features not found");
      }
    }

    if (req.body.motifThemes) {
      req.body.motifThemes = normalizeObjectIdArray(req.body.motifThemes);
      const motifThemes = await Model.MotifThemes.find({
        _id: { $in: req.body.motifThemes },
        isDeleted: false
      });
      if (motifThemes.length !== req.body.motifThemes.length) {
        throw new Error("One or more motif themes not found");
      }
    }

    if (req.body.ornamentDetails) {
      req.body.ornamentDetails = normalizeObjectIdArray(req.body.ornamentDetails);
      const ornamentDetails = await Model.OrnamentDetails.find({
        _id: { $in: req.body.ornamentDetails },
        isDeleted: false
      });
      if (ornamentDetails.length !== req.body.ornamentDetails.length) {
        throw new Error("One or more ornament details not found");
      }
    }

    if (req.body.accentStoneShapes) {
      req.body.accentStoneShapes = normalizeObjectIdArray(req.body.accentStoneShapes);
      const accentStoneShapes = await Model.AccentStoneShapes.find({
        _id: { $in: req.body.accentStoneShapes },
        isDeleted: false
      });
      if (accentStoneShapes.length !== req.body.accentStoneShapes.length) {
        throw new Error("One or more accent stone shapes not found");
      }
    }

    // Validate matching band product ID if matching band is available
    if (req.body.matching_band_available !== undefined) {
      if (req.body.matching_band_available && req.body.matching_band_product_id) {
        const matchingProduct = await Model.Product.findOne({
          _id: req.body.matching_band_product_id,
          isDeleted: false,
          _id: { $ne: req.params.id }
        });
        
        if (!matchingProduct) {
          throw new Error("Matching band product not found");
        }
      } else if (req.body.matching_band_available && !req.body.matching_band_product_id) {
        throw new Error("Matching band product ID is required when matching band is available");
      } else if (!req.body.matching_band_available) {
        req.body.matching_band_product_id = null;
      }
    }
    
    // Handle images - if files are uploaded, add their paths
    if (req.files && req.files.images && req.files.images.length > 0) {
      const newImages = req.files.images.map(file => "/uploads/" + file.filename);
      req.body.images = req.body.images 
        ? [...req.body.images, ...newImages] 
        : [...product.images, ...newImages];
    } else if (req.body.images && typeof req.body.images === 'string') {
      req.body.images = [req.body.images];
    }
    
    // Handle videos - if files are uploaded, add their paths
    if (req.files && req.files.videos && req.files.videos.length > 0) {
      const newVideos = req.files.videos.map(file => "/uploads/" + file.filename);
      req.body.videos = req.body.videos 
        ? [...req.body.videos, ...newVideos] 
        : product.videos 
          ? [...product.videos, ...newVideos] 
          : [...newVideos];
    } else if (req.body.videos && typeof req.body.videos === 'string') {
      req.body.videos = [req.body.videos];
    } else if (!req.body.videos) {
      // Keep existing videos if not provided
      req.body.videos = product.videos || [];
    }
    
    // Convert tags string to array if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    // Convert empty strings to null for enum fields to avoid validation errors
    if (req.body.back_type === '' || req.body.back_type === undefined) {
      req.body.back_type = null;
    }
    if (req.body.product_type === '' || req.body.product_type === undefined) {
      req.body.product_type = null;
    }
    if (req.body.viewAngle === '' || req.body.viewAngle === undefined) {
      req.body.viewAngle = null;
    }
    
    Object.assign(product, req.body);
    await product.save();
    await product.populate([
      'categoryId',
      'subCategoryId',
      'settingConfigurations',
      'shankConfigurations',
      'holdingMethods',
      'bandProfileShapes',
      'bandWidthCategories',
      'bandFits',
      'shankTreatments',
      'styles',
      'settingFeatures',
      'motifThemes',
      'ornamentDetails',
      'accentStoneShapes'
    ]);
    
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

