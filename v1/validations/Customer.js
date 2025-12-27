const Joi = require("joi").defaults((schema) => {
  switch (schema.type) {
    case "string":
      return schema.replace(/\s+/, " ");
    default:
      return schema;
  }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

module.exports.signup = Joi.object({
  name: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(30).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  phone_number: Joi.string().optional().allow(''),
  image: Joi.string().optional().allow(''),
}).custom((value, helpers) => {
  // If name is not provided, firstName and lastName are required
  if (!value.name && (!value.firstName || !value.lastName)) {
    return helpers.error('any.custom', {
      message: 'Either name or both firstName and lastName are required'
    });
  }
  return value;
});

module.exports.login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports.addAddress = Joi.object({
  fullName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().optional().allow(''),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().required(),
  isDefault: Joi.boolean().optional(),
  addressType: Joi.string().valid('home', 'work', 'other').optional(),
});

module.exports.updateAddress = Joi.object({
  fullName: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
  addressLine1: Joi.string().optional(),
  addressLine2: Joi.string().optional().allow(''),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  postalCode: Joi.string().optional(),
  country: Joi.string().optional(),
  isDefault: Joi.boolean().optional(),
  addressType: Joi.string().valid('home', 'work', 'other').optional(),
});

module.exports.addToCart = Joi.object({
  productId: Joi.objectId().required(),
  quantity: Joi.number().min(1).required(),
  selectedVariant: Joi.object({
    diamond_type: Joi.string().optional(),
    carat_weight: Joi.string().optional(),
    metal_type: Joi.string().optional(),
    ring_size: Joi.number().optional(),
    necklace_size: Joi.string().optional(),
    back_type: Joi.string().optional(),
  }).optional(),
  engraving_text: Joi.string().optional().allow(''),
});

module.exports.updateCartItem = Joi.object({
  quantity: Joi.number().min(1).required(),
});

module.exports.checkout = Joi.object({
  addressId: Joi.objectId().required(),
  paymentMethod: Joi.string().valid('stripe', 'cash_on_delivery', 'bank_transfer').required(),
  shipping: Joi.number().min(0).optional(),
  tax: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  notes: Joi.string().optional().allow(''),
});

module.exports.createPaymentIntent = Joi.object({
  orderId: Joi.objectId().required(),
});

module.exports.confirmPayment = Joi.object({
  orderId: Joi.objectId().required(),
  paymentIntentId: Joi.string().required(),
});

