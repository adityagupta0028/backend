const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
const StripeService = require("../../../services/Stripe");
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
      // Save payment method if user wants to save card
      let savedPaymentMethod = null;
      if (req.body.saveCard === true && paymentIntent.payment_method) {
        try {
          // Retrieve payment method details
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
          const card = paymentMethod.card;

          // Create or retrieve Stripe customer
          let stripeCustomerId = null;
          try {
            const customer = await stripe.customers.create({
              email: req.customer.email,
              name: req.customer.name,
              metadata: {
                customerId: req.customer._id.toString()
              }
            });
            stripeCustomerId = customer.id;
            await stripe.paymentMethods.attach(paymentMethod.id, {
              customer: stripeCustomerId,
            });
          } catch (error) {
            console.error('Error creating Stripe customer:', error);
          }

          // Check if payment method already exists
          let existingPaymentMethod = await Model.PaymentMethod.findOne({
            customerId: req.customer._id,
            stripePaymentMethodId: paymentMethod.id,
            isDeleted: false
          });

          if (!existingPaymentMethod) {
            // Check if this is the first payment method
            const existingMethods = await Model.PaymentMethod.countDocuments({
              customerId: req.customer._id,
              isDeleted: false
            });

            savedPaymentMethod = await Model.PaymentMethod.create({
              customerId: req.customer._id,
              stripePaymentMethodId: paymentMethod.id,
              stripeCustomerId: stripeCustomerId,
              cardBrand: card.brand,
              last4: card.last4,
              expiryMonth: card.exp_month,
              expiryYear: card.exp_year,
              cardholderName: paymentMethod.billing_details?.name || req.customer.name,
              cardType: card.funding || 'unknown',
              isDefault: existingMethods === 0,
              isActive: true,
              metadata: {
                paymentIntentId: req.body.paymentIntentId,
                orderId: order._id.toString(),
                savedAt: new Date()
              }
            });
          } else {
            // Update existing payment method
            existingPaymentMethod.isActive = true;
            existingPaymentMethod.cardBrand = card.brand;
            existingPaymentMethod.last4 = card.last4;
            existingPaymentMethod.expiryMonth = card.exp_month;
            existingPaymentMethod.expiryYear = card.exp_year;
            existingPaymentMethod.cardholderName = paymentMethod.billing_details?.name || req.customer.name;
            await existingPaymentMethod.save();
            savedPaymentMethod = existingPaymentMethod;
          }
        } catch (error) {
          console.error('Error saving payment method:', error);
          // Don't fail the payment if saving card fails
        }
      }
      
      return res.success('Payment confirmed successfully', {
        order,
        paymentMethod: savedPaymentMethod ? {
          _id: savedPaymentMethod._id,
          cardBrand: savedPaymentMethod.cardBrand,
          last4: savedPaymentMethod.last4,
          displayName: savedPaymentMethod.getDisplayName()
        } : null
      });
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

// New API endpoints for Stripe service functions
module.exports.createStripeCustomer = async (req, res, next) => {
  try {
    await Validation.Customer.createStripeCustomer.validateAsync(req.body);
    
    const customerId = await StripeService.createCustomer({
      email: req.body.email
    });
    
    if (!customerId) {
      throw new Error('Failed to create Stripe customer');
    }
    
    return res.success('Stripe customer created successfully', {
      customerId: customerId
    });
  } catch (error) {
    next(error);
  }
};

module.exports.createStripeSetupIntent = async (req, res, next) => {
  try {
    await Validation.Customer.createStripeSetupIntent.validateAsync(req.body);
    
    const setupIntentId = await StripeService.createSetupIntent(req.body.customerId);
    
    if (!setupIntentId) {
      throw new Error('Failed to create setup intent');
    }
    
    return res.success('Setup intent created successfully', {
      setupIntentId: setupIntentId
    });
  } catch (error) {
    next(error);
  }
};

module.exports.confirmStripeSetupIntent = async (req, res, next) => {
  try {
    await Validation.Customer.confirmStripeSetupIntent.validateAsync(req.body);
    
    const paymentMethod = await StripeService.confirmSetupIntent({
      setupIntentId: req.body.setupIntentId,
      cardNumber: req.body.cardNumber,
      expMonth: req.body.expMonth,
      expYear: req.body.expYear,
      cvc: req.body.cvc
    });
    
    if (typeof paymentMethod === 'string') {
      throw new Error(paymentMethod);
    }
    
    return res.success('Setup intent confirmed successfully', {
      paymentMethod: paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

module.exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    await Validation.Customer.createStripePaymentIntent.validateAsync(req.body);
    
    const paymentIntent = await StripeService.createPaymentIntent({
      amount: req.body.amount,
      customerId: req.body.customerId,
      paymentMethodId: req.body.paymentMethodId
    });
    
    if (!paymentIntent) {
      throw new Error('Failed to create payment intent');
    }
    
    return res.success('Payment intent created successfully', {
      paymentIntent: paymentIntent
    });
  } catch (error) {
    next(error);
  }
};

