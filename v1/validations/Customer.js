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

module.exports.syncCart = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.objectId().required(),
      product_id: Joi.string().optional(),
      quantity: Joi.number().min(1).optional().default(1),
      price: Joi.number().min(0).optional(),
      discountedPrice: Joi.number().min(0).optional().allow(null),
      selectedVariant: Joi.object({
        diamond_type: Joi.string().optional(),
        carat_weight: Joi.string().optional(),
        metal_type: Joi.string().optional(),
        ring_size: Joi.number().optional(),
        necklace_size: Joi.string().optional(),
        back_type: Joi.string().optional(),
      }).optional(),
      engraving_text: Joi.string().optional().allow(''),
    })
  ).required(),
});

module.exports.checkout = Joi.object({
  addressId: Joi.objectId().required(),
  paymentMethod: Joi.string().valid('stripe', 'cash_on_delivery', 'bank_transfer').required(),
  shipping: Joi.number().min(0).optional(),
  tax: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  notes: Joi.string().optional().allow(''),
  // Card details (optional, only for stripe payment method)
  cardNumber: Joi.string().optional().allow(''),
  expMonth: Joi.number().integer().min(1).max(12).optional(),
  expYear: Joi.number().integer().optional(),
  cvc: Joi.string().optional().allow(''),
});

module.exports.createPaymentIntent = Joi.object({
  orderId: Joi.objectId().required(),
});

module.exports.confirmPayment = Joi.object({
  orderId: Joi.objectId().required(),
  paymentIntentId: Joi.string().required(),
  saveCard: Joi.boolean().optional().default(false),
});

module.exports.savePaymentMethod = Joi.object({
  paymentIntentId: Joi.string().required(),
  saveCard: Joi.boolean().required(),
});

module.exports.setDefaultPaymentMethod = Joi.object({
  paymentMethodId: Joi.objectId().required(),
});

// New Stripe service validations
module.exports.createStripeCustomer = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required',
  }),
});

module.exports.createStripeSetupIntent = Joi.object({
  customerId: Joi.string().required().messages({
    'any.required': 'Customer ID is required',
  }),
});

module.exports.confirmStripeSetupIntent = Joi.object({
  setupIntentId: Joi.string().required().messages({
    'any.required': 'Setup Intent ID is required',
  }),
  cardNumber: Joi.string().required().messages({
    'any.required': 'Card number is required',
  }),
  expMonth: Joi.number().integer().min(1).max(12).required().messages({
    'number.base': 'Expiration month must be a number',
    'number.min': 'Expiration month must be between 1 and 12',
    'number.max': 'Expiration month must be between 1 and 12',
    'any.required': 'Expiration month is required',
  }),
  expYear: Joi.number().integer().min(new Date().getFullYear()).required().messages({
    'number.base': 'Expiration year must be a number',
    'number.min': 'Expiration year must be in the future',
    'any.required': 'Expiration year is required',
  }),
  cvc: Joi.string().required().messages({
    'any.required': 'CVC is required',
  }),
});

module.exports.createStripePaymentIntent = Joi.object({
  amount: Joi.number().min(1).required().messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount must be at least 1',
    'any.required': 'Amount is required',
  }),
  customerId: Joi.string().required().messages({
    'any.required': 'Customer ID is required',
  }),
  paymentMethodId: Joi.string().required().messages({
    'any.required': 'Payment Method ID is required',
  }),
});

