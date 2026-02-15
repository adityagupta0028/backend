const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const mongoose = require("mongoose");

module.exports.getProducts = async (req, res, next) => {
    try {
      // Get query parameters from both body and query (support both POST and GET)
      const params = req.body 
      let {
        categoryId,
        subcategoryId,
        metalType,
        ringSize,
        diamondOrigin,
        viewAngle,
        settingConfigurations,
        shankConfigurations,
        holdingMethods,
        bandProfileShapes,
        bandWidthCategories,
        bandFits,
        shankTreatments,
        styles,
        settingFeatures,
        motifThemes,
        ornamentDetails,
        accentStoneShapes,
        limit = 20,
        page = 1
      } = params;

     
      const pipeline = [];
      const matchStage = {
        isDeleted: false,
        status: "Active"
      };

      if (categoryId) {
        categoryId=categoryId=="69468b5a25a47dcbe1667e35"?["69468b5a25a47dcbe1667e35","696b71b08245c957c8788263","696b71d08245c957c878826d","696b72148245c957c8788293"]:categoryId;
        let categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
        matchStage.categoryId = { $in: categoryIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }
      if (subcategoryId) {
        const subcategoryIds = Array.isArray(subcategoryId) ? subcategoryId : [subcategoryId];
        matchStage.subCategoryId = { $in: subcategoryIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      if (metalType) {
        const metalTypes = Array.isArray(metalType) ? metalType : [metalType];
        matchStage.metal_type = { $in: metalTypes };
      }
      if (diamondOrigin) {
        const diamondOrigins = Array.isArray(diamondOrigin) ? diamondOrigin : [diamondOrigin];
        matchStage.diamond_origin = { $in: diamondOrigins };
      }

      if (ringSize) {
        const ringSizes = Array.isArray(ringSize) 
          ? ringSize.map(s => typeof s === 'string' ? parseFloat(s) : s)
          : [typeof ringSize === 'string' ? parseFloat(ringSize) : ringSize];
        matchStage.ring_size = { $in: ringSizes };
      }
      if (viewAngle) {
        matchStage.viewAngle = viewAngle;
      }

      // Filter by settingConfigurations (single ObjectId)
      if (settingConfigurations) {
        const settingIds = Array.isArray(settingConfigurations) ? settingConfigurations : [settingConfigurations];
        matchStage.settingConfigurations = { $in: settingIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by shankConfigurations (single ObjectId)
      if (shankConfigurations) {
        const shankIds = Array.isArray(shankConfigurations) ? shankConfigurations : [shankConfigurations];
        matchStage.shankConfigurations = { $in: shankIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by holdingMethods (single ObjectId)
      if (holdingMethods) {
        const holdingIds = Array.isArray(holdingMethods) ? holdingMethods : [holdingMethods];
        matchStage.holdingMethods = { $in: holdingIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by bandProfileShapes (single ObjectId)
      if (bandProfileShapes) {
        const bandProfileIds = Array.isArray(bandProfileShapes) ? bandProfileShapes : [bandProfileShapes];
        matchStage.bandProfileShapes = { $in: bandProfileIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by bandWidthCategories (single ObjectId)
      if (bandWidthCategories) {
        const bandWidthIds = Array.isArray(bandWidthCategories) ? bandWidthCategories : [bandWidthCategories];
        matchStage.bandWidthCategories = { $in: bandWidthIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by bandFits (single ObjectId)
      if (bandFits) {
        const bandFitIds = Array.isArray(bandFits) ? bandFits : [bandFits];
        matchStage.bandFits = { $in: bandFitIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
        console.log('Filtering by bandFits:', matchStage.bandFits);
      }

      // Filter by shankTreatments (array field - check if any matches)
      if (shankTreatments) {
        const shankTreatmentIds = Array.isArray(shankTreatments) ? shankTreatments : [shankTreatments];
        matchStage.shankTreatments = { $in: shankTreatmentIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by styles (array field - check if any matches)
      if (styles) {
        const styleIds = Array.isArray(styles) ? styles : [styles];
        matchStage.styles = { $in: styleIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by settingFeatures (array field - check if any matches)
      if (settingFeatures) {
        const settingFeatureIds = Array.isArray(settingFeatures) ? settingFeatures : [settingFeatures];
        matchStage.settingFeatures = { $in: settingFeatureIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by motifThemes (array field - check if any matches)
      if (motifThemes) {
        const motifThemeIds = Array.isArray(motifThemes) ? motifThemes : [motifThemes];
        matchStage.motifThemes = { $in: motifThemeIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by ornamentDetails (array field - check if any matches)
      if (ornamentDetails) {
        const ornamentDetailIds = Array.isArray(ornamentDetails) ? ornamentDetails : [ornamentDetails];
        matchStage.ornamentDetails = { $in: ornamentDetailIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by accentStoneShapes (array field - check if any matches)
      if (accentStoneShapes) {
        const accentStoneShapeIds = Array.isArray(accentStoneShapes) ? accentStoneShapes : [accentStoneShapes];
        matchStage.accentStoneShapes = { $in: accentStoneShapeIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Debug: Log the final match stage
      console.log('Final matchStage:', JSON.stringify(matchStage, null, 2));
      
      pipeline.push({ $match: matchStage });

      // Get total count early (before expensive operations) for pagination metadata
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);
      
      const countResult = await Model.Product.aggregate([
        { $match: matchStage },
        { $count: 'total' }
      ]);
      const total = countResult.length > 0 ? countResult[0].total : 0;

      // Stage 2: Lookup categories
      pipeline.push({
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categories'
        }
      });

      // Stage 3: Lookup subcategories
      pipeline.push({
        $lookup: {
          from: 'subcategories',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subcategories'
        }
      });

      // Stage 4: Filter out deleted categories and subcategories
      pipeline.push({
        $addFields: {
          categories: {
            $filter: {
              input: '$categories',
              as: 'cat',
              cond: { $eq: ['$$cat.isDeleted', false] }
            }
          },
          subcategories: {
            $filter: {
              input: '$subcategories',
              as: 'sub',
              cond: { $eq: ['$$sub.isDeleted', false] }
            }
          }
        }
      });

      // Stage 5: Sort by createdAt (newest first)
      pipeline.push({
        $sort: { createdAt: -1 }
      });

      // Stage 6: Apply pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });

      // Stage 7: Project only necessary fields (optimize response size)
      pipeline.push({
        $project: {
          product_id: 1,
          product_name: 1,
          description: 1,
          average_rating: 1,
          review_count: 1,
          original_price: 1,
          discounted_price: 1,
          discount_label: 1,
          promotion_label: 1,
          promotion_end_date: 1,
          metal_type: 1,
          metal_code: 1,
          metal_price: 1,
          diamond_origin: 1,
          carat_weight: 1,
          diamond_quality: 1,
          diamond_color_grade: 1,
          diamond_clarity_grade: 1,
          ring_size: 1,
          necklace_size: 1,
          engraving_text: 1,
          engraving_allowed: 1,
          back_type: 1,
          matching_band_available: 1,
          matching_band_product_id: 1,
          product_type: 1,
          collection_name: 1,
          images: 1,
          videos: 1,
          metal_images: 1,
          tags: 1,
          product_details: 1,
          center_stone_details: 1,
          side_stone_details: 1,
          stone_details: 1,
          variants: 1,
          categoryId: 1,
          subCategoryId: 1,
          viewAngle: 1,
          settingConfigurations: 1,
          shankConfigurations: 1,
          holdingMethods: 1,
          bandProfileShapes: 1,
          bandWidthCategories: 1,
          bandFits: 1,
          shankTreatments: 1,
          styles: 1,
          settingFeatures: 1,
          motifThemes: 1,
          ornamentDetails: 1,
          accentStoneShapes: 1,
          categories: {
            _id: 1,
            title: 1,
            categoryName: 1,
            image: 1
          },
          subcategories: {
            _id: 1,
            title: 1,
            subCategoryName: 1,
            image: 1,
            categoryId: 1
          },
          createdAt: 1,
          updatedAt: 1
        }
      });

      // Execute aggregation
      const products = await Model.Product.aggregate(pipeline);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return res.success(constants.MESSAGES.DATA_FETCHED, {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      });
    } catch (error) {
      console.log('error======>', error);
      next(error);
    }
  }

module.exports.getProductDetails = async (req, res, next) => {
  try {
    // Get productId from query params or body
    const { productId } = req.query || req.body || {};

    if (!productId) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Product ID is required"
      });
    }

    // Build aggregation pipeline
    const pipeline = [];

    // Stage 1: Match stage - Filter product by ID
    const matchStage = {
      isDeleted: false,
      status: "Active"
    };

    // Check if productId is a valid ObjectId (MongoDB _id) or product_id string
    if (mongoose.Types.ObjectId.isValid(productId)) {
      matchStage._id = new mongoose.Types.ObjectId(productId);
    } else {
      matchStage.product_id = productId;
    }

    pipeline.push({ $match: matchStage });

    // Stage 2: Lookup categories
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categories'
      }
    });

    // Stage 3: Lookup subcategories
    pipeline.push({
      $lookup: {
        from: 'subcategories',
        localField: 'subCategoryId',
        foreignField: '_id',
        as: 'subcategories'
      }
    });

    // Stage 4: Filter out deleted categories and subcategories
    pipeline.push({
      $addFields: {
        categories: {
          $filter: {
            input: '$categories',
            as: 'cat',
            cond: { $eq: ['$$cat.isDeleted', false] }
          }
        },
        subcategories: {
          $filter: {
            input: '$subcategories',
            as: 'sub',
            cond: { $eq: ['$$sub.isDeleted', false] }
          }
        }
      }
    });

    // Stage 5: Project all product fields with categories and subcategories
    pipeline.push({
      $project: {
        product_id: 1,
        product_name: 1,
        description: 1,
        average_rating: 1,
        review_count: 1,
        original_price: 1,
        discounted_price: 1,
        discount_label: 1,
        promotion_label: 1,
        promotion_end_date: 1,
        metal_type: 1,
        metal_code: 1,
        metal_price: 1,
        diamond_origin: 1,
        carat_weight: 1,
        diamond_quality: 1,
        diamond_color_grade: 1,
        diamond_clarity_grade: 1,
        ring_size: 1,
        necklace_size: 1,
        engraving_text: 1,
        engraving_allowed: 1,
        back_type: 1,
        matching_band_available: 1,
        matching_band_product_id: 1,
        product_type: 1,
        collection_name: 1,
        images: 1,
        videos: 1,
        metal_images: 1,
        tags: 1,
        product_details: 1,
        center_stone_details: 1,
        side_stone_details: 1,
        stone_details: 1,
        variants: 1,
        categoryId: 1,
        subCategoryId: 1,
        categories: {
          _id: 1,
          title: 1,
          categoryName: 1,
          image: 1
        },
        subcategories: {
          _id: 1,
          title: 1,
          subCategoryName: 1,
          image: 1,
          categoryId: 1
        },
        createdAt: 1,
        updatedAt: 1
      }
    });

    // Execute aggregation
    const products = await Model.Product.aggregate(pipeline);

    if (!products || products.length === 0) {
      return res.error(404, constants.MESSAGES.NOT_FOUND, {
        message: "Product not found"
      });
    }

    return res.success(constants.MESSAGES.DATA_FETCHED, {
      product: products[0]
    });
  } catch (error) {
    next(error);
  }
}


module.exports.getFilteredVisibility = async (req, res, next) => {
  try {
    // Get categoryId from query parameters
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Category ID is required"
      });
    }

    // Validate categoryId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Invalid Category ID"
      });
    }

    // Get all menu filter settings for the given categoryId
    const menuFilterSettings = await Model.MenuFilterSettings.find({
      categoryId: categoryId,
      menuName:"Side Menu"
    });

    // Map itemKey to corresponding Model
    const filterModelMap = {
      settingConfigurations: Model.SettingConfigurations,
      shankConfigurations: Model.ShankConfigurations,
      holdingMethods: Model.HoldingMethods,
      bandProfileShapes: Model.BandProfileShapes,
      bandWidthCategories: Model.BandWidthCategories,
      bandFits: Model.BandFits,
      shankTreatments: Model.ShankTreatments,
      styles: Model.Styles,
      settingFeatures: Model.SettingFeatures,
      motifThemes: Model.MotifThemes,
      ornamentDetails: Model.OrnamentDetails,
      accentStoneShapes: Model.AccentStoneShapes
    };

    // Fetch data for each menu filter setting
    const filtersData = await Promise.all(
      menuFilterSettings.map(async (filterSetting) => {
        const ModelClass = filterModelMap[filterSetting.itemKey];
        if (!ModelClass || !filterSetting.items || filterSetting.items.length === 0) {
          return {
            filterKey: filterSetting.itemKey,
            filterName: filterSetting.item,
            data: []
          };
        }

        // Fetch only the items specified in the items array (non-deleted)
        const data = await ModelClass.find({
          _id: { $in: filterSetting.items },
          isDeleted: false
        }).select('_id code displayName image createdAt updatedAt').sort({ createdAt: 1 });

        return {
          filterKey: filterSetting.itemKey,
          filterName: filterSetting.item,
          data: data
        };
      })
    );

    return res.success(constants.MESSAGES.DATA_FETCHED, {
      filters: filtersData
    });
  } catch (error) {
    next(error);
  }
}
module.exports.getFilteredMainMenu = async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Category ID is required"
      });
    }

    // Validate categoryId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.error(400, constants.MESSAGES.INVALID_INPUT, {
        message: "Invalid Category ID"
      });
    }

    // Get all menu filter settings for the given categoryId
    const menuFilterSettings = await Model.MenuFilterSettings.find({
      categoryId: categoryId,
      menuName: "Main Menu"
    });

    // Map itemKey to corresponding Model
    const filterModelMap = {
      settingConfigurations: Model.SettingConfigurations,
      shankConfigurations: Model.ShankConfigurations,
      holdingMethods: Model.HoldingMethods,
      bandProfileShapes: Model.BandProfileShapes,
      bandWidthCategories: Model.BandWidthCategories,
      bandFits: Model.BandFits,
      shankTreatments: Model.ShankTreatments,
      styles: Model.Styles,
      settingFeatures: Model.SettingFeatures,
      motifThemes: Model.MotifThemes,
      ornamentDetails: Model.OrnamentDetails,
      accentStoneShapes: Model.AccentStoneShapes
    };

    // Populate items for each menu filter setting and flatten into a single array
    const allItems = await Promise.all(
      menuFilterSettings.map(async (filterSetting) => {
        const ModelClass = filterModelMap[filterSetting.itemKey];
        let populatedItems = [];

        if (ModelClass && filterSetting.items && filterSetting.items.length > 0) {
          // Fetch the actual data for items (non-deleted)
          populatedItems = await ModelClass.find({
            _id: { $in: filterSetting.items },
            isDeleted: false
          }).select('_id code displayName image createdAt updatedAt').sort({ createdAt: 1 });
        }

        // Add itemKey to each item and return flat array
        return populatedItems.map(item => ({
          ...item.toObject(),
          itemKey: filterSetting.itemKey
        }));
      })
    );
    
    // Flatten the array of arrays into a single array
    const flattenedItems = allItems.flat();
    
    return res.success(constants.MESSAGES.DATA_FETCHED, flattenedItems);

  } catch (error) {
    next(error);
  }
}