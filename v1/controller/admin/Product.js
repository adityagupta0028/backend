const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const { uploadFileToS3 } = require("../../../services/uploadS3Service");
const fs = require("fs");
const csv = require("csv-parser");
const Joi = require("joi").defaults((schema) => {
  switch (schema.type) {
    case "string":
      return schema.replace(/\s+/, " ");
    default:
      return schema;
  }
});
Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");
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

  // Parse productDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.productDetailsConfiguration) {
    if (typeof req.body.productDetailsConfiguration === 'string') {
      try {
        req.body.productDetailsConfiguration = JSON.parse(req.body.productDetailsConfiguration);
      } catch (e) {
        // Invalid JSON from frontend
        return next(new Error('Invalid productDetailsConfiguration JSON'));
      }
    }
  }

  // Parse centerStoneDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.centerStoneDetailsConfiguration) {
    if (typeof req.body.centerStoneDetailsConfiguration === 'string') {
      try {
        req.body.centerStoneDetailsConfiguration = JSON.parse(req.body.centerStoneDetailsConfiguration);
      } catch (e) {
        // Invalid JSON from frontend
        return next(new Error('Invalid centerStoneDetailsConfiguration JSON'));
      }
    }
  }

  // Parse sideStoneDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.sideStoneDetailsConfiguration) {
    if (typeof req.body.sideStoneDetailsConfiguration === 'string') {
      try {
        req.body.sideStoneDetailsConfiguration = JSON.parse(req.body.sideStoneDetailsConfiguration);
      } catch (e) {
        // Invalid JSON from frontend
        return next(new Error('Invalid sideStoneDetailsConfiguration JSON'));
      }
    }
  }

  // Parse stoneDetailsFormConfiguration from JSON string (multipart/form-data case)
  if (req.body.stoneDetailsFormConfiguration) {
    if (typeof req.body.stoneDetailsFormConfiguration === 'string') {
      try {
        req.body.stoneDetailsFormConfiguration = JSON.parse(req.body.stoneDetailsFormConfiguration);
      } catch (e) {
        // Invalid JSON from frontend
        return next(new Error('Invalid stoneDetailsFormConfiguration JSON'));
      }
    }
  }

  // Parse carat_min_weights from JSON string (multipart/form-data case)
  if (req.body.carat_min_weights) {
    if (typeof req.body.carat_min_weights === 'string') {
      try {
        req.body.carat_min_weights = JSON.parse(req.body.carat_min_weights);
      } catch (e) {
        // Invalid JSON from frontend
        return next(new Error('Invalid carat_min_weights JSON'));
      }
    }
  }

  try {
    await Validation.Product.createProduct.validateAsync(req.body);
    console.log("req.body", req.body); 
    if (Array.isArray(req.body.variants)) {
      req.body.variants = req.body.variants.map(v => ({
        diamond_type: v.diamond_type,
        carat_weight: v.carat_weight,
        metal_type: v.metal_type,
        diamond_quality: v.diamond_quality || '',
        shape: v.shape || '',
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
      // Validate that only one category is provided
      if (req.body.categoryId.length > 1) {
        throw new Error("Only one category is allowed per product");
      }
    }
    if (req.body.subCategoryId) {
      req.body.subCategoryId = normalizeArraySubCategory(req.body.subCategoryId);
    }
    if (req.body.subSubCategoryId) {
      req.body.subSubCategoryId = normalizeArraySubCategory(req.body.subSubCategoryId);
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
    if (req.body.stone) {
      req.body.stone = normalizeArray(req.body.stone);
    }
    if (req.body.design_styles) {
      req.body.design_styles = normalizeArray(req.body.design_styles);
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

    // Check if subSubCategories exist
    if (req.body.subSubCategoryId && Array.isArray(req.body.subSubCategoryId)) {
      const subSubCategories = await Model.SubSubCategory.find({
        _id: { $in: req.body.subSubCategoryId },
        isDeleted: false
      });

      if (subSubCategories.length !== req.body.subSubCategoryId.length) {
        throw new Error("One or more sub-subcategories not found");
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

    // Handle files from upload.any() - separate images, videos, and metal_images
    const regularImages = [];
    const regularVideos = [];
    const metalImagesFiles = {};

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.fieldname === 'images') {
          regularImages.push(file);
        } else if (file.fieldname === 'videos') {
          regularVideos.push(file);
        } else if (file.fieldname && file.fieldname.startsWith('metal_images_')) {
          // Parse field name: metal_images_${metalType}_${viewAngle}
          const parts = file.fieldname.replace('metal_images_', '').split('_');
          // Reconstruct metalType and viewAngle (they may contain underscores)
          // Format: metalType is everything except last part, viewAngle is last part
          // But we need to handle spaces that were replaced with underscores
          // Let's use a different approach: store by fieldname and parse later
          if (!metalImagesFiles[file.fieldname]) {
            metalImagesFiles[file.fieldname] = [];
          }
          metalImagesFiles[file.fieldname].push(file);
        }
      });
    }

    // Handle regular images (optional now, as we use metal_images)
    if (regularImages.length > 0) {
      req.body.images = regularImages.map(file => "/uploads/" + file.filename);
    } else if (req.body.images) {
      // If images are provided in body
      if (typeof req.body.images === 'string') {
        req.body.images = [req.body.images];
      } else if (!Array.isArray(req.body.images)) {
        req.body.images = [];
      }
    } else {
      req.body.images = [];
    }

    // Handle regular videos
    if (regularVideos.length > 0) {
      req.body.videos = regularVideos.map(file => "/uploads/" + file.filename);
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

    // Process metal_images files (single image per view angle)
    req.body.metal_images = [];

    // All possible view angles: required (Angled view, Top view, Side view) and optional (Image 1, Image 2, Image 3)
    const viewAngles = ['Angled_view', 'Top_view', 'Side_view', 'Image_1', 'Image_2', 'Image_3'];

    for (const fieldname of Object.keys(metalImagesFiles)) {
      const withoutPrefix = fieldname.replace('metal_images_', '');
      let metalType = '';
      let shape = '';
      let viewAngle = '';

      // Try to match any view angle (longest match first for accuracy)
      const sortedViewAngles = viewAngles.sort((a, b) => b.length - a.length);
      
      for (const va of sortedViewAngles) {
        if (withoutPrefix.endsWith('_' + va)) {
          viewAngle = va.replace(/_/g, ' ');
          const remaining = withoutPrefix.slice(0, -(va.length + 1));
          
          // Now parse metalType and shape from remaining part
          // Format: metalType_shape (e.g., "14K_Rose_Gold_Oval")
          // We need to find where shape starts - shapes are: Oval, Circle, Round, Heart
          const shapes = ['Oval', 'Circle', 'Round', 'Heart'];
          let foundShape = '';
          let shapeIndex = -1;
          
          for (const s of shapes) {
            const shapeUnderscore = s.replace(/\s+/g, '_');
            const index = remaining.lastIndexOf('_' + shapeUnderscore);
            if (index !== -1 && index > shapeIndex) {
              shapeIndex = index;
              foundShape = s;
            }
          }
          
          if (foundShape && shapeIndex !== -1) {
            shape = foundShape;
            metalType = remaining.slice(0, shapeIndex).replace(/_/g, ' ');
          } else {
            // Fallback: if shape not found, treat entire remaining as metalType
            metalType = remaining.replace(/_/g, ' ');
          }
          break;
        }
      }

      if (metalType && shape && viewAngle && metalImagesFiles[fieldname].length > 0) {
        const imageFile = metalImagesFiles[fieldname][0];
        const filePath = "uploads/" + imageFile.filename;

        const fileFullPath = imageFile.path;
        const bucketName = "merefunds";

        // Upload to S3
        const fileUrl = await uploadFileToS3(
          fileFullPath,
          bucketName,
          filePath
        );

        // Delete local file
        fs.unlinkSync(fileFullPath);

        req.body.metal_images.push({
          metal_type: metalType,
          shape: shape,
          view_angle: viewAngle,
          image: '/' + filePath, // better to save S3 URL
        });
      }
    }


    // Object.keys(metalImagesFiles).forEach(async (fieldname) => {
    //   // Parse fieldname: metal_images_${metalType}_${viewAngle}
    //   // View angles are: "Angled_view", "Top_view", "Side_view"
    //   const withoutPrefix = fieldname.replace('metal_images_', '');
    //   const viewAngles = ['Angled_view', 'Top_view', 'Side_view'];
    //   let metalType = '';
    //   let viewAngle = '';

    //   // Find which view angle this fieldname ends with
    //   for (const va of viewAngles) {
    //     if (withoutPrefix.endsWith('_' + va)) {
    //       viewAngle = va.replace(/_/g, ' ');
    //       const metalTypePart = withoutPrefix.slice(0, -(va.length + 1));
    //       metalType = metalTypePart.replace(/_/g, ' ');
    //       break;
    //     }
    //   }

    //   if (metalType && viewAngle && metalImagesFiles[fieldname].length > 0) {
    //     // Single image per view angle
    //     const imageFile = metalImagesFiles[fieldname][0];
    //     const filePath = "uploads/" + imageFile.filename;


    //     const fileFullPath = imageFile.path;
    //     const bucketName = "merefunds";
    //     const fileUrl = await uploadFileToS3(
    //       fileFullPath,
    //       bucketName,
    //       filePath
    //     );
    //     fs.unlinkSync(fileFullPath);
        
    //     req.body.metal_images.push({
    //       metal_type: metalType,
    //       view_angle: viewAngle,
    //       image: '/' + filePath,
    //     });
    //   }
    // });

    // Ensure metal_images is an array
    if (!req.body.metal_images || !Array.isArray(req.body.metal_images)) {
      req.body.metal_images = [];
    }

    // Validate that either regular images or metal_images are provided (after processing metal_images)
    if (req.body.images.length === 0 && req.body.metal_images.length === 0) {
      throw new Error("At least one image is required (either general images or metal-specific images)");
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

    // Convert engraving_allowed string to boolean (FormData sends strings)
    if (req.body.engraving_allowed !== undefined) {
      req.body.engraving_allowed = req.body.engraving_allowed === 'true' || req.body.engraving_allowed === true;
    }

    // Convert gift string to boolean (FormData sends strings)
    if (req.body.gift !== undefined) {
      req.body.gift = req.body.gift === 'true' || req.body.gift === true;
    }

    let product = await Model.Product.create(req.body);
    await product.populate([
      'categoryId',
      'subCategoryId',
      'subSubCategoryId',
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
      'ornamentDetails'
    ]);

    return res.success(constants.MESSAGES.DATA_UPLOADED, product);
  } catch (error) {
    next(error);
  }
}

// Create Bracelet Product
module.exports.createBraceletProduct = async (req, res, next) => {
  // Parse variants from JSON string (multipart/form-data case)
  if (req.body.variants) {
    if (typeof req.body.variants === 'string') {
      try {
        req.body.variants = JSON.parse(req.body.variants);
      } catch (e) {
        return next(new Error('Invalid variants JSON'));
      }
    }
  }


  // Parse productDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.productDetailsConfiguration) {
    if (typeof req.body.productDetailsConfiguration === 'string') {
      try {
        req.body.productDetailsConfiguration = JSON.parse(req.body.productDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid productDetailsConfiguration JSON'));
      }
    }
  }

  // Parse centerStoneDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.centerStoneDetailsConfiguration) {
    if (typeof req.body.centerStoneDetailsConfiguration === 'string') {
      try {
        req.body.centerStoneDetailsConfiguration = JSON.parse(req.body.centerStoneDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid centerStoneDetailsConfiguration JSON'));
      }
    }
  }

  // Parse sideStoneDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.sideStoneDetailsConfiguration) {
    if (typeof req.body.sideStoneDetailsConfiguration === 'string') {
      try {
        req.body.sideStoneDetailsConfiguration = JSON.parse(req.body.sideStoneDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid sideStoneDetailsConfiguration JSON'));
      }
    }
  }

  // Parse stoneDetailsFormConfiguration from JSON string (multipart/form-data case)
  if (req.body.stoneDetailsFormConfiguration) {
    if (typeof req.body.stoneDetailsFormConfiguration === 'string') {
      try {
        req.body.stoneDetailsFormConfiguration = JSON.parse(req.body.stoneDetailsFormConfiguration);
      } catch (e) {
        return next(new Error('Invalid stoneDetailsFormConfiguration JSON'));
      }
    }
  }

  // Parse carat_min_weights from JSON string (multipart/form-data case)
  if (req.body.carat_min_weights) {
    if (typeof req.body.carat_min_weights === 'string') {
      try {
        req.body.carat_min_weights = JSON.parse(req.body.carat_min_weights);
      } catch (e) {
        return next(new Error('Invalid carat_min_weights JSON'));
      }
    }
  }

  try {
    // Completely remove shankTreatments for bracelets (not needed)
    delete req.body.shankTreatments;
    
    // Convert codes to ObjectIds BEFORE validation (for bracelet-specific fields)
    // For bracelets: settingConfigurations is used for FlexibilityType (can be code or ObjectId)
    if (req.body.settingConfigurations) {
      req.body.flexibilityType = req.body.settingConfigurations;
      delete req.body.settingConfigurations;
    }

    // For bracelets: shankConfigurations is used for ChainLinkType (can be code or ObjectId)
    if (req.body.shankConfigurations) {
      req.body.chainLinkypes = req.body.shankConfigurations;
      delete req.body.shankConfigurations;
    }

    // For bracelets: bandProfileShapes is used for ClosureType (Lock) (can be code or ObjectId)
    if (req.body.bandProfileShapes) {
      req.body.closureTypes = req.body.bandProfileShapes;
    }

    // For bracelets: bandFits is used for StoneSetting (can be codes or ObjectIds)
    if (req.body.bandFits && Array.isArray(req.body.bandFits) && req.body.bandFits.length > 0) {
      req.body.stoneSettings = req.body.bandFits;
      delete req.body.bandFits;
    } 
    

    // For bracelets: ornamentDetails is used for PlacementFit (can be codes or ObjectIds)
    if (req.body.ornamentDetails && Array.isArray(req.body.ornamentDetails) && req.body.ornamentDetails.length > 0) {
      // Check if values are codes or ObjectIds
      req.body.placementFits = req.body.ornamentDetails;
      delete req.body.ornamentDetails;
    }
    

    const bodyToValidate = { ...req.body };
    
    // Completely remove shankTreatments from req.body for bracelets (not needed)
    delete req.body.shankTreatments;
    delete bodyToValidate.shankTreatments;
    
    // Remove dynamic fields that start with ss_ (side stone) and sd_ (stone details) from validation
    // These are processed separately to build configuration objects
    Object.keys(bodyToValidate).forEach(key => {
      if (key.startsWith('ss_') || key.startsWith('sd_')) {
        delete bodyToValidate[key];
      }
    });
    
    // Remove optional fields from validation if not provided
    const optionalFields = ['bandWidthCategories', 'settingConfigurations', 'shankConfigurations', 'ornamentDetails', 'bandFits'];
    optionalFields.forEach(field => {
      if (!bodyToValidate[field] || bodyToValidate[field] === '' || 
          (Array.isArray(bodyToValidate[field]) && bodyToValidate[field].length === 0)) {
        delete bodyToValidate[field];
      }
    });
    
    // Create a modified validation schema with optional fields for bracelets
    // For bandFits, also change it to accept array (since it's multi-select for bracelets)
    const baseValidation = Validation.Product.createProduct.fork(
      ['bandWidthCategories', 'settingConfigurations', 'shankConfigurations', 'ornamentDetails', 'bandFits', 'shankTreatments'], 
      (schema) => schema.optional()
    );
    
    // Override bandFits to accept array or string (ObjectId)
    const braceletValidation = baseValidation.fork(['bandFits'], (schema) => 
      Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.objectId(),
        Joi.string().allow('')
      ).optional()
    );
    
    // Override ring_size to allow higher values for bracelets (bracelet sizes can be 8, 12, 14, 16, 18, 20, 22, 24, 28)
    const braceletValidationWithRingSize = braceletValidation.fork(['ring_size'], (schema) => 
      Joi.alternatives().try(
        Joi.array().items(Joi.number().min(3).max(30)), // Allow up to 30 for bracelet sizes
        Joi.number().min(3).max(30)
      ).optional()
    );
    
    // Allow unknown fields (for dynamic fields like ss_*, sd_*, etc. that are processed separately)
    const finalValidation = braceletValidationWithRingSize.unknown(true);
    
    await finalValidation.validateAsync(bodyToValidate); 
    
    if (Array.isArray(req.body.variants)) {
      req.body.variants = req.body.variants.map(v => ({
        diamond_type: v.diamond_type,
        carat_weight: v.carat_weight,
        metal_type: v.metal_type,
        diamond_quality: v.diamond_quality || '',
        shape: v.shape || '',
        price: Number(v.price),
        discounted_price: Number(v.discounted_price),
      }));
    } else {
      req.body.variants = [];
    }
    
    if (!req.body.product_id || req.body.product_id.trim() === '') {
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

    // Normalize status
    if (req.body.status) {
      const statusLower = req.body.status.toLowerCase();
      if (statusLower === 'active') {
        req.body.status = 'Active';
      } else if (statusLower === 'inactive') {
        req.body.status = 'Inactive';
      } else if (statusLower === 'draft') {
        req.body.status = 'Draft';
      } else {
        req.body.status = 'Active';
      }
    } else {
      req.body.status = 'Active';
    }

    // Normalize diamond origin values
    if (req.body.diamond_origin) {
      const normalizeDiamondOrigin = (value) => {
        const lower = value.toLowerCase();
        if (lower === 'natural') return 'Natural';
        if (lower === 'lab grown' || lower === 'lab-grown') return 'Lab Grown';
        return value;
      };

      if (Array.isArray(req.body.diamond_origin)) {
        req.body.diamond_origin = req.body.diamond_origin.map(normalizeDiamondOrigin);
      } else {
        req.body.diamond_origin = [normalizeDiamondOrigin(req.body.diamond_origin)];
      }
    }

    // Normalize metal type values
    if (req.body.metal_type) {
      const normalizeMetalType = (value) => {
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

    // Normalize diamond quality values
    if (req.body.diamond_quality) {
      const normalizeDiamondQuality = (value) => {
        const lower = value.toLowerCase();
        if (lower.includes('excellent') || lower.includes('best')) return 'Best - D, VVS';
        if (lower.includes('very good') || lower.includes('better')) return 'Better - E, VS1';
        if (lower.includes('good')) return 'Good - F, VS2';
        return value;
      };

      if (Array.isArray(req.body.diamond_quality)) {
        req.body.diamond_quality = req.body.diamond_quality.map(normalizeDiamondQuality);
      } else {
        req.body.diamond_quality = [normalizeDiamondQuality(req.body.diamond_quality)];
      }
    }

    // Normalize arrays
    const normalizeArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };
    const normalizeArraySubCategory = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };
    
    if (req.body.categoryId) {
      req.body.categoryId = normalizeArray(req.body.categoryId);
      if (req.body.categoryId.length > 1) {
        throw new Error("Only one category is allowed per product");
      }
    }
    if (req.body.subCategoryId) {
      req.body.subCategoryId = normalizeArraySubCategory(req.body.subCategoryId);
    }
    if (req.body.subSubCategoryId) {
      req.body.subSubCategoryId = normalizeArraySubCategory(req.body.subSubCategoryId);
    }
    if (req.body.metal_type && !Array.isArray(req.body.metal_type)) {
      req.body.metal_type = [req.body.metal_type];
    }
    if (req.body.diamond_origin && !Array.isArray(req.body.diamond_origin)) {
      req.body.diamond_origin = [req.body.diamond_origin];
    }
    if (req.body.carat_weight) {
      req.body.carat_weight = normalizeArray(req.body.carat_weight);
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
      req.body.ring_size = req.body.ring_size.map(s => {
        const num = typeof s === 'string' ? parseInt(s) : s;
        return isNaN(num) ? s : num;
      });
    }
    if (req.body.necklace_size) {
      req.body.necklace_size = normalizeArray(req.body.necklace_size);
    }
    if (req.body.stone) {
      req.body.stone = normalizeArray(req.body.stone);
    }
    if (req.body.design_styles) {
      req.body.design_styles = normalizeArray(req.body.design_styles);
    }

    // Validate categories
    if (req.body.categoryId && Array.isArray(req.body.categoryId)) {
      const categories = await Model.Category.find({
        _id: { $in: req.body.categoryId },
        isDeleted: false
      });

      if (categories.length !== req.body.categoryId.length) {
        throw new Error("One or more categories not found");
      }
    }

    // Validate subcategories
    if (req.body.subCategoryId && Array.isArray(req.body.subCategoryId)) {
      const subCategories = await Model.SubCategory.find({
        _id: { $in: req.body.subCategoryId },
        isDeleted: false
      });

      if (subCategories.length !== req.body.subCategoryId.length) {
        throw new Error("One or more subcategories not found");
      }
    }

    // Validate subSubCategories
    if (req.body.subSubCategoryId && Array.isArray(req.body.subSubCategoryId)) {
      const subSubCategories = await Model.SubSubCategory.find({
        _id: { $in: req.body.subSubCategoryId },
        isDeleted: false
      });

      if (subSubCategories.length !== req.body.subSubCategoryId.length) {
        throw new Error("One or more sub-subcategories not found");
      }
    }

    // Validate radio button fields (single ObjectId) - codes already converted above
    // These fields are optional for bracelets, so only validate if provided
    // For bracelets: flexibilityType is used instead of settingConfigurations
    if (req.body.flexibilityType) {
      const flexibilityType = await Model.FlexibilityType.findOne({
        _id: req.body.flexibilityType,
        isDeleted: false
      });
      if (!flexibilityType) {
        throw new Error("Flexibility Type not found");
      }
    }
    
    // Also check settingConfigurations (for rings, not bracelets)
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
        // Try ChainLinkType (for bracelets)
        const chainLinkType = await Model.ChainLinkType.findOne({
          _id: req.body.shankConfigurations,
          isDeleted: false
        });
        if (!chainLinkType) {
          throw new Error("Shank configuration (Chain Link Type) not found");
        }
      }
    }

    if (req.body.holdingMethods) {
      const holdingMethod = await Model.HoldingMethods.findOne({
        _id: req.body.holdingMethods,
        isDeleted: false
      });
      if (!holdingMethod) {
        throw new Error("Holding method (Setting Type) not found");
      }
    }

    if (req.body.bandProfileShapes) {
      const bandProfileShape = await Model.BandProfileShapes.findOne({
        _id: req.body.bandProfileShapes,
        isDeleted: false
      });
      if (!bandProfileShape) {
        // Try ClosureType (for bracelets)
        const closureType = await Model.ClosureType.findOne({
          _id: req.body.bandProfileShapes,
          isDeleted: false
        });
        if (!closureType) {
          throw new Error("Band profile shape (Lock/Closure Type) not found");
        }
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

    // Validate bandFits (codes already converted above) - optional for bracelets
    if (req.body.bandFits && Array.isArray(req.body.bandFits) && req.body.bandFits.length > 0) {
      // Check if it's ObjectIds (should be after conversion)
      const isObjectId = /^[0-9a-f]{24}$/i.test(req.body.bandFits[0]);
      if (isObjectId) {
        // Validate as ObjectIds - could be BandFits or StoneSettings
        const bandFits = await Model.BandFits.find({
          _id: { $in: req.body.bandFits },
          isDeleted: false
        });
        const stoneSettings = await Model.StoneSetting.find({
          _id: { $in: req.body.bandFits },
          isDeleted: false
        });
        if (bandFits.length === 0 && stoneSettings.length !== req.body.bandFits.length) {
          throw new Error("One or more band fits (Stone Setting) not found");
        }
      }
    }

    // Normalize and validate multi-select dropdown fields (array of ObjectIds)
    const normalizeObjectIdArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };

    // shankTreatments is completely removed for bracelets - no validation needed

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

    // Validate ornamentDetails (codes already converted above) - optional for bracelets
    if (req.body.ornamentDetails && Array.isArray(req.body.ornamentDetails) && req.body.ornamentDetails.length > 0) {
      req.body.ornamentDetails = normalizeObjectIdArray(req.body.ornamentDetails);
      
      // Check if values are ObjectIds (should be after conversion)
      const isObjectId = req.body.ornamentDetails.length > 0 && /^[0-9a-f]{24}$/i.test(req.body.ornamentDetails[0]);
      
      if (isObjectId) {
        // Validate as ObjectIds - could be OrnamentDetails or PlacementFits
        const ornamentDetails = await Model.OrnamentDetails.find({
          _id: { $in: req.body.ornamentDetails },
          isDeleted: false
        });
        const placementFits = await Model.PlacementFit.find({
          _id: { $in: req.body.ornamentDetails },
          isDeleted: false
        });
        if (ornamentDetails.length === 0 && placementFits.length !== req.body.ornamentDetails.length) {
          throw new Error("One or more ornament details (Placement Fit) not found");
        }
      }
    }

    // Handle files from upload.any() - separate images, videos, and metal_images
    const regularImages = [];
    const regularVideos = [];
    const metalImagesFiles = {};

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.fieldname === 'images') {
          regularImages.push(file);
        } else if (file.fieldname === 'videos') {
          regularVideos.push(file);
        } else if (file.fieldname && file.fieldname.startsWith('metal_images_')) {
          if (!metalImagesFiles[file.fieldname]) {
            metalImagesFiles[file.fieldname] = [];
          }
          metalImagesFiles[file.fieldname].push(file);
        }
      });
    }

    // Handle regular images
    if (regularImages.length > 0) {
      req.body.images = regularImages.map(file => "/uploads/" + file.filename);
    } else if (req.body.images) {
      if (typeof req.body.images === 'string') {
        req.body.images = [req.body.images];
      } else if (!Array.isArray(req.body.images)) {
        req.body.images = [];
      }
    } else {
      req.body.images = [];
    }

    // Handle regular videos
    if (regularVideos.length > 0) {
      req.body.videos = regularVideos.map(file => "/uploads/" + file.filename);
    } else if (req.body.videos) {
      if (typeof req.body.videos === 'string') {
        req.body.videos = [req.body.videos];
      } else if (!Array.isArray(req.body.videos)) {
        req.body.videos = [];
      }
    } else {
      req.body.videos = [];
    }

    // Process metal_images files (single image per view angle)
    req.body.metal_images = [];

    const viewAngles = ['Angled_view', 'Top_view', 'Side_view', 'Image_1', 'Image_2', 'Image_3'];

    for (const fieldname of Object.keys(metalImagesFiles)) {
      const withoutPrefix = fieldname.replace('metal_images_', '');
      let metalType = '';
      let shape = '';
      let viewAngle = '';

      const sortedViewAngles = viewAngles.sort((a, b) => b.length - a.length);
      
      for (const va of sortedViewAngles) {
        if (withoutPrefix.endsWith('_' + va)) {
          viewAngle = va.replace(/_/g, ' ');
          const remaining = withoutPrefix.slice(0, -(va.length + 1));
          
          // Parse metalType and shape from remaining part
          const shapes = ['Oval', 'Circle', 'Round', 'Heart'];
          let foundShape = '';
          let shapeIndex = -1;
          
          for (const s of shapes) {
            const shapeUnderscore = s.replace(/\s+/g, '_');
            const index = remaining.lastIndexOf('_' + shapeUnderscore);
            if (index !== -1 && index > shapeIndex) {
              shapeIndex = index;
              foundShape = s;
            }
          }
          
          if (foundShape && shapeIndex !== -1) {
            shape = foundShape;
            metalType = remaining.slice(0, shapeIndex).replace(/_/g, ' ');
          } else {
            metalType = remaining.replace(/_/g, ' ');
          }
          break;
        }
      }

      if (metalType && shape && viewAngle && metalImagesFiles[fieldname].length > 0) {
        const imageFile = metalImagesFiles[fieldname][0];
        const filePath = "uploads/" + imageFile.filename;

        const fileFullPath = imageFile.path;
        const bucketName = "merefunds";

        const fileUrl = await uploadFileToS3(
          fileFullPath,
          bucketName,
          filePath
        );

        fs.unlinkSync(fileFullPath);

        req.body.metal_images.push({
          metal_type: metalType,
          shape: shape,
          view_angle: viewAngle,
          image: '/' + filePath,
        });
      }
    }

    if (!req.body.metal_images || !Array.isArray(req.body.metal_images)) {
      req.body.metal_images = [];
    }

    // Validate that either regular images or metal_images are provided
    if (req.body.images.length === 0 && req.body.metal_images.length === 0) {
      throw new Error("At least one image is required (either general images or metal-specific images)");
    }

    // Convert tags string to array if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    // Convert empty strings to null for enum fields
    if (req.body.back_type === '' || req.body.back_type === undefined) {
      req.body.back_type = null;
    }
    if (req.body.product_type === '' || req.body.product_type === undefined) {
      req.body.product_type = null;
    }
    if (req.body.viewAngle === '' || req.body.viewAngle === undefined) {
      req.body.viewAngle = null;
    }

    // Convert engraving_allowed string to boolean
    if (req.body.engraving_allowed !== undefined) {
      req.body.engraving_allowed = req.body.engraving_allowed === 'true' || req.body.engraving_allowed === true;
    }

    // Convert gift string to boolean
    if (req.body.gift !== undefined) {
      req.body.gift = req.body.gift === 'true' || req.body.gift === true;
    }

    // Build productDetailsConfiguration from individual fields
    if (!req.body.productDetailsConfiguration) {
      req.body.productDetailsConfiguration = {
        product_details: req.body.product_details || '',
        average_width: req.body.average_width || '',
        rhodium_plate: req.body.rhodium_plate || 'Yes',
        center_stone_details: req.body.center_stone_details || '',
        side_stone_details: req.body.side_stone_details || '',
        stone_details: req.body.stone_details || ''
      };
    }

    // Build centerStoneDetailsConfiguration from individual fields
    if (!req.body.centerStoneDetailsConfiguration && req.body.stone && Array.isArray(req.body.stone)) {
      req.body.centerStoneDetailsConfiguration = [];
      
      // Get center stone fields
      const centerStoneCertified = req.body.center_stone_certified || 'No';
      const centerStoneShape = req.body.center_stone_shape || '';
      const centerStoneMinWeight = req.body.center_stone_min_weight || '';
      const centerStoneColor = req.body.center_stone_color || '';
      const centerStoneColorQuality = req.body.center_stone_color_quality || '';
      const centerStoneClarity = req.body.center_stone_clarity || '';
      const centerStoneDiamondQuality = req.body.center_stone_diamond_quality || '';
      const centerStoneQualityType = req.body.center_stone_quality_type || '';

      // Build configuration for each stone type selected
      req.body.stone.forEach(stone => {
        if (stone !== 'None') {
          const config = {
            stone: stone,
            certified: centerStoneCertified,
            color: centerStoneColor,
            diamond_origin: req.body.diamond_origin && Array.isArray(req.body.diamond_origin) ? req.body.diamond_origin[0] : (req.body.diamond_origin || ''),
            diamond_shapes: centerStoneShape ? [centerStoneShape] : [],
            min_diamond_weight: centerStoneMinWeight,
            quantity: '',
            average_color: centerStoneColorQuality,
            average_clarity: centerStoneClarity,
            dimensions: '',
            gemstone_type: ''
          };
          req.body.centerStoneDetailsConfiguration.push(config);
        }
      });
    }

    // Build sideStoneDetailsConfiguration from individual fields
    if (!req.body.sideStoneDetailsConfiguration) {
      req.body.sideStoneDetailsConfiguration = [];
      
      // Collect all side stone data from fields like ss_${stoneKey}_origin, ss_${stoneKey}_quantity, etc.
      const sideStoneKeys = new Set();
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('ss_') && key.includes('_origin')) {
          const stoneKey = key.replace('ss_', '').replace('_origin', '').replace(/_/g, ' ');
          sideStoneKeys.add(stoneKey);
        }
      });

      sideStoneKeys.forEach(stoneKey => {
        const stoneKeyUnderscore = stoneKey.replace(/\s+/g, '_');
        const origins = [];
        const shapes = [];
        
        // Collect all origins and shapes (they can be multiple)
        Object.keys(req.body).forEach(key => {
          if (key === `ss_${stoneKeyUnderscore}_origin`) {
            if (Array.isArray(req.body[key])) {
              origins.push(...req.body[key]);
            } else {
              origins.push(req.body[key]);
            }
          } else if (key === `ss_${stoneKeyUnderscore}_shape`) {
            if (Array.isArray(req.body[key])) {
              shapes.push(...req.body[key]);
            } else {
              shapes.push(req.body[key]);
            }
          }
        });

        const config = {
          stone: stoneKey,
          diamond_origin: origins.length > 0 ? origins.join(', ') : '',
          diamond_shapes: shapes,
          min_diamond_weight: req.body[`ss_${stoneKeyUnderscore}_min_diamond_weight`] || '',
          quantity: req.body[`ss_${stoneKeyUnderscore}_quantity`] || '',
          average_color: req.body[`ss_${stoneKeyUnderscore}_avg_color`] || '',
          average_clarity: req.body[`ss_${stoneKeyUnderscore}_avg_clarity`] || '',
          dimensions: req.body[`ss_${stoneKeyUnderscore}_dimensions`] || '',
          gemstone_type: req.body[`ss_${stoneKeyUnderscore}_gemstone_type`] || ''
        };
        req.body.sideStoneDetailsConfiguration.push(config);
      });
    }

    // Build stoneDetailsFormConfiguration from individual fields
    if (!req.body.stoneDetailsFormConfiguration) {
      req.body.stoneDetailsFormConfiguration = [];
      
      const stoneDetailsCertified = req.body.stone_details_certified || 'No';
      const stoneDetailsColor = req.body.stone_details_color || '';
      
      // Get stone_details_stone (can be array or single value)
      let stoneDetailsStones = [];
      if (req.body.stone_details_stone) {
        if (Array.isArray(req.body.stone_details_stone)) {
          stoneDetailsStones = req.body.stone_details_stone;
        } else {
          stoneDetailsStones = [req.body.stone_details_stone];
        }
      } else if (req.body.stone && Array.isArray(req.body.stone)) {
        // Fallback to main stone selection
        stoneDetailsStones = req.body.stone.filter(s => s !== 'None');
      }

      // Collect all stone detail data from fields like sd_${stoneKey}_origin, sd_${stoneKey}_quantity, etc.
      const stoneDetailKeys = new Set();
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('sd_') && key.includes('_origin')) {
          const stoneKey = key.replace('sd_', '').replace('_origin', '').replace(/_/g, ' ');
          stoneDetailKeys.add(stoneKey);
        }
      });

      // If we have stone_details_stone but no sd_ fields, use the stones from stone_details_stone
      if (stoneDetailKeys.size === 0 && stoneDetailsStones.length > 0) {
        stoneDetailsStones.forEach(stone => {
          stoneDetailKeys.add(stone);
        });
      }

      stoneDetailKeys.forEach(stoneKey => {
        const stoneKeyUnderscore = stoneKey.replace(/\s+/g, '_');
        const origins = [];
        const shapes = [];
        
        // Collect all origins and shapes (they can be multiple)
        Object.keys(req.body).forEach(key => {
          if (key === `sd_${stoneKeyUnderscore}_origin`) {
            if (Array.isArray(req.body[key])) {
              origins.push(...req.body[key]);
            } else {
              origins.push(req.body[key]);
            }
          } else if (key === `sd_${stoneKeyUnderscore}_shape`) {
            if (Array.isArray(req.body[key])) {
              shapes.push(...req.body[key]);
            } else {
              shapes.push(req.body[key]);
            }
          }
        });

        const config = {
          stone: stoneKey,
          certified: stoneDetailsCertified,
          color: stoneDetailsColor,
          diamond_origin: origins.length > 0 ? origins.join(', ') : '',
          diamond_shapes: shapes,
          min_diamond_weight: req.body[`sd_${stoneKeyUnderscore}_min_diamond_weight`] || '',
          quantity: req.body[`sd_${stoneKeyUnderscore}_quantity`] || '',
          average_color: req.body[`sd_${stoneKeyUnderscore}_avg_color`] || '',
          average_clarity: req.body[`sd_${stoneKeyUnderscore}_avg_clarity`] || '',
          dimensions: req.body[`sd_${stoneKeyUnderscore}_dimensions`] || '',
          gemstone_type: req.body[`sd_${stoneKeyUnderscore}_gemstone_type`] || ''
        };
        req.body.stoneDetailsFormConfiguration.push(config);
      });
    }

    let product = await Model.Product.create(req.body);
    await product.populate([
      'categoryId',
      'subCategoryId',
      'subSubCategoryId',
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
      'ornamentDetails'
    ]);

    return res.success(constants.MESSAGES.DATA_UPLOADED, product);
  } catch (error) {
    next(error);
  }
}

