const Joi = require("joi").defaults((schema) => {
  switch (schema.type) {
    case "string":
      return schema.replace(/\s+/, " ");
    default:
      return schema;
  }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

// Create/Update HeroMenu
module.exports.createHeroMenu = Joi.object({
  categoryId: Joi.objectId().required(),
  columns: Joi.array().items(
    Joi.object({
      columnIndex: Joi.number().integer().min(0).max(3).required(),
      headers: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          variables: Joi.object({
            settingConfigurations: Joi.array().items(Joi.objectId()).optional().default([]),
            shankConfigurations: Joi.array().items(Joi.objectId()).optional().default([]),
            holdingMethods: Joi.array().items(Joi.objectId()).optional().default([]),
            bandProfileShapes: Joi.array().items(Joi.objectId()).optional().default([]),
            bandWidthCategories: Joi.array().items(Joi.objectId()).optional().default([]),
            bandFits: Joi.array().items(Joi.objectId()).optional().default([]),
            shankTreatments: Joi.array().items(Joi.objectId()).optional().default([]),
            styles: Joi.array().items(Joi.objectId()).optional().default([]),
            settingFeatures: Joi.array().items(Joi.objectId()).optional().default([]),
            motifThemes: Joi.array().items(Joi.objectId()).optional().default([]),
            ornamentDetails: Joi.array().items(Joi.objectId()).optional().default([])
          }).optional().default({}),
          blogs: Joi.array().items(
            Joi.object({
              title: Joi.string().required(),
              link: Joi.string().required()
            })
          ).optional().default([])
        })
      ).optional().default([])
    })
  ).length(4).required()
});

module.exports.updateHeroMenu = Joi.object({
  categoryId: Joi.objectId().optional(),
  columns: Joi.array().items(
    Joi.object({
      columnIndex: Joi.number().integer().min(0).max(3).required(),
      headers: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          variables: Joi.object({
            settingConfigurations: Joi.array().items(Joi.objectId()).optional().default([]),
            shankConfigurations: Joi.array().items(Joi.objectId()).optional().default([]),
            holdingMethods: Joi.array().items(Joi.objectId()).optional().default([]),
            bandProfileShapes: Joi.array().items(Joi.objectId()).optional().default([]),
            bandWidthCategories: Joi.array().items(Joi.objectId()).optional().default([]),
            bandFits: Joi.array().items(Joi.objectId()).optional().default([]),
            shankTreatments: Joi.array().items(Joi.objectId()).optional().default([]),
            styles: Joi.array().items(Joi.objectId()).optional().default([]),
            settingFeatures: Joi.array().items(Joi.objectId()).optional().default([]),
            motifThemes: Joi.array().items(Joi.objectId()).optional().default([]),
            ornamentDetails: Joi.array().items(Joi.objectId()).optional().default([])
          }).optional().default({}),
          blogs: Joi.array().items(
            Joi.object({
              title: Joi.string().required(),
              link: Joi.string().required()
            })
          ).optional().default([])
        })
      ).optional().default([])
    })
  ).length(4).optional()
});

