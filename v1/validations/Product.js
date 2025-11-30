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
module.exports.createProduct = Joi.object({
  product_id: Joi.string().required(),
  product_name: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional().allow(''),
  average_rating: Joi.number().min(0).max(5).optional(),
  review_count: Joi.number().integer().min(0).optional(),
  original_price: Joi.number().greater(0).optional(),
  discounted_price: Joi.number().greater(0).required(),
  discount_label: Joi.string().optional().allow(''),
  promotion_label: Joi.string().optional().allow(''),
  promotion_end_date: Joi.date().optional(),
  metal_type: Joi.string().valid(
    "14K White Gold", "14K Yellow Gold", "14K Rose Gold",
    "18K White Gold", "18K Yellow Gold", "18K Rose Gold",
    "Platinum"
  ).required(),
  metal_code: Joi.string().optional().allow(''),
  metal_price: Joi.number().greater(0).optional(),
  diamond_origin: Joi.string().valid("Natural", "Lab Grown").required(),
  carat_weight: Joi.number().greater(0).optional(),
  diamond_quality: Joi.string().valid("Best - D, VVS", "Better - E, VS1", "Good - F, VS2").optional().allow(''),
  diamond_color_grade: Joi.string().optional().allow(''),
  diamond_clarity_grade: Joi.string().optional().allow(''),
  ring_size: Joi.number().min(3).max(10).required(),
  engraving_text: Joi.string().max(15).optional().allow(''),
  engraving_allowed: Joi.boolean().optional(),
  back_type: Joi.string().valid("Push Back", "Screw Back", "Guardian Back").optional().allow(''),
  matching_band_available: Joi.boolean().optional(),
  product_type: Joi.string().valid("Engagement Ring", "Earrings", "Pendant", "Bracelet").optional().allow(''),
  collection_name: Joi.string().optional().allow(''),
  categoryId: Joi.objectId().required(),
  subCategoryId: Joi.objectId().required(),
  images: Joi.alternatives().try(
    Joi.array().items(Joi.string()).min(1),
    Joi.string()
  ).optional(),
  videos: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  status: Joi.string().valid("Active", "Inactive", "Draft").optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional()
});

// Update Product
module.exports.updateProduct = Joi.object({
  product_id: Joi.string().optional(),
  product_name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().optional().allow(''),
  average_rating: Joi.number().min(0).max(5).optional(),
  review_count: Joi.number().integer().min(0).optional(),
  original_price: Joi.number().greater(0).optional(),
  discounted_price: Joi.number().greater(0).optional(),
  discount_label: Joi.string().optional().allow(''),
  promotion_label: Joi.string().optional().allow(''),
  promotion_end_date: Joi.date().optional(),
  metal_type: Joi.string().valid(
    "14K White Gold", "14K Yellow Gold", "14K Rose Gold",
    "18K White Gold", "18K Yellow Gold", "18K Rose Gold",
    "Platinum"
  ).optional(),
  metal_code: Joi.string().optional().allow(''),
  metal_price: Joi.number().greater(0).optional(),
  diamond_origin: Joi.string().valid("Natural", "Lab Grown").optional(),
  carat_weight: Joi.number().greater(0).optional(),
  diamond_quality: Joi.string().valid("Best - D, VVS", "Better - E, VS1", "Good - F, VS2").optional().allow(''),
  diamond_color_grade: Joi.string().optional().allow(''),
  diamond_clarity_grade: Joi.string().optional().allow(''),
  ring_size: Joi.number().min(3).max(10).optional(),
  engraving_text: Joi.string().max(15).optional().allow(''),
  engraving_allowed: Joi.boolean().optional(),
  back_type: Joi.string().valid("Push Back", "Screw Back", "Guardian Back").optional().allow(''),
  matching_band_available: Joi.boolean().optional(),
  product_type: Joi.string().valid("Engagement Ring", "Earrings", "Pendant", "Bracelet").optional().allow(''),
  collection_name: Joi.string().optional().allow(''),
  categoryId: Joi.objectId().optional(),
  subCategoryId: Joi.objectId().optional(),
  images: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  videos: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  status: Joi.string().valid("Active", "Inactive", "Draft").optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional()
});

