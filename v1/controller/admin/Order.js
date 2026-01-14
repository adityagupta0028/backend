const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");

// Get All Orders (Admin)
module.exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {
      isDeleted: false
    };

    // Filter by order status
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    // Search by order number or customer name
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Model.Order.find(query)
      .populate('items.productId')
      .populate('customerId', 'name email phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Model.Order.countDocuments(query);

    return res.success(constants.MESSAGES.DATA_FETCHED, {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Order By ID (Admin)
module.exports.getOrderById = async (req, res, next) => {
  try {
    let order = await Model.Order.findOne({
      _id: req.params.id,
      isDeleted: false
    })
      .populate('items.productId')
      .populate('customerId', 'name email phoneNumber');

    if (!order) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }

    return res.success(constants.MESSAGES.DATA_FETCHED, order);
  } catch (error) {
    next(error);
  }
};

// Update Order Status (Admin)
module.exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    let order = await Model.Order.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!order) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    return res.success(constants.MESSAGES.UPDATED_SUCCESSFULLY, order);
  } catch (error) {
    next(error);
  }
};

// Delete Order (Admin - Soft Delete)
module.exports.deleteOrder = async (req, res, next) => {
  try {
    let order = await Model.Order.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!order) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }

    order.isDeleted = true;
    await order.save();

    return res.success(constants.MESSAGES.DELETED_SUCCESSFULLY, order);
  } catch (error) {
    next(error);
  }
};

