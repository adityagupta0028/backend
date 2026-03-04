const Joi = require("joi").defaults((schema) => {
  switch (schema.type) {
    case "string":
      return schema.replace(/\s+/, " ");
    default:
      return schema;
  }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

// Relaxed validation for create and update product.
// We accept any fields and let Mongoose/schema handle details.

module.exports.createProduct = Joi.object({}).unknown(true);

module.exports.updateProduct = Joi.object({}).unknown(true);

