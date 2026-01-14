require('dotenv').config();
const Stripe = require("stripe");

// Lazy initialization - only create Stripe instance when needed
let stripe = null;

const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your .env file.');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.preview",
    });
  }
  return stripe;
};

exports.createCustomer = async (payload) => {
  try {
    const customer = await getStripe().customers.create({
        email: payload.email,
      });
      return customer.id;
  } catch (err) {
    console.log('❌ Error sending SMS:', err.response?.data || err.message);
  }
}

exports.createSetupIntent = async (customerId) => {
    try {
        const setupIntent = await getStripe().setupIntents.create({
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
        const confirmed = await getStripe().setupIntents.confirm(payload.setupIntentId, {
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
        const paymentIntent = await getStripe().paymentIntents.create({
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