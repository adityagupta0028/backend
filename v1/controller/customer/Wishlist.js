const Model = require("../../../models/index");
const constants = require("../../../common/constants");

module.exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Model.Wishlist.findOne({
      customerId: req.customer._id,
      isDeleted: false
    }).populate('items.productId');
    
    if (!wishlist) {
      wishlist = await Model.Wishlist.create({
        customerId: req.customer._id,
        items: []
      });
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, wishlist);
  } catch (error) {
    next(error);
  }
};

module.exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId, product_id, selectedVariant } = req.body;

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Fetch product to validate
    const product = await Model.Product.findById(productId);
    if (!product || product.isDeleted || product.status !== "Active") {
      throw new Error("Product not found or unavailable");
    }

    // Get or create wishlist
    let wishlist = await Model.Wishlist.findOne({
      customerId: req.customer._id,
      isDeleted: false
    });

    if (!wishlist) {
      wishlist = await Model.Wishlist.create({
        customerId: req.customer._id,
        items: []
      });
    }

    // Check if item already exists
    const existingItemIndex = wishlist.items.findIndex(item =>
      item.productId.toString() === productId.toString() &&
      JSON.stringify(item.selectedVariant || {}) === JSON.stringify(selectedVariant || {})
    );

    if (existingItemIndex > -1) {
      // Item already in wishlist
      return res.success(constants.MESSAGES.DATA_FETCHED, wishlist);
    }

    // Add new item
    wishlist.items.push({
      productId: product._id,
      product_id: product_id || product.product_id || '',
      selectedVariant: selectedVariant || {}
    });

    await wishlist.save();

    return res.success(constants.MESSAGES.DATA_FETCHED, wishlist);
  } catch (error) {
    next(error);
  }
};

module.exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Model.Wishlist.findOne({
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }
    
    // Remove item by productId
    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId.toString()
    );
    
    await wishlist.save();
    
    return res.success(constants.MESSAGES.DATA_FETCHED, wishlist);
  } catch (error) {
    next(error);
  }
};

module.exports.clearWishlist = async (req, res, next) => {
  try {
    let wishlist = await Model.Wishlist.findOne({
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!wishlist) {
      return res.success(constants.MESSAGES.SUCCESS, { message: 'Wishlist is already empty' });
    }
    
    wishlist.items = [];
    await wishlist.save();
    
    return res.success(constants.MESSAGES.SUCCESS, wishlist);
  } catch (error) {
    next(error);
  }
};

// Sync localStorage wishlist items to database after login
module.exports.syncWishlist = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.success(constants.MESSAGES.SUCCESS, { 
        message: 'No items to sync',
        synced: 0 
      });
    }

    let wishlist = await Model.Wishlist.findOne({
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!wishlist) {
      wishlist = await Model.Wishlist.create({
        customerId: req.customer._id,
        items: []
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
        const existingItemIndex = wishlist.items.findIndex(
          item => item.productId.toString() === localItem.productId.toString() &&
          JSON.stringify(item.selectedVariant || {}) === JSON.stringify(localItem.selectedVariant || {})
        );

        if (existingItemIndex === -1) {
          // Add new item
          wishlist.items.push({
            productId: localItem.productId,
            product_id: localItem.product_id || product.product_id || '',
            selectedVariant: localItem.selectedVariant || {}
          });
          syncedCount++;
        }
      } catch (error) {
        console.error(`Error syncing wishlist item ${localItem.productId}:`, error);
        errors.push(`Failed to sync item ${localItem.productId}: ${error.message}`);
      }
    }

    await wishlist.save();
    
    return res.success(constants.MESSAGES.DATA_FETCHED, {
      wishlist,
      synced: syncedCount,
      total: items.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.log("Error syncing wishlist:", error);
    next(error);
  }
};

