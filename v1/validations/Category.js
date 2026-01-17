const Joi = require("joi").defaults((schema) => {
    switch (schema.type) {
      case "string":
        return schema.replace(/\s+/, " ");
      default:
        return schema;
    }
  });
  
  Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

// Create Category
module.exports.createCategory = Joi.object({
  title: Joi.string().required(),
  categoryName: Joi.string().required(),
  image: Joi.string().optional().allow(''),
});

// Update Category
module.exports.updateCategory = Joi.object({
  title: Joi.string().optional(),
  categoryName: Joi.string().optional(),
  image: Joi.string().optional().allow(''),
});

// Create SubCategory
module.exports.createSubCategory = Joi.object({
  categoryId: Joi.objectId().required(),
  title: Joi.string().required(),
  subCategoryName: Joi.string().required(),
  image: Joi.string().optional().allow(''),
});

// Update SubCategory
module.exports.updateSubCategory = Joi.object({
  categoryId: Joi.objectId().optional(),
  title: Joi.string().optional(),
  subCategoryName: Joi.string().optional(),
  image: Joi.string().optional().allow(''),
});

// Create SubSubCategory
module.exports.createSubSubCategory = Joi.object({
  subCategoryId: Joi.objectId().required(),
  title: Joi.string().required(),
  subSubCategoryName: Joi.string().required(),
  image: Joi.string().optional().allow(''),
});

// Update SubSubCategory
module.exports.updateSubSubCategory = Joi.object({
  subCategoryId: Joi.objectId().optional(),
  title: Joi.string().optional(),
  subSubCategoryName: Joi.string().optional(),
  image: Joi.string().optional().allow(''),
});

