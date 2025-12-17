const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
require('dotenv').config();

let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.warn('Stripe package not installed. Please run: npm install stripe');
  stripe = null;
}

module.exports.createPaymentIntent = async (req, res, next) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please install stripe package and set STRIPE_SECRET_KEY in environment variables.');
    }
    
    await Validation.Customer.createPaymentIntent.validateAsync(req.body);
    
    let order = await Model.Order.findOne({
      _id: req.body.orderId,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.paymentStatus === 'paid') {
      throw new Error('Order is already paid');
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: req.customer._id.toString()
      }
    });
    
    order.paymentIntentId = paymentIntent.id;
    await order.save();
    
    return res.success(constants.MESSAGES.SUCCESS, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      order: order
    });
  } catch (error) {
    next(error);
  }
};
module.exports.confirmPayment = async (req, res, next) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }
    
    await Validation.Customer.confirmPayment.validateAsync(req.body);
    
    let order = await Model.Order.findOne({
      _id: req.body.orderId,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.paymentStatus === 'paid') {
      return res.success('Payment already confirmed', order);
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(req.body.paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      await order.save();
      
      let cart = await Model.Cart.findOne({
        customerId: req.customer._id,
        isDeleted: false
      });
      
      if (cart) {
        cart.items = [];
        cart.subtotal = 0;
        cart.tax = 0;
        cart.shipping = 0;
        cart.total = 0;
        await cart.save();
      }
      
      return res.success('Payment confirmed successfully', order);
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      throw new Error('Payment failed');
    }
  } catch (error) {
    next(error);
  }
};
module.exports.getPaymentStatus = async (req, res, next) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }
    
    let order = await Model.Order.findOne({
      _id: req.params.orderId,
      customerId: req.customer._id,
      isDeleted: false
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (!order.paymentIntentId) {
      return res.success(constants.MESSAGES.DATA_FETCHED, {
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    
    return res.success(constants.MESSAGES.DATA_FETCHED, {
      paymentStatus: paymentIntent.status,
      orderPaymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  } catch (error) {
    next(error);
  }
};

