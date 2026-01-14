const Model = require("../../../models/index");
const Validation = require("../../validations");
const constants = require("../../../common/constants");
//nst stripe = require("../../../services/Stripe");

module.exports.checkout = async (req, res, next) => {
  try {
    await Validation.Customer.checkout.validateAsync(req.body);

    // Log card details if provided
   
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

    // Filter out items with null productId and map to order items
    const orderItems = cart.items
      .filter(item => item.productId && item.productId._id) // Filter out null productId
      .map(item => ({
        productId: item.productId._id,
        product_id: item.product_id || item.productId.product_id,
        productName: item.productId.product_name || 'Product',
        quantity: item.quantity,
        price: item.price,
        discountedPrice: item.discountedPrice,
        selectedVariant: item.selectedVariant,
        engraving_text: item.engraving_text
      }));

    // Check if we have valid items after filtering
    if (orderItems.length === 0) {
      throw new Error('Cart contains invalid items. Please refresh your cart.');
    }

    // Calculate subtotal from cart items if cart.subtotal is not available
    let subtotal = cart.subtotal;
    if (!subtotal || subtotal === 0) {
      subtotal = cart.items.reduce((sum, item) => {
        if (item.productId) {
          const price = item.discountedPrice || item.price || 0;
          return sum + (price * (item.quantity || 1));
        }
        return sum;
      }, 0);
    }

    const tax = req.body.tax || 0;
    const shipping = req.body.shipping || 0;
    const discount = req.body.discount || 0;
    const total = subtotal + tax + shipping - discount;

    // Ensure total is a valid number
    if (isNaN(total) || total <= 0) {
      throw new Error('Invalid order total. Please refresh your cart.');
    }

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
    if (req.body.cardNumber || req.body.expMonth || req.body.expYear || req.body.cvc) {
     
      let payload = {
        amount: Number(total) * 100,
        customerId:  "cus_TmlB9YodAyvoJs",  //stripeData,
        paymentMethodId: "pm_1SpBl4P434sLpaqhQXRBqneb"      //payment_method
      }
       //nst paymentIntent = await stripe.createPaymentIntent(payload);
      // const customerData = {
      //   email: req.customer.email,
      //   name: req.customer.name,
      // };
      // let stripeData = await stripe.createCustomer(customerData);
      // if (stripeData) {
      //   let stripCus = await stripe.createSetupIntent(stripeData);
      //   let payload = {
      //     cardNumber: req.body.cardNumber,
      //     expMonth: req.body.expMonth,
      //     expYear: req.body.expYear,
      //     cvc: req.body.cvc,
      //     setupIntentId: stripCus,
      //   }
      //   let payment_method = await stripe.confirmSetupIntent(payload);
      //   if (payment_method && payment_method != "You cannot confirm this SetupIntent because it has already succeeded.") {
      //     let payload = {
      //       amount: Number(total) * 100,
      //       customerId: stripeData,
      //       paymentMethodId: payment_method
      //     }
      //     const paymentIntent = await stripe.createPaymentIntent(payload);
      //     console.log('paymentIntent', paymentIntent);
      //     if (paymentIntent) {
      //       let saveData = await Model.PaymentMethod.create({
      //         customerId: req.user._id,
      //         email: customerData.email,
      //         stripeCustomerId: stripeData,
      //         setupIntentId: stripCus,
      //         stripePaymentMethodId: payment_method,
      //         cardBrand: payment_method.card.brand,
      //         cardNumber: payment_method.card.last4,
      //         expiryMonth: payment_method.card.exp_month,
      //         expiryYear: payment_method.card.exp_year,
      //         cardholderName: customerData.name,
      //         cardType: 'debit',
      //         amount: total,
      //         orderId: order._id
      //       })

      //     }
      //   }
      // }

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

