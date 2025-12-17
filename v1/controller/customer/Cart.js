const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");

module.exports.getCart = async (req, res, next) => {
  try {
    let cart = await Model.Cart.findOne({
      customerId: req.customer._id,
      isDeleted: false
    }).populate('items.productId');
    
    if (!cart) {
      cart = await Model.Cart.create({
        customerId: req.customer._id,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      });
    }
    
    cart.calculateTotals();
    await cart.save();
    
    return res.success(constants.MESSAGES.DATA_FETCHED, cart);
  } catch (error) {
    next(error);
  }
};

module.exports.addToCart = async (req, res, next) => {
  try {
    await Validation.Customer.addToCart.validateAsync(req.body);
    
    let product = await Model.Product.findById(req.body.productId);
    if (!product || product.isDeleted || product.status !== 'Active') {
      throw new Error('Product not found or unavailable');
    }
    
    let cart = await Model.Cart.findOne({
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!cart) {
      cart = await Model.Cart.create({
        customerId: req.customer._id,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      });
    }
    
    const price = product.discounted_price || product.original_price || 0;
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === req.body.productId.toString() &&
      JSON.stringify(item.selectedVariant || {}) === JSON.stringify(req.body.selectedVariant || {})
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += req.body.quantity;
    } else {
      cart.items.push({
        productId: req.body.productId,
        product_id: product.product_id,
        quantity: req.body.quantity,
        price: product.original_price || 0,
        discountedPrice: product.discounted_price || null,
        selectedVariant: req.body.selectedVariant || {},
        engraving_text: req.body.engraving_text || ''
      });
    }
    
    cart.calculateTotals();
    await cart.save();
    
    return res.success(constants.MESSAGES.UPDATED_CART, cart);
  } catch (error) {
    next(error);
  }
};

module.exports.updateCartItem = async (req, res, next) => {
  try {
    await Validation.Customer.updateCartItem.validateAsync(req.body);
    
    let cart = await Model.Cart.findOne({
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!cart) {
      throw new Error(constants.MESSAGES.CART_NOT_FOUND);
    }
    
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      throw new Error(constants.MESSAGES.CART_ITEM_NOT_FOUND);
    }
    
    item.quantity = req.body.quantity;
    cart.calculateTotals();
    await cart.save();
    
    return res.success(constants.MESSAGES.UPDATED_CART, cart);
  } catch (error) {
    next(error);
  }
};

module.exports.removeFromCart = async (req, res, next) => {
  try {
    let cart = await Model.Cart.findOne({
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!cart) {
      throw new Error(constants.MESSAGES.CART_NOT_FOUND);
    }
    
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      throw new Error(constants.MESSAGES.CART_ITEM_NOT_FOUND);
    }
    
    cart.items.pull(req.params.itemId);
    cart.calculateTotals();
    await cart.save();
    
    return res.success(constants.MESSAGES.REMOVED_ITEM_FROM_CART, cart);
  } catch (error) {
    next(error);
  }
};

module.exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Model.Cart.findOne({
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!cart) {
      return res.success(constants.MESSAGES.SUCCESS, { message: 'Cart is already empty' });
    }
    
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.total = 0;
    await cart.save();
    
    return res.success(constants.MESSAGES.SUCCESS, cart);
  } catch (error) {
    next(error);
  }
};

