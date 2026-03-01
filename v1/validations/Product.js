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
  product_id: Joi.string().optional().allow(''),
  product_name: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional().allow(''),
  average_rating: Joi.number().min(0).max(5).optional(),
  review_count: Joi.number().integer().min(0).optional(),
  original_price: Joi.number().greater(0).optional(),
  //discounted_price: Joi.number().greater(0).required(),
  discount_label: Joi.string().optional().allow(''),
  promotion_label: Joi.string().optional().allow(''),
  promotion_end_date: Joi.date().optional(),
  metal_type: Joi.alternatives().try(
    Joi.array().items(Joi.string()).min(1),
    Joi.string()
  ).optional().allow(''),
  shape: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  karat: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  metal_code: Joi.string().optional().allow(''),
  metal_price: Joi.number().greater(0).optional(),
  viewAngle: Joi.string().valid("Angled view", "Top view", "Side view", "Image 1", "Image 2", "Image 3").optional().allow(''),
  metal_images: Joi.array().items(
    Joi.object({
      metal_type: Joi.string().required(),
      view_angle: Joi.string().valid("Angled view", "Top view", "Side view", "Image 1", "Image 2", "Image 3").required(),
      image: Joi.string().required()
    })
  ).optional(),
  diamond_origin: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  carat_weight: Joi.alternatives().try(
    Joi.array().items(Joi.number().greater(0)),
    Joi.number().greater(0)
  ).optional(),
  carat_min_weights: Joi.alternatives().try(
    Joi.object().pattern(Joi.string(), Joi.string()),
    Joi.string()
  ).optional().allow(''),
  diamond_quality: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  diamond_color_grade: Joi.string().optional().allow(''),
  diamond_clarity_grade: Joi.string().optional().allow(''),
  ring_size: Joi.alternatives().try(
    Joi.array().items(Joi.number().min(3).max(10)),
    Joi.number().min(3).max(10)
  ).optional(),
  necklace_size: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  engraving_text: Joi.string().optional().allow(''),
  engraving_allowed: Joi.boolean().optional(),
  gift: Joi.boolean().optional(),
  back_type: Joi.string().valid("Push Back", "Screw Back", "Guardian Back").optional().allow(''),
  matching_band_available: Joi.boolean().optional(),
  matching_band_product_id: Joi.objectId().optional().allow(null),
  product_type: Joi.string().valid("Engagement Ring", "Earrings", "Pendant", "Bracelet").optional().allow(''),
  collection_name: Joi.string().optional().allow(''),
  collections: Joi.string().optional().allow('').default(''),
  productSpecials: Joi.string().optional().allow('').default(''),
  design_styles: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  gender: Joi.string().valid("Male", "Female").optional().default("Male"),
  categoryId: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1).max(1),
    Joi.objectId()
  ).required(),
  subCategoryId: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()),
    Joi.objectId()
  ).optional().allow(null, ''),
  subSubCategoryId: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()),
    Joi.objectId()
  ).optional().allow(null, ''),
  product_details: Joi.string().optional().allow(''),
  average_width: Joi.string().optional().allow(''),
  average_length: Joi.string().optional().allow(''),
  rhodium_plate: Joi.string().valid('Yes', 'No').optional().allow(''),
  productDetailsConfiguration: Joi.object({
    product_details: Joi.string().optional().allow('').default(''),
    average_width: Joi.string().optional().allow('').default(''),
    average_length: Joi.string().optional().allow('').default(''),
    rhodium_plate: Joi.string().valid('Yes', 'No').optional().default('Yes')
  }).optional(),
  centerStoneDetailsConfiguration: Joi.array().items(
    Joi.object({
      stone: Joi.string().valid('Diamond', 'Color Diamond', 'Gemstone').required(),
      diamond_origin: Joi.string().optional().allow(''),
      diamond_shapes: Joi.array().items(Joi.string()).optional().default([]),
      min_diamond_weight: Joi.string().optional().allow(''),
      quantity: Joi.string().optional().allow(''),
      average_color: Joi.string().optional().allow(''),
      average_clarity: Joi.string().optional().allow(''),
      dimensions: Joi.string().optional().allow(''),
      gemstone_type: Joi.string().optional().allow(''),
      holding_methods: Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.objectId()
      ).optional().default([])
    })
  ).optional(),
  center_stone_details: Joi.string().optional().allow(''),
  center_stone_certified: Joi.string().valid('Yes', 'No').optional().default('No'),
  center_stone_shape: Joi.string().optional().allow(''),
  center_stone_min_weight: Joi.string().optional().allow(''),
  center_stone_color: Joi.string().optional().allow(''),
  center_stone_color_quality: Joi.string().optional().allow(''),
  center_stone_clarity: Joi.string().optional().allow(''),
  center_stone_diamond_quality: Joi.string().optional().allow(''),
  center_stone_quality_type: Joi.string().optional().allow(''),
  sideStoneDetailsConfiguration: Joi.array().items(
    Joi.object({
      stone: Joi.string().valid('Diamond', 'Color Diamond', 'Gemstone').required(),
      diamond_origin: Joi.string().optional().allow(''),
      diamond_shapes: Joi.array().items(Joi.string()).optional().default([]),
      min_diamond_weight: Joi.string().optional().allow(''),
      quantity: Joi.string().optional().allow(''),
      average_color: Joi.string().optional().allow(''),
      average_clarity: Joi.string().optional().allow(''),
      dimensions: Joi.string().optional().allow(''),
      gemstone_type: Joi.string().optional().allow(''),
      holding_methods: Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.objectId()
      ).optional().default([])
    })
  ).optional(),
  side_stone_details: Joi.string().optional().allow(''),
  stoneDetailsFormConfiguration: Joi.array().items(
    Joi.object({
      stone: Joi.string().valid('Diamond', 'Color Diamond', 'Gemstone').required(),
      certified: Joi.string().valid('Yes', 'No').optional().default('No'),
      color: Joi.string().optional().allow(''),
      diamond_origin: Joi.string().optional().allow(''),
      diamond_shapes: Joi.array().items(Joi.string()).optional().default([]),
      min_diamond_weight: Joi.string().optional().allow(''),
      quantity: Joi.string().optional().allow(''),
      average_color: Joi.string().optional().allow(''),
      average_clarity: Joi.string().optional().allow(''),
      dimensions: Joi.string().optional().allow(''),
      gemstone_type: Joi.string().optional().allow(''),
      holding_methods: Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.objectId()
      ).optional().default([])
    })
  ).optional(),
  stone_details: Joi.string().optional().allow(''),
  stone_details_certified: Joi.string().valid('Yes', 'No').optional().allow(''),
  stone_details_color: Joi.string().optional().allow(''),
  stone_details_stone: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  side_stone: Joi.alternatives().try(
    Joi.array().items(Joi.string().valid("Diamond", "Color Diamond", "Gemstone")),
    Joi.string().valid("Diamond", "Color Diamond", "Gemstone")
  ).optional(),
  stone: Joi.alternatives().try(
    Joi.array().items(Joi.string().valid("Diamond", "Color Diamond", "Gemstone", "None")),
    Joi.string().valid("Diamond", "Color Diamond", "Gemstone", "None")
  ).optional(),
  images: Joi.alternatives().try(
    Joi.array().items(Joi.string()).min(1),
    Joi.string()
  ).optional(),
  videos: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  status: Joi.string().optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  variants: Joi.array().items(
    Joi.object({
      diamond_type: Joi.string().required(),
      carat_weight: Joi.string().required(),       // "0.5ct"
      metal_type: Joi.string().required(),         // "15K White Gold"
      diamond_quality: Joi.string().optional().allow(''),
      shape: Joi.string().optional().allow(''),
      price: Joi.number().greater(0).required(),
      discounted_price: Joi.number().greater(0).required()
    })
  ).optional(),
  // Radio button fields (single ObjectId)
  settingConfigurations: Joi.objectId().required(),
  holdingMethods: Joi.objectId().optional(),
  styleSubCategory: Joi.objectId().optional().allow(''),
  flexibilityType: Joi.objectId().optional().allow(''),
  chainLinkypes: Joi.objectId().optional().allow(''),
  closureTypes: Joi.objectId().optional().allow(''),
  bandWidthCategories: Joi.objectId().required(),
  // Multi-select (array of ObjectIds)
  shankConfigurations: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).required(),
  bandProfileShapes: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).required(),
  bandFits: Joi.objectId().required(),
  // Multi-select dropdown fields (array of ObjectIds)
  shankTreatments: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).required(),
  styles: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).required(),
  settingFeatures: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).required(),
  motifThemes: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).required(),
  ornamentDetails: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).required(),
  stoneSettings: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()),
    Joi.objectId(),
    Joi.string().allow('')
  ).optional(),
  placementFits: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()),
    Joi.objectId(),
    Joi.string().allow('')
  ).optional(),
  sizeScale: Joi.string().optional().allow('')
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
  metal_type: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  shape: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  karat: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  metal_code: Joi.string().optional().allow(''),
  metal_price: Joi.number().greater(0).optional(),
  viewAngle: Joi.string().valid("Angled view", "Top view", "Side view", "Image 1", "Image 2", "Image 3").optional().allow(''),
  metal_images: Joi.array().items(
    Joi.object({
      metal_type: Joi.string().required(),
      shape: Joi.string().required(),
      view_angle: Joi.string().valid("Angled view", "Top view", "Side view", "Image 1", "Image 2", "Image 3").required(),
      image: Joi.string().required()
    })
  ).optional(),
  diamond_origin: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  carat_weight: Joi.alternatives().try(
    Joi.array().items(Joi.number().greater(0)),
    Joi.number().greater(0)
  ).optional(),
  carat_min_weights: Joi.alternatives().try(
    Joi.object().pattern(Joi.string(), Joi.string()),
    Joi.string()
  ).optional().allow(''),
  diamond_quality: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  diamond_color_grade: Joi.string().optional().allow(''),
  diamond_clarity_grade: Joi.string().optional().allow(''),
  ring_size: Joi.alternatives().try(
    Joi.array().items(Joi.number().min(3).max(10)),
    Joi.number().min(3).max(10)
  ).optional(),
  necklace_size: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  engraving_text: Joi.string().optional().allow(''),
  engraving_allowed: Joi.boolean().optional(),
  gift: Joi.boolean().optional(),
  back_type: Joi.string().valid("Push Back", "Screw Back", "Guardian Back").optional().allow(''),
  matching_band_available: Joi.boolean().optional(),
  matching_band_product_id: Joi.objectId().optional().allow(null),
  product_type: Joi.string().valid("Engagement Ring", "Earrings", "Pendant", "Bracelet").optional().allow(''),
  collection_name: Joi.string().optional().allow(''),
  collections: Joi.string().optional().allow('').default(''),
  productSpecials: Joi.string().optional().allow('').default(''),
  design_styles: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  gender: Joi.string().valid("Male", "Female").optional().default("Male"),
  categoryId: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).max(1),
    Joi.objectId()
  ).optional(),
  subCategoryId: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()),
    Joi.objectId()
  ).optional().allow(null, ''),
  subSubCategoryId: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()),
    Joi.objectId()
  ).optional().allow(null, ''),
  product_details: Joi.string().optional().allow(''),
  average_width: Joi.string().optional().allow(''),
  average_length: Joi.string().optional().allow(''),
  rhodium_plate: Joi.string().valid('Yes', 'No').optional().allow(''),
  productDetailsConfiguration: Joi.object({
    product_details: Joi.string().optional().allow('').default(''),
    average_width: Joi.string().optional().allow('').default(''),
    average_length: Joi.string().optional().allow('').default(''),
    rhodium_plate: Joi.string().valid('Yes', 'No').optional().default('Yes')
  }).optional(),
  centerStoneDetailsConfiguration: Joi.array().items(
    Joi.object({
      stone: Joi.string().valid('Diamond', 'Color Diamond', 'Gemstone').required(),
      diamond_origin: Joi.string().optional().allow(''),
      diamond_shapes: Joi.array().items(Joi.string()).optional().default([]),
      min_diamond_weight: Joi.string().optional().allow(''),
      quantity: Joi.string().optional().allow(''),
      average_color: Joi.string().optional().allow(''),
      average_clarity: Joi.string().optional().allow(''),
      dimensions: Joi.string().optional().allow(''),
      gemstone_type: Joi.string().optional().allow('')
    })
  ).optional(),
  center_stone_details: Joi.string().optional().allow(''),
  center_stone_certified: Joi.string().valid('Yes', 'No').optional().default('No'),
  center_stone_shape: Joi.string().optional().allow(''),
  center_stone_min_weight: Joi.string().optional().allow(''),
  center_stone_color: Joi.string().optional().allow(''),
  center_stone_color_quality: Joi.string().optional().allow(''),
  center_stone_clarity: Joi.string().optional().allow(''),
  center_stone_diamond_quality: Joi.string().optional().allow(''),
  center_stone_quality_type: Joi.string().optional().allow(''),
  sideStoneDetailsConfiguration: Joi.array().items(
    Joi.object({
      stone: Joi.string().valid('Diamond', 'Color Diamond', 'Gemstone').required(),
      diamond_origin: Joi.string().optional().allow(''),
      diamond_shapes: Joi.array().items(Joi.string()).optional().default([]),
      min_diamond_weight: Joi.string().optional().allow(''),
      quantity: Joi.string().optional().allow(''),
      average_color: Joi.string().optional().allow(''),
      average_clarity: Joi.string().optional().allow(''),
      dimensions: Joi.string().optional().allow(''),
      gemstone_type: Joi.string().optional().allow(''),
      holding_methods: Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.objectId()
      ).optional().default([])
    })
  ).optional(),
  side_stone_details: Joi.string().optional().allow(''),
  stoneDetailsFormConfiguration: Joi.array().items(
    Joi.object({
      stone: Joi.string().valid('Diamond', 'Color Diamond', 'Gemstone').required(),
      certified: Joi.string().valid('Yes', 'No').optional().default('No'),
      color: Joi.string().optional().allow(''),
      diamond_origin: Joi.string().optional().allow(''),
      diamond_shapes: Joi.array().items(Joi.string()).optional().default([]),
      min_diamond_weight: Joi.string().optional().allow(''),
      quantity: Joi.string().optional().allow(''),
      average_color: Joi.string().optional().allow(''),
      average_clarity: Joi.string().optional().allow(''),
      dimensions: Joi.string().optional().allow(''),
      gemstone_type: Joi.string().optional().allow(''),
      holding_methods: Joi.alternatives().try(
        Joi.array().items(Joi.objectId()),
        Joi.objectId()
      ).optional().default([])
    })
  ).optional(),
  stone_details: Joi.string().optional().allow(''),
  stone_details_certified: Joi.string().valid('Yes', 'No').optional().allow(''),
  stone_details_color: Joi.string().optional().allow(''),
  stone_details_stone: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow(''),
  stone: Joi.alternatives().try(
    Joi.array().items(Joi.string().valid("Diamond", "Color Diamond", "Gemstone", "None")),
    Joi.string().valid("Diamond", "Color Diamond", "Gemstone", "None")
  ).optional(),
  images: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  videos: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  status: Joi.string().optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  // Radio button fields (single ObjectId)
  settingConfigurations: Joi.objectId().optional(),
  holdingMethods: Joi.objectId().optional(),
  styleSubCategory: Joi.objectId().optional().allow(''),
  flexibilityType: Joi.objectId().optional().allow(''),
  chainLinkypes: Joi.objectId().optional().allow(''),
  closureTypes: Joi.objectId().optional().allow(''),
  bandWidthCategories: Joi.objectId().optional(),
  bandFits: Joi.objectId().optional(),
  // Multi-select (array of ObjectIds)
  shankConfigurations: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).optional(),
  bandProfileShapes: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).optional(),
  // Multi-select dropdown fields (array of ObjectIds)
  shankTreatments: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).optional(),
  styles: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).optional(),
  settingFeatures: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).optional(),
  motifThemes: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).optional(),
  ornamentDetails: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()).min(1),
    Joi.objectId()
  ).optional(),
  stoneSettings: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()),
    Joi.objectId(),
    Joi.string().allow('')
  ).optional(),
  placementFits: Joi.alternatives().try(
    Joi.array().items(Joi.objectId()),
    Joi.objectId(),
    Joi.string().allow('')
  ).optional(),
  sizeScale: Joi.string().optional().allow('')
});

