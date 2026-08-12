const stripeLib = require("stripe");
const Business = require("../models/Business");

const STRIPE_KEY = process.env.STRIPE_KEY || "";
const stripe = STRIPE_KEY ? stripeLib(STRIPE_KEY) : null;

const createStripeCustomer = async ({ email, name }) => {
  if (!stripe) {
    return {
      id: "mock_customer_id",
      mock: true,
      message: "Stripe not configured. Using mock billing mode.",
    };
  }

  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer;
};

const createSubscription = async ({ customerId, plan = "starter", price = 2000 }) => {
  if (!stripe) {
    return {
      id: "mock_subscription_id",
      status: "trialing",
      mock: true,
      message: "Stripe not configured. Using mock billing mode.",
    };
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price_data: { currency: "usd", unit_amount: price, recurring: { interval: "month" }, product_data: { name: plan } } }],
    expand: ["latest_invoice.payment_intent"],
  });

  return subscription;
};

const updateBusinessBilling = async ({ businessId, stripeCustomerId, plan, status }) => {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  if (stripeCustomerId) business.stripeCustomerId = stripeCustomerId;
  if (plan) business.subscriptionPlan = plan;
  if (status) business.subscriptionStatus = status;

  await business.save();
  return business;
};

const handleWebhookEvent = async (payload, signature) => {
  if (!stripe) {
    return {
      received: true,
      mock: true,
      message: "Stripe webhook ignored because Stripe is not configured.",
    };
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (error) {
    throw new Error(`Webhook verification failed: ${error.message}`);
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const business = await Business.findOne({ stripeCustomerId: customerId });

    if (business) {
      business.subscriptionStatus = subscription.status;
      business.subscriptionPlan = subscription.items?.data?.[0]?.price?.nickname || business.subscriptionPlan;
      await business.save();
    }
  }

  return { received: true, type: event.type };
};

module.exports = {
  createStripeCustomer,
  createSubscription,
  updateBusinessBilling,
  handleWebhookEvent,
};
