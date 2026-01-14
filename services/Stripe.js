require('dotenv').config();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.preview",
});

exports.createCustomer = async (payload) => {
  try {
    const customer = await stripe.customers.create({
        email: payload.email,
      });
      return customer.id;
  } catch (err) {
    console.log('❌ Error sending SMS:', err.response?.data || err.message);
  }
}

exports.createSetupIntent = async (customerId) => {
    try {
        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            automatic_payment_methods: {
              enabled: true,
              allow_redirects: "never",
            },
          });
          console.log("SetupIntent:", setupIntent);
          return setupIntent.id;
    } catch (err) {
      console.log('❌ Error sending SMS:', err.response?.data || err.message);
    }
  }

  exports.confirmSetupIntent = async (payload) => {
    try {
        const confirmed = await stripe.setupIntents.confirm(payload.setupIntentId, {
            payment_method_data: {
              type: "card",
              card: {
                number: payload.cardNumber,     //"4242424242424242",
                exp_month: payload.expMonth,       //12,
                exp_year: payload.expYear, //2030,
                cvc: payload.cvc  //"123",
              },
            },
          });
          console.log("Confirm SetupIntent:", confirmed);
          return confirmed.payment_method;
    } catch (err) {
        return err.response?.data || err.message;
      
    }
  }

  exports.createPaymentIntent = async (payload) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: payload.amount,//2000,
            currency: "usd",
            customer: payload.customerId,
            payment_method: payload.paymentMethodId,
            off_session: true,
            confirm: true,
          });
          console.log("PaymentIntent:", paymentIntent);
          return paymentIntent;
    } catch (err) {
      console.log('❌ Error sending SMS:', err.response?.data || err.message);
    }
  }