// Create Necklace Product
module.exports.createNecklaceProduct = async (req, res, next) => {
  // Parse variants from JSON string (multipart/form-data case)
  if (req.body.variants) {
    if (typeof req.body.variants === 'string') {
      try {
        req.body.variants = JSON.parse(req.body.variants);
      } catch (e) {
        return next(new Error('Invalid variants JSON'));
      }
    }
  }
console.log("req.body for necklace", req.body); 

  // Parse productDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.productDetailsConfiguration) {
    if (typeof req.body.productDetailsConfiguration === 'string') {
      try {
        req.body.productDetailsConfiguration = JSON.parse(req.body.productDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid productDetailsConfiguration JSON'));
      }
    }
  }

  // Parse centerStoneDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.centerStoneDetailsConfiguration) {
    if (typeof req.body.centerStoneDetailsConfiguration === 'string') {
      try {
        req.body.centerStoneDetailsConfiguration = JSON.parse(req.body.centerStoneDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid centerStoneDetailsConfiguration JSON'));
      }
    }
  }

  // Parse sideStoneDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.sideStoneDetailsConfiguration) {
    if (typeof req.body.sideStoneDetailsConfiguration === 'string') {
      try {
        req.body.sideStoneDetailsConfiguration = JSON.parse(req.body.sideStoneDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid sideStoneDetailsConfiguration JSON'));
      }
    }
  }

  // Parse stoneDetailsFormConfiguration from JSON string (multipart/form-data case)
  if (req.body.stoneDetailsFormConfiguration) {
    if (typeof req.body.stoneDetailsFormConfiguration === 'string') {
      try {
        req.body.stoneDetailsFormConfiguration = JSON.parse(req.body.stoneDetailsFormConfiguration);
      } catch (e) {
        return next(new Error('Invalid stoneDetailsFormConfiguration JSON'));
      }
    }
  }

  // Parse carat_min_weights from JSON string (multipart/form-data case)
  if (req.body.carat_min_weights) {
    if (typeof req.body.carat_min_weights === 'string') {
      try {
        req.body.carat_min_weights = JSON.parse(req.body.carat_min_weights);
      } catch (e) {
        return next(new Error('Invalid carat_min_weights JSON'));
      }
    }
  }

  try {
    // Convert codes to ObjectIds BEFORE validation (for necklace-specific fields)
    // For necklaces: settingConfigurations is used for AssemblyType (can be code or ObjectId)
    if (req.body.settingConfigurations) {
      req.body.assemblyTypes = req.body.settingConfigurations;
      delete req.body.settingConfigurations;
    }

    // For necklaces: shankConfigurations is used for ChainType (can be code or ObjectId)
    if (req.body.shankConfigurations) {
      req.body.chainTypes = req.body.shankConfigurations;
      delete req.body.shankConfigurations;
    }

    // For necklaces: bandProfileShapes is used for ClosureType (Lock) (can be code or ObjectId)
    if (req.body.bandProfileShapes) {
      req.body.closureTypes = req.body.bandProfileShapes;
      delete req.body.bandProfileShapes;
    }

    // For necklaces: bandFits is used for StoneSetting (can be codes or ObjectIds)
    if (req.body.bandFits && Array.isArray(req.body.bandFits) && req.body.bandFits.length > 0) {
      req.body.stoneSettings = req.body.bandFits;
      delete req.body.bandFits;
    } 

    // For necklaces: shankTreatments is used for FinishDetails (can be codes or ObjectIds)
    if (req.body.shankTreatments) {
      req.body.finishDetails = req.body.shankTreatments;
      delete req.body.shankTreatments;
    }

    // Remove placementFits (ornamentDetails) for necklaces - not needed
    delete req.body.placementFits;
    if (req.body.ornamentDetails) {
      delete req.body.ornamentDetails;
    }

    const bodyToValidate = { ...req.body };
    
    // Remove dynamic fields that start with ss_ (side stone) and sd_ (stone details) from validation
    // These are processed separately to build configuration objects
    Object.keys(bodyToValidate).forEach(key => {
      if (key.startsWith('ss_') || key.startsWith('sd_')) {
        delete bodyToValidate[key];
      }
    });
    
    // Remove optional fields from validation if not provided
    const optionalFields = ['bandWidthCategories', 'bandProfileShapes', 'settingConfigurations', 'shankConfigurations', 'ornamentDetails', 'bandFits', 'shankTreatments', 'placementFits'];
    optionalFields.forEach(field => {
      if (!bodyToValidate[field] || bodyToValidate[field] === '' || 
          (Array.isArray(bodyToValidate[field]) && bodyToValidate[field].length === 0)) {
        delete bodyToValidate[field];
      }
    });
    
    // For necklaces, remove ring_size if it's empty or not a valid array/number
    // Necklaces use necklace_size instead
    if (bodyToValidate.ring_size !== undefined) {
      if (!bodyToValidate.ring_size || bodyToValidate.ring_size === '' || 
          (Array.isArray(bodyToValidate.ring_size) && bodyToValidate.ring_size.length === 0)) {
        delete bodyToValidate.ring_size;
        delete req.body.ring_size; // Also remove from req.body
      }
    }
    
    // Create a modified validation schema with optional fields for necklaces
    const baseValidation = Validation.Product.createProduct.fork(
      ['bandWidthCategories', 'bandProfileShapes', 'settingConfigurations', 'shankConfigurations', 'ornamentDetails', 'bandFits', 'shankTreatments', 'placementFits'], 
      (schema) => schema.optional()
    );
    
    // Override bandFits to accept array or string (ObjectId)
    const necklaceValidation = baseValidation.fork(['bandFits'], (schema) => 
      Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.objectId(),
        Joi.string().allow('')
      ).optional()
    );
    
    // Override ring_size to allow higher values for necklaces (necklace sizes can be 16", 18", 20", 22", 24")
    const necklaceValidationWithRingSize = necklaceValidation.fork(['ring_size'], (schema) => 
      Joi.alternatives().try(
        Joi.array().items(Joi.number().min(3).max(30)), // Allow up to 30 for necklace sizes
        Joi.number().min(3).max(30)
      ).optional()
    );
    
    // Allow unknown fields (for dynamic fields like ss_*, sd_*, etc. that are processed separately)
    const finalValidation = necklaceValidationWithRingSize.unknown(true);
    
    await finalValidation.validateAsync(bodyToValidate); 
    
    if (Array.isArray(req.body.variants)) {
      req.body.variants = req.body.variants.map(v => ({
        diamond_type: v.diamond_type,
        carat_weight: v.carat_weight,
        metal_type: v.metal_type,
        diamond_quality: v.diamond_quality || '',
        shape: v.shape || '',
        price: Number(v.price),
        discounted_price: Number(v.discounted_price),
      }));
    } else {
      req.body.variants = [];
    }
    
    if (!req.body.product_id || req.body.product_id.trim() === '') {
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

    // Normalize status
    if (req.body.status) {
      const statusLower = req.body.status.toLowerCase();
      if (statusLower === 'active') {
        req.body.status = 'Active';
      } else if (statusLower === 'inactive') {
        req.body.status = 'Inactive';
      } else if (statusLower === 'draft') {
        req.body.status = 'Draft';
      } else {
        req.body.status = 'Active';
      }
    } else {
      req.body.status = 'Active';
    }

    // Normalize diamond origin values
    if (req.body.diamond_origin) {
      const normalizeDiamondOrigin = (value) => {
        const lower = value.toLowerCase();
        if (lower === 'natural') return 'Natural';
        if (lower === 'lab grown' || lower === 'lab-grown') return 'Lab Grown';
        return value;
      };

      if (Array.isArray(req.body.diamond_origin)) {
        req.body.diamond_origin = req.body.diamond_origin.map(normalizeDiamondOrigin);
      } else {
        req.body.diamond_origin = [normalizeDiamondOrigin(req.body.diamond_origin)];
      }
    }

    // Normalize metal type values
    if (req.body.metal_type) {
      const normalizeMetalType = (value) => {
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

    // Normalize diamond quality values
    if (req.body.diamond_quality) {
      const normalizeDiamondQuality = (value) => {
        const lower = value.toLowerCase();
        if (lower.includes('excellent') || lower.includes('best')) return 'Best - D, VVS';
        if (lower.includes('very good') || lower.includes('better')) return 'Better - E, VS1';
        if (lower.includes('good')) return 'Good - F, VS2';
        return value;
      };

      if (Array.isArray(req.body.diamond_quality)) {
        req.body.diamond_quality = req.body.diamond_quality.map(normalizeDiamondQuality);
      } else {
        req.body.diamond_quality = [normalizeDiamondQuality(req.body.diamond_quality)];
      }
    }

    // Normalize arrays
    const normalizeArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };
    const normalizeArraySubCategory = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };
    
    if (req.body.categoryId) {
      req.body.categoryId = normalizeArray(req.body.categoryId);
      if (req.body.categoryId.length > 1) {
        throw new Error("Only one category is allowed per product");
      }
    }
    if (req.body.subCategoryId) {
      req.body.subCategoryId = normalizeArraySubCategory(req.body.subCategoryId);
    }
    if (req.body.subSubCategoryId) {
      req.body.subSubCategoryId = normalizeArraySubCategory(req.body.subSubCategoryId);
    }
    if (req.body.metal_type && !Array.isArray(req.body.metal_type)) {
      req.body.metal_type = [req.body.metal_type];
    }
    if (req.body.diamond_origin && !Array.isArray(req.body.diamond_origin)) {
      req.body.diamond_origin = [req.body.diamond_origin];
    }
    if (req.body.carat_weight) {
      req.body.carat_weight = normalizeArray(req.body.carat_weight);
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
      req.body.ring_size = req.body.ring_size.map(s => {
        const num = typeof s === 'string' ? parseInt(s) : s;
        return isNaN(num) ? s : num;
      });
    }
    if (req.body.necklace_size) {
      req.body.necklace_size = normalizeArray(req.body.necklace_size);
    }
    if (req.body.stone) {
      req.body.stone = normalizeArray(req.body.stone);
    }
    if (req.body.design_styles) {
      req.body.design_styles = normalizeArray(req.body.design_styles);
    }

    // Validate categories
    if (req.body.categoryId && Array.isArray(req.body.categoryId)) {
      const categories = await Model.Category.find({
        _id: { $in: req.body.categoryId },
        isDeleted: false
      });

      if (categories.length !== req.body.categoryId.length) {
        throw new Error("One or more categories not found");
      }
    }

    // Validate subcategories
    if (req.body.subCategoryId && Array.isArray(req.body.subCategoryId)) {
      const subCategories = await Model.SubCategory.find({
        _id: { $in: req.body.subCategoryId },
        isDeleted: false
      });

      if (subCategories.length !== req.body.subCategoryId.length) {
        throw new Error("One or more subcategories not found");
      }
    }

    // Validate subSubCategories
    if (req.body.subSubCategoryId && Array.isArray(req.body.subSubCategoryId)) {
      const subSubCategories = await Model.SubSubCategory.find({
        _id: { $in: req.body.subSubCategoryId },
        isDeleted: false
      });

      if (subSubCategories.length !== req.body.subSubCategoryId.length) {
        throw new Error("One or more sub-subcategories not found");
      }
    }

    // Validate radio button fields (single ObjectId) - codes already converted above
    // For necklaces: assemblyTypes is used instead of settingConfigurations
    if (req.body.assemblyTypes) {
      const assemblyType = await Model.AssemblyType.findOne({
        _id: req.body.assemblyTypes,
        isDeleted: false
      });
      if (!assemblyType) {
        throw new Error("Assembly Type not found");
      }
    }
    
    // For necklaces: chainTypes is used instead of shankConfigurations
    if (req.body.chainTypes) {
      const chainType = await Model.ChainType.findOne({
        _id: req.body.chainTypes,
        isDeleted: false
      });
      if (!chainType) {
        throw new Error("Chain Type not found");
      }
    }

    if (req.body.holdingMethods) {
      const holdingMethod = await Model.HoldingMethods.findOne({
        _id: req.body.holdingMethods,
        isDeleted: false
      });
      if (!holdingMethod) {
        throw new Error("Holding method (Setting Type) not found");
      }
    }

    if (req.body.bandProfileShapes) {
      const bandProfileShape = await Model.BandProfileShapes.findOne({
        _id: req.body.bandProfileShapes,
        isDeleted: false
      });
      if (!bandProfileShape) {
        // Try ClosureType (for necklaces)
        const closureType = await Model.ClosureType.findOne({
          _id: req.body.bandProfileShapes,
          isDeleted: false
        });
        if (!closureType) {
          throw new Error("Band profile shape (Lock/Closure Type) not found");
        }
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

    // Validate bandFits (codes already converted above) - optional for necklaces
    if (req.body.bandFits && Array.isArray(req.body.bandFits) && req.body.bandFits.length > 0) {
      // Check if it's ObjectIds (should be after conversion)
      const isObjectId = /^[0-9a-f]{24}$/i.test(req.body.bandFits[0]);
      if (isObjectId) {
        // Validate as ObjectIds - could be BandFits or StoneSettings
        const bandFits = await Model.BandFits.find({
          _id: { $in: req.body.bandFits },
          isDeleted: false
        });
        const stoneSettings = await Model.StoneSetting.find({
          _id: { $in: req.body.bandFits },
          isDeleted: false
        });
        if (bandFits.length === 0 && stoneSettings.length !== req.body.bandFits.length) {
          throw new Error("One or more band fits (Stone Setting) not found");
        }
      }
    }

    // Normalize and validate multi-select dropdown fields (array of ObjectIds)
    const normalizeObjectIdArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };

    // For necklaces: finishDetails is used instead of shankTreatments
    if (req.body.finishDetails) {
      req.body.finishDetails = normalizeObjectIdArray(req.body.finishDetails);
      const finishDetails = await Model.FinishDetail.find({
        _id: { $in: req.body.finishDetails },
        isDeleted: false
      });
      if (finishDetails.length !== req.body.finishDetails.length) {
        throw new Error("One or more finish details not found");
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

    // Handle files from upload.any() - separate images, videos, and metal_images
    const regularImages = [];
    const regularVideos = [];
    const metalImagesFiles = {};

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.fieldname === 'images') {
          regularImages.push(file);
        } else if (file.fieldname === 'videos') {
          regularVideos.push(file);
        } else if (file.fieldname && file.fieldname.startsWith('metal_images_')) {
          if (!metalImagesFiles[file.fieldname]) {
            metalImagesFiles[file.fieldname] = [];
          }
          metalImagesFiles[file.fieldname].push(file);
        }
      });
    }

    // Handle regular images
    if (regularImages.length > 0) {
      req.body.images = regularImages.map(file => "/uploads/" + file.filename);
    } else if (req.body.images) {
      if (typeof req.body.images === 'string') {
        req.body.images = [req.body.images];
      } else if (!Array.isArray(req.body.images)) {
        req.body.images = [];
      }
    } else {
      req.body.images = [];
    }

    // Handle regular videos
    if (regularVideos.length > 0) {
      req.body.videos = regularVideos.map(file => "/uploads/" + file.filename);
    } else if (req.body.videos) {
      if (typeof req.body.videos === 'string') {
        req.body.videos = [req.body.videos];
      } else if (!Array.isArray(req.body.videos)) {
        req.body.videos = [];
      }
    } else {
      req.body.videos = [];
    }

    // Process metal_images files (single image per view angle)
    req.body.metal_images = [];

    const viewAngles = ['Angled_view', 'Top_view', 'Side_view', 'Image_1', 'Image_2', 'Image_3'];

    for (const fieldname of Object.keys(metalImagesFiles)) {
      const withoutPrefix = fieldname.replace('metal_images_', '');
      let metalType = '';
      let shape = '';
      let viewAngle = '';

      const sortedViewAngles = viewAngles.sort((a, b) => b.length - a.length);
      
      for (const va of sortedViewAngles) {
        if (withoutPrefix.endsWith('_' + va)) {
          viewAngle = va.replace(/_/g, ' ');
          const remaining = withoutPrefix.slice(0, -(va.length + 1));
          
          // Parse metalType and shape from remaining part
          const shapes = ['Oval', 'Circle', 'Round', 'Heart'];
          let foundShape = '';
          let shapeIndex = -1;
          
          for (const s of shapes) {
            const shapeUnderscore = s.replace(/\s+/g, '_');
            const index = remaining.lastIndexOf('_' + shapeUnderscore);
            if (index !== -1 && index > shapeIndex) {
              shapeIndex = index;
              foundShape = s;
            }
          }
          
          if (foundShape && shapeIndex !== -1) {
            shape = foundShape;
            metalType = remaining.slice(0, shapeIndex).replace(/_/g, ' ');
          } else {
            metalType = remaining.replace(/_/g, ' ');
          }
          break;
        }
      }

      if (metalType && shape && viewAngle && metalImagesFiles[fieldname].length > 0) {
        const imageFile = metalImagesFiles[fieldname][0];
        const filePath = "uploads/" + imageFile.filename;

        const fileFullPath = imageFile.path;
        const bucketName = "merefunds";

        const fileUrl = await uploadFileToS3(
          fileFullPath,
          bucketName,
          filePath
        );

        fs.unlinkSync(fileFullPath);

        req.body.metal_images.push({
          metal_type: metalType,
          shape: shape,
          view_angle: viewAngle,
          image: '/' + filePath,
        });
      }
    }

    if (!req.body.metal_images || !Array.isArray(req.body.metal_images)) {
      req.body.metal_images = [];
    }

    // Validate that either regular images or metal_images are provided
    if (req.body.images.length === 0 && req.body.metal_images.length === 0) {
      throw new Error("At least one image is required (either general images or metal-specific images)");
    }

    // Convert tags string to array if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    // Convert empty strings to null for enum fields
    if (req.body.back_type === '' || req.body.back_type === undefined) {
      req.body.back_type = null;
    }
    if (req.body.product_type === '' || req.body.product_type === undefined) {
      req.body.product_type = null;
    }
    if (req.body.viewAngle === '' || req.body.viewAngle === undefined) {
      req.body.viewAngle = null;
    }

    // Convert engraving_allowed string to boolean
    if (req.body.engraving_allowed !== undefined) {
      req.body.engraving_allowed = req.body.engraving_allowed === 'true' || req.body.engraving_allowed === true;
    }

    // Convert gift string to boolean
    if (req.body.gift !== undefined) {
      req.body.gift = req.body.gift === 'true' || req.body.gift === true;
    }

    // Build productDetailsConfiguration from individual fields
    if (!req.body.productDetailsConfiguration) {
      req.body.productDetailsConfiguration = {
        product_details: req.body.product_details || '',
        average_width: req.body.average_width || '',
        rhodium_plate: req.body.rhodium_plate || 'Yes',
        center_stone_details: req.body.center_stone_details || '',
        side_stone_details: req.body.side_stone_details || '',
        stone_details: req.body.stone_details || ''
      };
    }

    // Build centerStoneDetailsConfiguration from individual fields
    if (!req.body.centerStoneDetailsConfiguration && req.body.stone && Array.isArray(req.body.stone)) {
      req.body.centerStoneDetailsConfiguration = [];
      
      // Get center stone fields
      const centerStoneCertified = req.body.center_stone_certified || 'No';
      const centerStoneShape = req.body.center_stone_shape || '';
      const centerStoneMinWeight = req.body.center_stone_min_weight || '';
      const centerStoneColor = req.body.center_stone_color || '';
      const centerStoneColorQuality = req.body.center_stone_color_quality || '';
      const centerStoneClarity = req.body.center_stone_clarity || '';
      const centerStoneDiamondQuality = req.body.center_stone_diamond_quality || '';
      const centerStoneQualityType = req.body.center_stone_quality_type || '';

      // Build configuration for each stone type selected
      req.body.stone.forEach(stone => {
        if (stone !== 'None') {
          const config = {
            stone: stone,
            certified: centerStoneCertified,
            color: centerStoneColor,
            diamond_origin: req.body.diamond_origin && Array.isArray(req.body.diamond_origin) ? req.body.diamond_origin[0] : (req.body.diamond_origin || ''),
            diamond_shapes: centerStoneShape ? [centerStoneShape] : [],
            min_diamond_weight: centerStoneMinWeight,
            quantity: '',
            average_color: centerStoneColorQuality,
            average_clarity: centerStoneClarity,
            dimensions: '',
            gemstone_type: ''
          };
          req.body.centerStoneDetailsConfiguration.push(config);
        }
      });
    }

    // Build sideStoneDetailsConfiguration from individual fields
    if (!req.body.sideStoneDetailsConfiguration) {
      req.body.sideStoneDetailsConfiguration = [];
      
      // Collect all side stone data from fields like ss_${stoneKey}_origin, ss_${stoneKey}_quantity, etc.
      const sideStoneKeys = new Set();
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('ss_') && key.includes('_origin')) {
          const stoneKey = key.replace('ss_', '').replace('_origin', '').replace(/_/g, ' ');
          sideStoneKeys.add(stoneKey);
        }
      });

      sideStoneKeys.forEach(stoneKey => {
        const stoneKeyUnderscore = stoneKey.replace(/\s+/g, '_');
        const origins = [];
        const shapes = [];
        
        // Collect all origins and shapes (they can be multiple)
        Object.keys(req.body).forEach(key => {
          if (key === `ss_${stoneKeyUnderscore}_origin`) {
            if (Array.isArray(req.body[key])) {
              origins.push(...req.body[key]);
            } else {
              origins.push(req.body[key]);
            }
          } else if (key === `ss_${stoneKeyUnderscore}_shape`) {
            if (Array.isArray(req.body[key])) {
              shapes.push(...req.body[key]);
            } else {
              shapes.push(req.body[key]);
            }
          }
        });

        const config = {
          stone: stoneKey,
          diamond_origin: origins.length > 0 ? origins.join(', ') : '',
          diamond_shapes: shapes,
          min_diamond_weight: req.body[`ss_${stoneKeyUnderscore}_min_diamond_weight`] || '',
          quantity: req.body[`ss_${stoneKeyUnderscore}_quantity`] || '',
          average_color: req.body[`ss_${stoneKeyUnderscore}_avg_color`] || '',
          average_clarity: req.body[`ss_${stoneKeyUnderscore}_avg_clarity`] || '',
          dimensions: req.body[`ss_${stoneKeyUnderscore}_dimensions`] || '',
          gemstone_type: req.body[`ss_${stoneKeyUnderscore}_gemstone_type`] || ''
        };
        req.body.sideStoneDetailsConfiguration.push(config);
      });
    }

    // Build stoneDetailsFormConfiguration from individual fields
    if (!req.body.stoneDetailsFormConfiguration) {
      req.body.stoneDetailsFormConfiguration = [];
      
      const stoneDetailsCertified = req.body.stone_details_certified || 'No';
      const stoneDetailsColor = req.body.stone_details_color || '';
      
      // Get stone_details_stone (can be array or single value)
      let stoneDetailsStones = [];
      if (req.body.stone_details_stone) {
        if (Array.isArray(req.body.stone_details_stone)) {
          stoneDetailsStones = req.body.stone_details_stone;
        } else {
          stoneDetailsStones = [req.body.stone_details_stone];
        }
      } else if (req.body.stone && Array.isArray(req.body.stone)) {
        // Fallback to main stone selection
        stoneDetailsStones = req.body.stone.filter(s => s !== 'None');
      }

      // Collect all stone detail data from fields like sd_${stoneKey}_origin, sd_${stoneKey}_quantity, etc.
      const stoneDetailKeys = new Set();
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('sd_') && key.includes('_origin')) {
          const stoneKey = key.replace('sd_', '').replace('_origin', '').replace(/_/g, ' ');
          stoneDetailKeys.add(stoneKey);
        }
      });

      // If we have stone_details_stone but no sd_ fields, use the stones from stone_details_stone
      if (stoneDetailKeys.size === 0 && stoneDetailsStones.length > 0) {
        stoneDetailsStones.forEach(stone => {
          stoneDetailKeys.add(stone);
        });
      }

      stoneDetailKeys.forEach(stoneKey => {
        const stoneKeyUnderscore = stoneKey.replace(/\s+/g, '_');
        const origins = [];
        const shapes = [];
        
        // Collect all origins and shapes (they can be multiple)
        Object.keys(req.body).forEach(key => {
          if (key === `sd_${stoneKeyUnderscore}_origin`) {
            if (Array.isArray(req.body[key])) {
              origins.push(...req.body[key]);
            } else {
              origins.push(req.body[key]);
            }
          } else if (key === `sd_${stoneKeyUnderscore}_shape`) {
            if (Array.isArray(req.body[key])) {
              shapes.push(...req.body[key]);
            } else {
              shapes.push(req.body[key]);
            }
          }
        });

        const config = {
          stone: stoneKey,
          certified: stoneDetailsCertified,
          color: stoneDetailsColor,
          diamond_origin: origins.length > 0 ? origins.join(', ') : '',
          diamond_shapes: shapes,
          min_diamond_weight: req.body[`sd_${stoneKeyUnderscore}_min_diamond_weight`] || '',
          quantity: req.body[`sd_${stoneKeyUnderscore}_quantity`] || '',
          average_color: req.body[`sd_${stoneKeyUnderscore}_avg_color`] || '',
          average_clarity: req.body[`sd_${stoneKeyUnderscore}_avg_clarity`] || '',
          dimensions: req.body[`sd_${stoneKeyUnderscore}_dimensions`] || '',
          gemstone_type: req.body[`sd_${stoneKeyUnderscore}_gemstone_type`] || ''
        };
        req.body.stoneDetailsFormConfiguration.push(config);
      });
    }

    let product = await Model.Product.create(req.body);
    await product.populate([
      'categoryId',
      'subCategoryId',
      'subSubCategoryId',
      'assemblyTypes',
      'chainTypes',
      'finishDetails',
      'holdingMethods',
      'bandProfileShapes',
      'bandWidthCategories',
      'bandFits',
      'shankTreatments',
      'styles',
      'settingFeatures',
      'motifThemes',
      'ornamentDetails'
    ]);

    return res.success(constants.MESSAGES.DATA_UPLOADED, product);
  } catch (error) {
    next(error);
  }
}

