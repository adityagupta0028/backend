const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");

module.exports.checkout = async (req, res, next) => {
  try {
    await Validation.Customer.checkout.validateAsync(req.body);
    
    let cart = await Model.Cart.findOne({
      customerId: req.customer._id,
      isDeleted: false
    }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    let address = await Model.Address.findOne({
      _id: req.body.addressId,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!address) {
      throw new Error('Address not found');
    }
    
    const orderNumber = Model.Order.generateOrderNumber();
    
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      product_id: item.product_id,
      productName: item.productId.product_name,
      quantity: item.quantity,
      price: item.price,
      discountedPrice: item.discountedPrice,
      selectedVariant: item.selectedVariant,
      engraving_text: item.engraving_text
    }));
    
    const subtotal = cart.subtotal;
    const tax = req.body.tax || 0;
    const shipping = req.body.shipping || 0;
    const discount = req.body.discount || 0;
    const total = subtotal + tax + shipping - discount;
    
    const order = await Model.Order.create({
      orderNumber,
      customerId: req.customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      },
      subtotal,
      tax,
      shipping,
      discount,
      total,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      orderStatus: 'pending',
      notes: req.body.notes || ''
    });
    
    if (req.body.paymentMethod !== 'cash_on_delivery') {
      cart.items = [];
      cart.subtotal = 0;
      cart.tax = 0;
      cart.shipping = 0;
      cart.total = 0;
      await cart.save();
    }
    
    return res.success(constants.MESSAGES.ORDER_CREATED, order);
  } catch (error) {
    next(error);
  }
};

module.exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {
      customerId: req.customer._id,
      isDeleted: false
    };
    
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }
    
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }
    
    const orders = await Model.Order.find(query)
      .populate('items.productId')
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

module.exports.getOrderById = async (req, res, next) => {
  try {
    let order = await Model.Order.findOne({
      _id: req.params.id,
      customerId: req.customer._id,
      isDeleted: false
    }).populate('items.productId');
    
    if (!order) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    return res.success(constants.MESSAGES.DATA_FETCHED, order);
  } catch (error) {
    next(error);
  }
};

module.exports.cancelOrder = async (req, res, next) => {
  try {
    let order = await Model.Order.findOne({
      _id: req.params.id,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!order) {
      throw new Error(constants.MESSAGES.NOT_FOUND);
    }
    
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      throw new Error('Cannot cancel order in current status');
    }
    
    order.orderStatus = 'cancelled';
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    await order.save();
    
    return res.success(constants.MESSAGES.CANCELLED_ORDER_ITEM, order);
  } catch (error) {
    next(error);
  }
};

