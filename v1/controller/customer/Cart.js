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
    // console.log("Add to cart request body:", req.body);

    const { productId, quantity, selectedVariant, engraving_text } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      throw new Error("Invalid request data");
    }

    // 1️⃣ Fetch product
    const product = await Model.Product.findById(productId);
    if (!product || product.isDeleted || product.status !== "Active") {
      throw new Error("Product not found or unavailable");
    }

    // 2️⃣ Match variant
    let matchedVariant = null;

    if (selectedVariant && product.variants?.length) {
      matchedVariant = product.variants.find(v =>
        v.metal_type === selectedVariant.metal_type &&
        parseFloat(v.carat_weight) === Number(selectedVariant.carat_weight)
      );
    }

    if (!matchedVariant) {
      throw new Error("Selected variant not available");
    }

    // 3️⃣ Get or create cart
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

    // 4️⃣ Check existing item (product + variant)
    const existingItemIndex = cart.items.findIndex(item =>
      item.productId.toString() === productId.toString() &&
      item.variantId?.toString() === matchedVariant._id.toString()
    );

    // 5️⃣ Add or update item
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        product_id: product.product_id,
        variantId: matchedVariant._id,
        quantity: quantity,
        price: matchedVariant.price,
        discountedPrice: matchedVariant.discounted_price || null,
        selectedVariant: selectedVariant,
        engraving_text: engraving_text || ""
      });
    }

    // 6️⃣ Recalculate totals
    cart.calculateTotals();
    await cart.save();

    return res.success(constants.MESSAGES.UPDATED_CART, cart);
  } catch (error) {
    next(error);
  }
};

// module.exports.addToCart = async (req, res, next) => {
//   try {
//    // await Validation.Customer.addToCart.validateAsync(req.body);

//     console.log("Add to cart request body:", req.body);
//     let product = await Model.Product.findById(req.body.productId);
//     if (!product || product.isDeleted || product.status !== 'Active') {
//       throw new Error('Product not found or unavailable');
//     }

//     let matchedVariant = null;

//     if (selectedVariant && product.variants?.length) {
//       matchedVariant = product.variants.find(v =>
//         v.metal_type === selectedVariant.metal_type &&
//         parseFloat(v.carat_weight) === Number(selectedVariant.carat_weight)
//       );
//     }
//     if (!matchedVariant) {
//       throw new Error("Selected variant not available");
//     }
    
//     let cart = await Model.Cart.findOne({
//       customerId: req.customer._id,
//       isDeleted: false
//     });
    
//     if (!cart) {
//       cart = await Model.Cart.create({
//         customerId: req.customer._id,
//         items: [],
//         subtotal: 0,
//         tax: 0,
//         shipping: 0,
//         total: 0
//       });
//     }
    
//     const price = product.discounted_price || product.original_price || 0;
//     const existingItemIndex = cart.items.findIndex(item =>
//       item.productId.toString() === productId.toString() &&
//       item.variantId?.toString() === matchedVariant._id.toString()
//     );
    
//     if (existingItemIndex > -1) {
//       cart.items[existingItemIndex].quantity += quantity;
//     } else {
//       console.log("product=====>",product)
//       cart.items.push({
//         productId: req.body.productId,
//         product_id: product.product_id,
//         quantity: req.body.quantity,
//         price: product.original_price || 0,
//         discountedPrice: product.discounted_price || null,
//         selectedVariant: req.body.selectedVariant || {},
//         engraving_text: req.body.engraving_text || ''
//       });
//     }
    
//     cart.calculateTotals();
//     await cart.save();
    
//     return res.success(constants.MESSAGES.UPDATED_CART, cart);
//   } catch (error) {
//     next(error);
//   }
// };

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

// Sync localStorage cart items to database after login
module.exports.syncCart = async (req, res, next) => {
  try {
   // await Validation.Customer.syncCart.validateAsync(req.body);
    const { items } = req.body;

    console.log("Syncing cart items:", items);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.success(constants.MESSAGES.SUCCESS, { 
        message: 'No items to sync',
        synced: 0 
      });
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

    let syncedCount = 0;
    const errors = [];

    // Sync each item from localStorage
    for (const localItem of items) {
      try {
        // Validate product exists
        const product = await Model.Product.findById(localItem.productId);
        if (!product || product.isDeleted || product.status !== 'Active') {
          errors.push(`Product ${localItem.productId} not found or unavailable`);
          continue;
        }

        // Check if item already exists with same variant
        const existingItemIndex = cart.items.findIndex(
          item => item.productId.toString() === localItem.productId.toString() &&
          JSON.stringify(item.selectedVariant || {}) === JSON.stringify(localItem.selectedVariant || {})
        );

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          cart.items[existingItemIndex].quantity += localItem.quantity || 1;
        } else {
          // Add new item
          cart.items.push({
            productId: localItem.productId,
            product_id: product.product_id || localItem.product_id || '',
            quantity: localItem.quantity || 1,
            price: product.original_price || localItem.price || 0,
            discountedPrice: product.discounted_price || localItem.discountedPrice || null,
            selectedVariant: localItem.selectedVariant || {},
            engraving_text: localItem.engraving_text || ''
          });
        }
        syncedCount++;
      } catch (error) {
        console.error(`Error syncing item ${localItem.productId}:`, error);
        errors.push(`Failed to sync item ${localItem.productId}: ${error.message}`);
      }
    }

    cart.calculateTotals();
    await cart.save();
    
    return res.success(constants.MESSAGES.UPDATED_CART, {
      cart,
      synced: syncedCount,
      total: items.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.log("Error syncing cart:", error);
    next(error);
  }
};