// Create Earrings Product
module.exports.createEarringsProduct = async (req, res, next) => {
  // Parse variants from JSON string (multipart/form-data case)
  if (req.body.variants) {
    if (typeof req.body.variants === 'string') {
      try {
        req.body.variants = JSON.parse(req.body.variants);
      } catch (e) {
        return next(new Error('Invalid variants JSON'));
      }
    }
  }
console.log("req.body for earrings", req.body); 

  // Parse productDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.productDetailsConfiguration) {
    if (typeof req.body.productDetailsConfiguration === 'string') {
      try {
        req.body.productDetailsConfiguration = JSON.parse(req.body.productDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid productDetailsConfiguration JSON'));
      }
    }
  }

  // Parse centerStoneDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.centerStoneDetailsConfiguration) {
    if (typeof req.body.centerStoneDetailsConfiguration === 'string') {
      try {
        req.body.centerStoneDetailsConfiguration = JSON.parse(req.body.centerStoneDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid centerStoneDetailsConfiguration JSON'));
      }
    }
  }

  // Parse sideStoneDetailsConfiguration from JSON string (multipart/form-data case)
  if (req.body.sideStoneDetailsConfiguration) {
    if (typeof req.body.sideStoneDetailsConfiguration === 'string') {
      try {
        req.body.sideStoneDetailsConfiguration = JSON.parse(req.body.sideStoneDetailsConfiguration);
      } catch (e) {
        return next(new Error('Invalid sideStoneDetailsConfiguration JSON'));
      }
    }
  }

  // Parse stoneDetailsFormConfiguration from JSON string (multipart/form-data case)
  if (req.body.stoneDetailsFormConfiguration) {
    if (typeof req.body.stoneDetailsFormConfiguration === 'string') {
      try {
        req.body.stoneDetailsFormConfiguration = JSON.parse(req.body.stoneDetailsFormConfiguration);
      } catch (e) {
        return next(new Error('Invalid stoneDetailsFormConfiguration JSON'));
      }
    }
  }

  // Parse carat_min_weights from JSON string (multipart/form-data case)
  if (req.body.carat_min_weights) {
    if (typeof req.body.carat_min_weights === 'string') {
      try {
        req.body.carat_min_weights = JSON.parse(req.body.carat_min_weights);
      } catch (e) {
        return next(new Error('Invalid carat_min_weights JSON'));
      }
    }
  }

  try {
    // Create bodyToValidate BEFORE mapping/deleting fields for validation
    const bodyToValidate = { ...req.body };
    
    // Convert codes to ObjectIds AFTER validation (for earrings-specific fields)
    // For earrings: settingConfigurations is used for UnitOfSale (can be code or ObjectId)
    if (req.body.settingConfigurations) {
      req.body.unitOfSale = req.body.settingConfigurations;
      delete req.body.settingConfigurations;
    }

    // For earrings: shankConfigurations is used for DropShape (can be codes or ObjectIds)
    if (req.body.shankConfigurations && Array.isArray(req.body.shankConfigurations) && req.body.shankConfigurations.length > 0) {
      req.body.dropShape = req.body.shankConfigurations;
      delete req.body.shankConfigurations;
    } 

    // For earrings: bandProfileShapes is used for AttachmentType (can be code or ObjectId)
    if (req.body.bandProfileShapes) {
      req.body.attachmentType = req.body.bandProfileShapes;
      delete req.body.bandProfileShapes;
    }

    // For earrings: bandWidthCategories is used for EarringOrientation (can be code or ObjectId)
    if (req.body.bandWidthCategories) {
      req.body.earringOrientation = req.body.bandWidthCategories;
      delete req.body.bandWidthCategories;
    }

    // For earrings: bandFits is used for StoneSetting (can be codes or ObjectIds)
    if (req.body.bandFits && Array.isArray(req.body.bandFits) && req.body.bandFits.length > 0) {
      req.body.stoneSettings = req.body.bandFits;
      delete req.body.bandFits;
    } 

    // For earrings: shankTreatments is used for FinishDetails (can be codes or ObjectIds)
    if (req.body.shankTreatments) {
      req.body.finishDetails = req.body.shankTreatments;
      delete req.body.shankTreatments;
    }

    // Remove placementFits (ornamentDetails) for earrings - not needed
    delete req.body.placementFits;
    if (req.body.ornamentDetails) {
      delete req.body.ornamentDetails;
    }
    
    // Remove dynamic fields that start with ss_ (side stone) and sd_ (stone details) from validation
    // These are processed separately to build configuration objects
    Object.keys(bodyToValidate).forEach(key => {
      if (key.startsWith('ss_') || key.startsWith('sd_')) {
        delete bodyToValidate[key];
      }
    });
    
    // Remove optional fields from validation if not provided
    const optionalFields = ['bandWidthCategories', 'settingConfigurations', 'shankConfigurations', 'ornamentDetails', 'bandFits', 'shankTreatments', 'placementFits', 'bandProfileShapes'];
    optionalFields.forEach(field => {
      if (!bodyToValidate[field] || bodyToValidate[field] === '' || 
          (Array.isArray(bodyToValidate[field]) && bodyToValidate[field].length === 0)) {
        delete bodyToValidate[field];
      }
    });
    
    // For earrings, remove ring_size if it's empty or not a valid array/number
    // Earrings use ring_size
    if (bodyToValidate.ring_size !== undefined) {
      if (!bodyToValidate.ring_size || bodyToValidate.ring_size === '' || 
          (Array.isArray(bodyToValidate.ring_size) && bodyToValidate.ring_size.length === 0)) {
        delete bodyToValidate.ring_size;
        delete req.body.ring_size; // Also remove from req.body
      }
    }
    
    // Create a modified validation schema with optional fields for earrings
    const baseValidation = Validation.Product.createProduct.fork(
      ['bandWidthCategories', 'settingConfigurations', 'shankConfigurations', 'ornamentDetails', 'bandFits', 'shankTreatments', 'placementFits', 'bandProfileShapes'], 
      (schema) => schema.optional()
    );
    
    // Override bandFits to accept array or string (ObjectId)
    const earringsValidation = baseValidation.fork(['bandFits'], (schema) => 
      Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.objectId(),
        Joi.string().allow('')
      ).optional()
    );
    
    // Override bandProfileShapes to be optional for earrings (it gets mapped to attachmentType)
    const earringsValidationWithBandProfile = earringsValidation.fork(['bandProfileShapes'], (schema) => 
      Joi.objectId().optional().allow(null, '')
    );
    
    // Allow unknown fields (for dynamic fields like ss_*, sd_*, etc. that are processed separately)
    const finalValidation = earringsValidationWithBandProfile.unknown(true);
    
    await finalValidation.validateAsync(bodyToValidate); 
    
    if (Array.isArray(req.body.variants)) {
      req.body.variants = req.body.variants.map(v => ({
        diamond_type: v.diamond_type,
        carat_weight: v.carat_weight,
        metal_type: v.metal_type,
        diamond_quality: v.diamond_quality || '',
        shape: v.shape || '',
        price: Number(v.price),
        discounted_price: Number(v.discounted_price),
      }));
    } else {
      req.body.variants = [];
    }
    
    if (!req.body.product_id || req.body.product_id.trim() === '') {
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

    // Normalize status
    if (req.body.status) {
      const statusLower = req.body.status.toLowerCase();
      if (statusLower === 'active') {
        req.body.status = 'Active';
      } else if (statusLower === 'inactive') {
        req.body.status = 'Inactive';
      } else if (statusLower === 'draft') {
        req.body.status = 'Draft';
      } else {
        req.body.status = 'Active';
      }
    } else {
      req.body.status = 'Active';
    }

    // Normalize diamond origin values
    if (req.body.diamond_origin) {
      const normalizeDiamondOrigin = (value) => {
        const lower = value.toLowerCase();
        if (lower === 'natural') return 'Natural';
        if (lower === 'lab grown' || lower === 'lab-grown') return 'Lab Grown';
        return value;
      };

      if (Array.isArray(req.body.diamond_origin)) {
        req.body.diamond_origin = req.body.diamond_origin.map(normalizeDiamondOrigin);
      } else {
        req.body.diamond_origin = [normalizeDiamondOrigin(req.body.diamond_origin)];
      }
    }

    // Normalize metal type values
    if (req.body.metal_type) {
      const normalizeMetalType = (value) => {
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

    // Normalize diamond quality values
    if (req.body.diamond_quality) {
      const normalizeDiamondQuality = (value) => {
        const lower = value.toLowerCase();
        if (lower.includes('excellent') || lower.includes('best')) return 'Best - D, VVS';
        if (lower.includes('very good') || lower.includes('better')) return 'Better - E, VS1';
        if (lower.includes('good')) return 'Good - F, VS2';
        return value;
      };

      if (Array.isArray(req.body.diamond_quality)) {
        req.body.diamond_quality = req.body.diamond_quality.map(normalizeDiamondQuality);
      } else {
        req.body.diamond_quality = [normalizeDiamondQuality(req.body.diamond_quality)];
      }
    }

    // Normalize arrays
    const normalizeArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };
    const normalizeArraySubCategory = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };
    
    if (req.body.categoryId) {
      req.body.categoryId = normalizeArray(req.body.categoryId);
      if (req.body.categoryId.length > 1) {
        throw new Error("Only one category is allowed per product");
      }
    }
    if (req.body.subCategoryId) {
      req.body.subCategoryId = normalizeArraySubCategory(req.body.subCategoryId);
    }
    if (req.body.subSubCategoryId) {
      req.body.subSubCategoryId = normalizeArraySubCategory(req.body.subSubCategoryId);
    }
    if (req.body.metal_type && !Array.isArray(req.body.metal_type)) {
      req.body.metal_type = [req.body.metal_type];
    }
    if (req.body.diamond_origin && !Array.isArray(req.body.diamond_origin)) {
      req.body.diamond_origin = [req.body.diamond_origin];
    }
    if (req.body.carat_weight) {
      req.body.carat_weight = normalizeArray(req.body.carat_weight);
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
      req.body.ring_size = req.body.ring_size.map(s => {
        const num = typeof s === 'string' ? parseInt(s) : s;
        return isNaN(num) ? s : num;
      });
    }
    if (req.body.stone) {
      req.body.stone = normalizeArray(req.body.stone);
    }
    if (req.body.design_styles) {
      req.body.design_styles = normalizeArray(req.body.design_styles);
    }

    // Validate categories
    if (req.body.categoryId && Array.isArray(req.body.categoryId)) {
      const categories = await Model.Category.find({
        _id: { $in: req.body.categoryId },
        isDeleted: false
      });

      if (categories.length !== req.body.categoryId.length) {
        throw new Error("One or more categories not found");
      }
    }

    // Validate subcategories
    if (req.body.subCategoryId && Array.isArray(req.body.subCategoryId)) {
      const subCategories = await Model.SubCategory.find({
        _id: { $in: req.body.subCategoryId },
        isDeleted: false
      });

      if (subCategories.length !== req.body.subCategoryId.length) {
        throw new Error("One or more subcategories not found");
      }
    }

    // Validate subSubCategories
    if (req.body.subSubCategoryId && Array.isArray(req.body.subSubCategoryId)) {
      const subSubCategories = await Model.SubSubCategory.find({
        _id: { $in: req.body.subSubCategoryId },
        isDeleted: false
      });

      if (subSubCategories.length !== req.body.subSubCategoryId.length) {
        throw new Error("One or more sub-subcategories not found");
      }
    }

    // Validate radio button fields (single ObjectId) - codes already converted above
    // For earrings: unitOfSale is used instead of settingConfigurations
    if (req.body.unitOfSale) {
      const unitOfSale = await Model.UnitOfSale.findOne({
        _id: req.body.unitOfSale,
        isDeleted: false
      });
      if (!unitOfSale) {
        throw new Error("Unit of Sale not found");
      }
    }
    
    // For earrings: dropShape is used instead of shankConfigurations (array)
    if (req.body.dropShape && Array.isArray(req.body.dropShape) && req.body.dropShape.length > 0) {
      const dropShapes = await Model.DropShape.find({
        _id: { $in: req.body.dropShape },
        isDeleted: false
      });
      if (dropShapes.length !== req.body.dropShape.length) {
        throw new Error("One or more drop shapes not found");
      }
    }

    if (req.body.holdingMethods) {
      const holdingMethod = await Model.HoldingMethods.findOne({
        _id: req.body.holdingMethods,
        isDeleted: false
      });
      if (!holdingMethod) {
        throw new Error("Holding method (Setting Type) not found");
      }
    }

    // For earrings: attachmentType is used instead of bandProfileShapes
    if (req.body.attachmentType) {
      const attachmentType = await Model.AttachmentType.findOne({
        _id: req.body.attachmentType,
        isDeleted: false
      });
      if (!attachmentType) {
        throw new Error("Attachment type (Lock) not found");
      }
    }

    // For earrings: earringOrientation is used instead of bandWidthCategories
    if (req.body.earringOrientation) {
      const earringOrientation = await Model.EarringOrientation.findOne({
        _id: req.body.earringOrientation,
        isDeleted: false
      });
      if (!earringOrientation) {
        throw new Error("Earring orientation not found");
      }
    }

    // Validate bandFits (codes already converted above) - optional for earrings
    if (req.body.bandFits && Array.isArray(req.body.bandFits) && req.body.bandFits.length > 0) {
      // Check if it's ObjectIds (should be after conversion)
      const isObjectId = /^[0-9a-f]{24}$/i.test(req.body.bandFits[0]);
      if (isObjectId) {
        // Validate as ObjectIds - could be BandFits or StoneSettings
        const bandFits = await Model.BandFits.find({
          _id: { $in: req.body.bandFits },
          isDeleted: false
        });
        const stoneSettings = await Model.StoneSetting.find({
          _id: { $in: req.body.bandFits },
          isDeleted: false
        });
        if (bandFits.length === 0 && stoneSettings.length !== req.body.bandFits.length) {
          throw new Error("One or more band fits (Stone Setting) not found");
        }
      }
    }

    // Normalize and validate multi-select dropdown fields (array of ObjectIds)
    const normalizeObjectIdArray = (value) => {
      if (!value) return value;
      return Array.isArray(value) ? value : [value];
    };

    // For earrings: finishDetails is used instead of shankTreatments
    if (req.body.finishDetails) {
      req.body.finishDetails = normalizeObjectIdArray(req.body.finishDetails);
      const finishDetails = await Model.FinishDetail.find({
        _id: { $in: req.body.finishDetails },
        isDeleted: false
      });
      if (finishDetails.length !== req.body.finishDetails.length) {
        throw new Error("One or more finish details not found");
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

    // Handle files from upload.any() - separate images, videos, and metal_images
    const regularImages = [];
    const regularVideos = [];
    const metalImagesFiles = {};

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.fieldname === 'images') {
          regularImages.push(file);
        } else if (file.fieldname === 'videos') {
          regularVideos.push(file);
        } else if (file.fieldname && file.fieldname.startsWith('metal_images_')) {
          if (!metalImagesFiles[file.fieldname]) {
            metalImagesFiles[file.fieldname] = [];
          }
          metalImagesFiles[file.fieldname].push(file);
        }
      });
    }

    // Handle regular images
    if (regularImages.length > 0) {
      req.body.images = regularImages.map(file => "/uploads/" + file.filename);
    } else if (req.body.images) {
      if (typeof req.body.images === 'string') {
        req.body.images = [req.body.images];
      } else if (!Array.isArray(req.body.images)) {
        req.body.images = [];
      }
    } else {
      req.body.images = [];
    }

    // Handle regular videos
    if (regularVideos.length > 0) {
      req.body.videos = regularVideos.map(file => "/uploads/" + file.filename);
    } else if (req.body.videos) {
      if (typeof req.body.videos === 'string') {
        req.body.videos = [req.body.videos];
      } else if (!Array.isArray(req.body.videos)) {
        req.body.videos = [];
      }
    } else {
      req.body.videos = [];
    }

    // Process metal_images files (single image per view angle)
    req.body.metal_images = [];

    const viewAngles = ['Angled_view', 'Top_view', 'Side_view', 'Image_1', 'Image_2', 'Image_3'];

    for (const fieldname of Object.keys(metalImagesFiles)) {
      const withoutPrefix = fieldname.replace('metal_images_', '');
      let metalType = '';
      let shape = '';
      let viewAngle = '';

      const sortedViewAngles = viewAngles.sort((a, b) => b.length - a.length);
      
      for (const va of sortedViewAngles) {
        if (withoutPrefix.endsWith('_' + va)) {
          viewAngle = va.replace(/_/g, ' ');
          const remaining = withoutPrefix.slice(0, -(va.length + 1));
          
          // Parse metalType and shape from remaining part
          const shapes = ['Oval', 'Circle', 'Round', 'Heart'];
          let foundShape = '';
          let shapeIndex = -1;
          
          for (const s of shapes) {
            const shapeUnderscore = s.replace(/\s+/g, '_');
            const index = remaining.lastIndexOf('_' + shapeUnderscore);
            if (index !== -1 && index > shapeIndex) {
              shapeIndex = index;
              foundShape = s;
            }
          }
          
          if (foundShape && shapeIndex !== -1) {
            shape = foundShape;
            metalType = remaining.slice(0, shapeIndex).replace(/_/g, ' ');
          } else {
            metalType = remaining.replace(/_/g, ' ');
          }
          break;
        }
      }

      if (metalType && shape && viewAngle && metalImagesFiles[fieldname].length > 0) {
        const imageFile = metalImagesFiles[fieldname][0];
        const filePath = "uploads/" + imageFile.filename;

        const fileFullPath = imageFile.path;
        const bucketName = "merefunds";

        const fileUrl = await uploadFileToS3(
          fileFullPath,
          bucketName,
          filePath
        );

        fs.unlinkSync(fileFullPath);

        req.body.metal_images.push({
          metal_type: metalType,
          shape: shape,
          view_angle: viewAngle,
          image: '/' + filePath,
        });
      }
    }

    if (!req.body.metal_images || !Array.isArray(req.body.metal_images)) {
      req.body.metal_images = [];
    }

    // Validate that either regular images or metal_images are provided
    if (req.body.images.length === 0 && req.body.metal_images.length === 0) {
      throw new Error("At least one image is required (either general images or metal-specific images)");
    }

    // Convert tags string to array if needed
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    // Convert empty strings to null for enum fields
    if (req.body.back_type === '' || req.body.back_type === undefined) {
      req.body.back_type = null;
    }
    if (req.body.product_type === '' || req.body.product_type === undefined) {
      req.body.product_type = null;
    }
    if (req.body.viewAngle === '' || req.body.viewAngle === undefined) {
      req.body.viewAngle = null;
    }

    // Convert engraving_allowed string to boolean
    if (req.body.engraving_allowed !== undefined) {
      req.body.engraving_allowed = req.body.engraving_allowed === 'true' || req.body.engraving_allowed === true;
    }

    // Convert gift string to boolean
    if (req.body.gift !== undefined) {
      req.body.gift = req.body.gift === 'true' || req.body.gift === true;
    }

    // Build productDetailsConfiguration from individual fields
    if (!req.body.productDetailsConfiguration) {
      req.body.productDetailsConfiguration = {
        product_details: req.body.product_details || '',
        average_width: req.body.average_width || '',
        rhodium_plate: req.body.rhodium_plate || 'Yes',
        center_stone_details: req.body.center_stone_details || '',
        side_stone_details: req.body.side_stone_details || '',
        stone_details: req.body.stone_details || ''
      };
    }

    // Build centerStoneDetailsConfiguration from individual fields
    if (!req.body.centerStoneDetailsConfiguration && req.body.stone && Array.isArray(req.body.stone)) {
      req.body.centerStoneDetailsConfiguration = [];
      
      // Get center stone fields
      const centerStoneCertified = req.body.center_stone_certified || 'No';
      const centerStoneShape = req.body.center_stone_shape || '';
      const centerStoneMinWeight = req.body.center_stone_min_weight || '';
      const centerStoneColor = req.body.center_stone_color || '';
      const centerStoneColorQuality = req.body.center_stone_color_quality || '';
      const centerStoneClarity = req.body.center_stone_clarity || '';
      const centerStoneDiamondQuality = req.body.center_stone_diamond_quality || '';
      const centerStoneQualityType = req.body.center_stone_quality_type || '';

      // Build configuration for each stone type selected
      req.body.stone.forEach(stone => {
        if (stone !== 'None') {
          const config = {
            stone: stone,
            certified: centerStoneCertified,
            color: centerStoneColor,
            diamond_origin: req.body.diamond_origin && Array.isArray(req.body.diamond_origin) ? req.body.diamond_origin[0] : (req.body.diamond_origin || ''),
            diamond_shapes: centerStoneShape ? [centerStoneShape] : [],
            min_diamond_weight: centerStoneMinWeight,
            quantity: '',
            average_color: centerStoneColorQuality,
            average_clarity: centerStoneClarity,
            dimensions: '',
            gemstone_type: ''
          };
          req.body.centerStoneDetailsConfiguration.push(config);
        }
      });
    }

    // Build sideStoneDetailsConfiguration from individual fields
    if (!req.body.sideStoneDetailsConfiguration) {
      req.body.sideStoneDetailsConfiguration = [];
      
      // Collect all side stone data from fields like ss_${stoneKey}_origin, ss_${stoneKey}_quantity, etc.
      const sideStoneKeys = new Set();
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('ss_') && key.includes('_origin')) {
          const stoneKey = key.replace('ss_', '').replace('_origin', '').replace(/_/g, ' ');
          sideStoneKeys.add(stoneKey);
        }
      });

      sideStoneKeys.forEach(stoneKey => {
        const stoneKeyUnderscore = stoneKey.replace(/\s+/g, '_');
        const origins = [];
        const shapes = [];
        
        // Collect all origins and shapes (they can be multiple)
        Object.keys(req.body).forEach(key => {
          if (key === `ss_${stoneKeyUnderscore}_origin`) {
            if (Array.isArray(req.body[key])) {
              origins.push(...req.body[key]);
            } else {
              origins.push(req.body[key]);
            }
          } else if (key === `ss_${stoneKeyUnderscore}_shape`) {
            if (Array.isArray(req.body[key])) {
              shapes.push(...req.body[key]);
            } else {
              shapes.push(req.body[key]);
            }
          }
        });

        const config = {
          stone: stoneKey,
          diamond_origin: origins.length > 0 ? origins.join(', ') : '',
          diamond_shapes: shapes,
          min_diamond_weight: req.body[`ss_${stoneKeyUnderscore}_min_diamond_weight`] || '',
          quantity: req.body[`ss_${stoneKeyUnderscore}_quantity`] || '',
          average_color: req.body[`ss_${stoneKeyUnderscore}_avg_color`] || '',
          average_clarity: req.body[`ss_${stoneKeyUnderscore}_avg_clarity`] || '',
          dimensions: req.body[`ss_${stoneKeyUnderscore}_dimensions`] || '',
          gemstone_type: req.body[`ss_${stoneKeyUnderscore}_gemstone_type`] || ''
        };
        req.body.sideStoneDetailsConfiguration.push(config);
      });
    }

    // Build stoneDetailsFormConfiguration from individual fields
    if (!req.body.stoneDetailsFormConfiguration) {
      req.body.stoneDetailsFormConfiguration = [];
      
      const stoneDetailsCertified = req.body.stone_details_certified || 'No';
      const stoneDetailsColor = req.body.stone_details_color || '';
      
      // Get stone_details_stone (can be array or single value)
      let stoneDetailsStones = [];
      if (req.body.stone_details_stone) {
        if (Array.isArray(req.body.stone_details_stone)) {
          stoneDetailsStones = req.body.stone_details_stone;
        } else {
          stoneDetailsStones = [req.body.stone_details_stone];
        }
      } else if (req.body.stone && Array.isArray(req.body.stone)) {
        // Fallback to main stone selection
        stoneDetailsStones = req.body.stone.filter(s => s !== 'None');
      }

      // Collect all stone detail data from fields like sd_${stoneKey}_origin, sd_${stoneKey}_quantity, etc.
      const stoneDetailKeys = new Set();
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('sd_') && key.includes('_origin')) {
          const stoneKey = key.replace('sd_', '').replace('_origin', '').replace(/_/g, ' ');
          stoneDetailKeys.add(stoneKey);
        }
      });

      // If we have stone_details_stone but no sd_ fields, use the stones from stone_details_stone
      if (stoneDetailKeys.size === 0 && stoneDetailsStones.length > 0) {
        stoneDetailsStones.forEach(stone => {
          stoneDetailKeys.add(stone);
        });
      }

      stoneDetailKeys.forEach(stoneKey => {
        const stoneKeyUnderscore = stoneKey.replace(/\s+/g, '_');
        const origins = [];
        const shapes = [];
        
        // Collect all origins and shapes (they can be multiple)
        Object.keys(req.body).forEach(key => {
          if (key === `sd_${stoneKeyUnderscore}_origin`) {
            if (Array.isArray(req.body[key])) {
              origins.push(...req.body[key]);
            } else {
              origins.push(req.body[key]);
            }
          } else if (key === `sd_${stoneKeyUnderscore}_shape`) {
            if (Array.isArray(req.body[key])) {
              shapes.push(...req.body[key]);
            } else {
              shapes.push(req.body[key]);
            }
          }
        });

        const config = {
          stone: stoneKey,
          certified: stoneDetailsCertified,
          color: stoneDetailsColor,
          diamond_origin: origins.length > 0 ? origins.join(', ') : '',
          diamond_shapes: shapes,
          min_diamond_weight: req.body[`sd_${stoneKeyUnderscore}_min_diamond_weight`] || '',
          quantity: req.body[`sd_${stoneKeyUnderscore}_quantity`] || '',
          average_color: req.body[`sd_${stoneKeyUnderscore}_avg_color`] || '',
          average_clarity: req.body[`sd_${stoneKeyUnderscore}_avg_clarity`] || '',
          dimensions: req.body[`sd_${stoneKeyUnderscore}_dimensions`] || '',
          gemstone_type: req.body[`sd_${stoneKeyUnderscore}_gemstone_type`] || ''
        };
        req.body.stoneDetailsFormConfiguration.push(config);
      });
    }

    // Set product_type to Earrings
    req.body.product_type = 'Earrings';

    let product = await Model.Product.create(req.body);
    await product.populate([
      'categoryId',
      'subCategoryId',
      'subSubCategoryId',
      'unitOfSale',
      'dropShape',
      'attachmentType',
      'earringOrientation',
      'finishDetails',
      'holdingMethods',
      'stoneSettings',
      'styles',
      'settingFeatures',
      'motifThemes'
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

    // Filter by subSubcategory (support both single and array)
    if (req.query.subSubCategoryId) {
      query.subSubCategoryId = Array.isArray(req.query.subSubCategoryId)
        ? { $in: req.query.subSubCategoryId }
        : req.query.subSubCategoryId;
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
        'subSubCategoryId',
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
        'ornamentDetails'
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
      'subSubCategoryId',
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
      'subSubCategoryId',
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
      // Validate that only one category is provided
      if (req.body.categoryId.length > 1) {
        throw new Error("Only one category is allowed per product");
      }
    }
    if (req.body.subCategoryId) {
      req.body.subCategoryId = normalizeArray(req.body.subCategoryId);
    }
    if (req.body.subSubCategoryId) {
      req.body.subSubCategoryId = normalizeArray(req.body.subSubCategoryId);
    }
    if (req.body.metal_type) {
      req.body.metal_type = normalizeArray(req.body.metal_type);
    }
    if (req.body.shape) {
      req.body.shape = normalizeArray(req.body.shape);
    }
    if (req.body.karat) {
      req.body.karat = normalizeArray(req.body.karat);
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
    if (req.body.stone) {
      req.body.stone = normalizeArray(req.body.stone);
    }
    if (req.body.design_styles) {
      req.body.design_styles = normalizeArray(req.body.design_styles);
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

    // If subSubCategories are being updated, verify they exist
    if (req.body.subSubCategoryId && Array.isArray(req.body.subSubCategoryId)) {
      const subSubCategories = await Model.SubSubCategory.find({
        _id: { $in: req.body.subSubCategoryId },
        isDeleted: false
      });

      if (subSubCategories.length !== req.body.subSubCategoryId.length) {
        throw new Error("One or more sub-subcategories not found");
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

    // Handle files from upload.any() - separate images, videos, and metal_images
    const regularImages = [];
    const regularVideos = [];
    const metalImagesFiles = {};

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.fieldname === 'images') {
          regularImages.push(file);
        } else if (file.fieldname === 'videos') {
          regularVideos.push(file);
        } else if (file.fieldname && file.fieldname.startsWith('metal_images_')) {
          if (!metalImagesFiles[file.fieldname]) {
            metalImagesFiles[file.fieldname] = [];
          }
          metalImagesFiles[file.fieldname].push(file);
        }
      });
    }

    // Handle regular images
    if (regularImages.length > 0) {
      const newImages = regularImages.map(file => "/uploads/" + file.filename);
      req.body.images = req.body.images
        ? [...req.body.images, ...newImages]
        : [...product.images, ...newImages];
    } else if (req.body.images && typeof req.body.images === 'string') {
      req.body.images = [req.body.images];
    }

    // Handle regular videos
    if (regularVideos.length > 0) {
      const newVideos = regularVideos.map(file => "/uploads/" + file.filename);
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

    // Process metal_images files (single image per view angle)
    if (Object.keys(metalImagesFiles).length > 0) {
      req.body.metal_images = [];
      const viewAngles = ['Angled_view', 'Top_view', 'Side_view', 'Image_1', 'Image_2', 'Image_3'];
      Object.keys(metalImagesFiles).forEach((fieldname) => {
        const withoutPrefix = fieldname.replace('metal_images_', '');
        let metalType = '';
        let shape = '';
        let viewAngle = '';

        const sortedViewAngles = viewAngles.sort((a, b) => b.length - a.length);
        
        for (const va of sortedViewAngles) {
          if (withoutPrefix.endsWith('_' + va)) {
            viewAngle = va.replace(/_/g, ' ');
            const remaining = withoutPrefix.slice(0, -(va.length + 1));
            
            // Parse metalType and shape from remaining part
            const shapes = ['Oval', 'Circle', 'Round', 'Heart'];
            let foundShape = '';
            let shapeIndex = -1;
            
            for (const s of shapes) {
              const shapeUnderscore = s.replace(/\s+/g, '_');
              const index = remaining.lastIndexOf('_' + shapeUnderscore);
              if (index !== -1 && index > shapeIndex) {
                shapeIndex = index;
                foundShape = s;
              }
            }
            
            if (foundShape && shapeIndex !== -1) {
              shape = foundShape;
              metalType = remaining.slice(0, shapeIndex).replace(/_/g, ' ');
            } else {
              metalType = remaining.replace(/_/g, ' ');
            }
            break;
          }
        }

        if (metalType && shape && viewAngle && metalImagesFiles[fieldname].length > 0) {
          // Single image per view angle
          const imageFile = metalImagesFiles[fieldname][0];
          const imagePath = "/uploads/" + imageFile.filename;
          req.body.metal_images.push({
            metal_type: metalType,
            shape: shape,
            view_angle: viewAngle,
            image: imagePath
          });
        }
      });
    } else if (req.body.metal_images === undefined) {
      // Keep existing metal_images if not provided
      req.body.metal_images = product.metal_images || [];
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

    // Convert engraving_allowed string to boolean (FormData sends strings)
    if (req.body.engraving_allowed !== undefined) {
      req.body.engraving_allowed = req.body.engraving_allowed === 'true' || req.body.engraving_allowed === true;
    }

    // Convert gift string to boolean (FormData sends strings)
    if (req.body.gift !== undefined) {
      req.body.gift = req.body.gift === 'true' || req.body.gift === true;
    }

    Object.assign(product, req.body);
    await product.save();
    await product.populate([
      'categoryId',
      'subCategoryId',
      'subSubCategoryId',
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

// Import Ring Products from CSV
module.exports.importRingProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error("CSV file is required");
    }

    const csvFile = req.file;
    const results = [];
    const errors = [];

    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFile.path)
        .pipe(csv())
        .on('data', (row) => {
          results.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      throw new Error("CSV file is empty");
    }

    const createdProducts = [];
    const skippedProducts = [];

    // Process each row
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

      try {
        // Extract and validate required fields
        const productName = row['product_name'] || row['Product Name'] || '';
        const productId = row['product_id'] || row['Product ID'] || '';
        const description = row['description'] || row['Description'] || '';
        const categoryId = row['categoryId'] || row['Category ID'] || '';
        const subCategoryIds = (row['subCategoryId'] || row['Sub Category ID'] || '').split(',').map(id => id.trim()).filter(id => id);
        const subSubCategoryIds = (row['subSubCategoryId'] || row['Sub SubCategory ID'] || '').split(',').map(id => id.trim()).filter(id => id);
        
        // Diamond Origin (Stone Type)
        const diamondOrigin = (row['diamond_origin'] || row['Diamond Origin'] || row['Stone Type'] || '').toLowerCase();
        if (!diamondOrigin || (diamondOrigin !== 'natural' && diamondOrigin !== 'lab grown' && diamondOrigin !== 'lab-grown')) {
          errors.push(`Row ${rowNumber}: Invalid or missing diamond_origin. Must be 'natural' or 'lab grown'`);
          continue;
        }
        const normalizedDiamondOrigin = diamondOrigin === 'lab-grown' || diamondOrigin === 'lab grown' ? 'Lab Grown' : 'Natural';

        // Carat Weights (comma-separated)
        const caratWeightsStr = row['carat_weight'] || row['Carat Weight'] || '';
        const caratWeights = caratWeightsStr.split(',').map(w => w.trim()).filter(w => w);
        if (caratWeights.length === 0) {
          errors.push(`Row ${rowNumber}: At least one carat_weight is required`);
          continue;
        }

        // Metal Colors (comma-separated: Rose Gold, Yellow Gold, White Gold, Platinum)
        const metalColorsStr = row['metal_color'] || row['Metal Color'] || '';
        const metalColors = metalColorsStr.split(',').map(c => c.trim()).filter(c => c);
        if (metalColors.length === 0) {
          errors.push(`Row ${rowNumber}: At least one metal_color is required`);
          continue;
        }

        // Metal Karats (comma-separated: 14K, 18K) - not required for Platinum
        const metalKaratsStr = row['karat'] || row['Karat'] || '';
        const metalKarats = metalKaratsStr.split(',').map(k => k.trim()).filter(k => k);
        const hasNonPlatinum = metalColors.some(c => c.toLowerCase() !== 'platinum');
        if (hasNonPlatinum && metalKarats.length === 0) {
          errors.push(`Row ${rowNumber}: At least one karat is required when metal_color is not Platinum`);
          continue;
        }

        // Shapes (comma-separated: Oval, Circle, Round, Heart)
        const shapesStr = row['shape'] || row['Shape'] || '';
        const shapes = shapesStr.split(',').map(s => s.trim()).filter(s => s);
        if (shapes.length === 0) {
          errors.push(`Row ${rowNumber}: At least one shape is required`);
          continue;
        }

        // Diamond Qualities (comma-separated)
        const diamondQualitiesStr = row['diamond_quality'] || row['Diamond Quality'] || '';
        const diamondQualities = diamondQualitiesStr.split(',').map(q => q.trim()).filter(q => q);
        if (diamondQualities.length === 0) {
          errors.push(`Row ${rowNumber}: At least one diamond_quality is required`);
          continue;
        }

        // Generate metal types (combinations of color + karat, except Platinum)
        const metalTypes = [];
        metalColors.forEach(color => {
          if (color.toLowerCase() === 'platinum') {
            metalTypes.push('Platinum');
          } else {
            metalKarats.forEach(karat => {
              metalTypes.push(`${karat} ${color}`);
            });
          }
        });

        // Generate variants: Stone Type × Carat × Metal Type × Diamond Quality × Shape
        const variants = [];
        caratWeights.forEach(carat => {
          metalTypes.forEach(metalType => {
            diamondQualities.forEach(quality => {
              shapes.forEach(shape => {
                // Get price and discounted_price from CSV or use defaults
                const price = parseFloat(row[`price_${carat}_${metalType.replace(/\s+/g, '_')}_${quality.replace(/\s+/g, '_')}_${shape}`]) || 
                              parseFloat(row['price']) || 0;
                const discountedPrice = parseFloat(row[`discounted_price_${carat}_${metalType.replace(/\s+/g, '_')}_${quality.replace(/\s+/g, '_')}_${shape}`]) || 
                                        parseFloat(row['discounted_price']) || 0;

                variants.push({
                  diamond_type: normalizedDiamondOrigin,
                  carat_weight: `${carat}ct`,
                  metal_type: metalType,
                  diamond_quality: quality,
                  shape: shape,
                  price: price,
                  discounted_price: discountedPrice,
                });
              });
            });
          });
        });

        if (variants.length === 0) {
          errors.push(`Row ${rowNumber}: No variants generated`);
          continue;
        }

        // Check if product_id already exists
        let finalProductId = productId.trim() || `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const existingProduct = await Model.Product.findOne({
          product_id: finalProductId,
          isDeleted: false
        });

        if (existingProduct) {
          skippedProducts.push({ row: rowNumber, productId: finalProductId, reason: 'Product ID already exists' });
          continue;
        }

        // Prepare product data
        const productData = {
          product_id: finalProductId,
          product_name: productName.trim() || `Product ${finalProductId}`,
          description: description.trim() || '',
          categoryId: [categoryId],
          subCategoryId: subCategoryIds,
          subSubCategoryId: subSubCategoryIds,
          metal_type: metalTypes,
          shape: shapes,
          karat: metalKarats,
          diamond_origin: [normalizedDiamondOrigin],
          carat_weight: caratWeights.map(w => parseFloat(w)),
          diamond_quality: diamondQualities,
          variants: variants,
          status: (row['status'] || row['Status'] || 'active').toLowerCase() === 'active' ? 'Active' : 'Inactive',
          images: [], // Images ignored as per requirement
          videos: [],
          metal_images: [],
          engraving_allowed: (row['engraving'] || row['Engraving'] || 'false').toLowerCase() === 'true',
          gift: (row['gift'] || row['Gift'] || 'false').toLowerCase() === 'true',
          gender: (row['gender'] || row['Gender'] || 'Male').toLowerCase() === 'male' ? 'Male' : 'Female',
          productSpecials: row['product_specials'] || row['Product Specials'] || '',
          collections: row['collections'] || row['Collections'] || '',
          stone: (row['stone'] || row['Stone'] || '').split(',').map(s => s.trim()).filter(s => s),
          design_styles: (row['design_styles'] || row['Design Styles'] || '').split(',').map(s => s.trim()).filter(s => s),
          settingConfigurations: row['settingConfigurations'] || row['Setting Configurations'] || null,
          shankConfigurations: row['shankConfigurations'] || row['Shank Configurations'] || null,
          bandProfileShapes: row['bandProfileShapes'] || row['Band Profile Shapes'] || null,
          bandWidthCategories: row['bandWidthCategories'] || row['Band Width Categories'] || null,
          bandFits: row['bandFits'] || row['Band Fits'] || null,
          shankTreatments: (row['shankTreatments'] || row['Shank Treatments'] || '').split(',').map(id => id.trim()).filter(id => id),
          styles: (row['styles'] || row['Styles'] || '').split(',').map(id => id.trim()).filter(id => id),
          settingFeatures: (row['settingFeatures'] || row['Setting Features'] || '').split(',').map(id => id.trim()).filter(id => id),
          motifThemes: (row['motifThemes'] || row['Motif Themes'] || '').split(',').map(id => id.trim()).filter(id => id),
          ornamentDetails: (row['ornamentDetails'] || row['Ornament Details'] || '').split(',').map(id => id.trim()).filter(id => id),
          productDetailsConfiguration: {
            product_details: row['product_details'] || row['Product Details'] || '',
            average_width: row['average_width'] || row['Average Width'] || '',
            rhodium_plate: row['rhodium_plate'] || row['Rhodium Plate'] || 'Yes',
          },
        };

        // Validate required ObjectId fields
        if (!productData.settingConfigurations || !productData.shankConfigurations || 
            !productData.bandProfileShapes || !productData.bandWidthCategories || !productData.bandFits) {
          errors.push(`Row ${rowNumber}: Missing required configuration fields (settingConfigurations, shankConfigurations, bandProfileShapes, bandWidthCategories, bandFits)`);
          continue;
        }

        if (productData.shankTreatments.length === 0 || productData.styles.length === 0 || 
            productData.settingFeatures.length === 0 || productData.motifThemes.length === 0 || 
            productData.ornamentDetails.length === 0) {
          errors.push(`Row ${rowNumber}: Missing required multi-select fields (shankTreatments, styles, settingFeatures, motifThemes, ornamentDetails)`);
          continue;
        }

        // Create product
        const product = await Model.Product.create(productData);
        await product.populate([
          'categoryId',
          'subCategoryId',
          'subSubCategoryId',
          'settingConfigurations',
          'shankConfigurations',
          'bandProfileShapes',
          'bandWidthCategories',
          'bandFits',
          'shankTreatments',
          'styles',
          'settingFeatures',
          'motifThemes',
          'ornamentDetails'
        ]);

        createdProducts.push({
          product_id: product.product_id,
          product_name: product.product_name,
          variants_count: variants.length
        });

      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    if (fs.existsSync(csvFile.path)) {
      fs.unlinkSync(csvFile.path);
    }

    return res.success("CSV import completed", {
      total_rows: results.length,
      created: createdProducts.length,
      skipped: skippedProducts.length,
      errors: errors.length,
      created_products: createdProducts,
      skipped_products: skippedProducts,
      error_details: errors
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
}

