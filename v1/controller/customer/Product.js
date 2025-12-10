const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const mongoose = require("mongoose");

module.exports.getProducts = async (req, res, next) => {
    try {
      // Get query parameters from both body and query (support both POST and GET)
      const params = req.body || req.query || {};
      const {
        categoryId,
        subcategoryId,
        metalType,
        ringSize,
        diamondOrigin,
        limit = 20,
        page = 1
      } = params;

      // Build aggregation pipeline
      const pipeline = [];

      // Stage 1: Match stage - Filter products
      const matchStage = {
        isDeleted: false,
        status: "Active"
      };

      // Filter by categoryId (support both single and array)
      if (categoryId) {
        const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
        matchStage.categoryId = { $in: categoryIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by subcategoryId (support both single and array)
      if (subcategoryId) {
        const subcategoryIds = Array.isArray(subcategoryId) ? subcategoryId : [subcategoryId];
        matchStage.subCategoryId = { $in: subcategoryIds.map(id => 
          mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
        )};
      }

      // Filter by metalType (array field - check if any matches)
      if (metalType) {
        const metalTypes = Array.isArray(metalType) ? metalType : [metalType];
        matchStage.metal_type = { $in: metalTypes };
      }

      // Filter by diamondOrigin (array field - check if any matches)
      if (diamondOrigin) {
        const diamondOrigins = Array.isArray(diamondOrigin) ? diamondOrigin : [diamondOrigin];
        matchStage.diamond_origin = { $in: diamondOrigins };
      }

      // Filter by ringSize (array field - check if any matches)
      if (ringSize) {
        const ringSizes = Array.isArray(ringSize) 
          ? ringSize.map(s => typeof s === 'string' ? parseFloat(s) : s)
          : [typeof ringSize === 'string' ? parseFloat(ringSize) : ringSize];
        matchStage.ring_size = { $in: ringSizes };
      }

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
      next(error);
    }
  }