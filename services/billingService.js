const stripeLib = require("stripe");
const jwt = require("jsonwebtoken");
const Business = require("../models/Business");
const Invoice = require("../models/Invoice");
const config = require("../config");

const STRIPE_KEY = config.STRIPE_SECRET_KEY || "";
const stripe = STRIPE_KEY ? stripeLib(STRIPE_KEY) : null;

const PLAN_CATALOG = Object.freeze({
  starter: {
    id: "starter",
    name: "Starter",
    currency: "gbp",
    monthlyPriceCents: 1900,
    operatorLimit: 1,
    features: {
      bob_basic: true,
      routing_standard: true,
      console_standard: true,
      analytics_standard: true,
      customer_list: true,
      message_history: true,
      crm_basic_profile: true,
      orders_basic: true,
      invoices_basic: true,
      delivery_enabled: false,
      delivery_routing: false,
      delivery_operators: 0,
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    currency: "gbp",
    monthlyPriceCents: 4900,
    operatorLimit: 10,
    features: {
      bob_advanced: true,
      routing_multi: true,
      console_multi: true,
      analytics_priority: true,
      app_downloads: true,
      customer_list: true,
      message_history: true,
      crm_basic_profile: true,
      delivery_enabled: true,
      delivery_routing: true,
      delivery_operators: 5,
      delivery_zones: true,
      delivery_notifications: true,
      delivery_fees: true,
      crm_customer_profiles: true,
      crm_tags: true,
      crm_notes: true,
      crm_order_history: true,
      crm_delivery_timeline: true,
      crm_bob_insights: true,
      orders_full: true,
      delivery_assignment: true,
      delivery_timeline: true,
      invoices_send: true,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    currency: "gbp",
    monthlyPriceCents: 9900,
    operatorLimit: null,
    features: {
      bob_full: true,
      routing_multitenant: true,
      console_suite: true,
      analytics_full: true,
      support_dedicated: true,
      customer_list: true,
      message_history: true,
      crm_basic_profile: true,
      delivery_enabled: true,
      delivery_routing: "multi_tenant",
      delivery_operators: "unlimited",
      delivery_fleet_management: true,
      delivery_analytics: true,
      crm_segmentation: true,
      crm_campaigns: true,
      crm_customer_scoring: true,
      crm_multitenant: true,
      orders_multitenant: true,
      delivery_fleet_assignment: true,
      invoices_automated: true,
      invoices_multitenant: true,
    },
  },
});

const getPlan = (planId = "starter") => {
  const plan = PLAN_CATALOG[String(planId).toLowerCase()];
  if (!plan) {
    throw new Error(`Unsupported subscription plan: ${planId}`);
  }

  return plan;
};

const listPlans = () => Object.values(PLAN_CATALOG).map((plan) => ({
  ...plan,
  features: { ...plan.features },
}));

const createStripeCustomer = async ({ tenantId, email, name }) => {
  if (!stripe) {
    const mockCustomer = {
      id: "mock_customer_id",
      mock: true,
      message: "Stripe not configured. Using mock billing mode.",
    };
    await Business.findByIdAndUpdate(tenantId, { stripeCustomerId: mockCustomer.id });
    return mockCustomer;
  }

  const customer = await stripe.customers.create({
    email,
    name,
  });

  await Business.findByIdAndUpdate(tenantId, { stripeCustomerId: customer.id });

  return customer;
};

const createSubscription = async ({ tenantId, customerId, plan = "starter" }) => {
  const planDetails = getPlan(plan);
  if (stripe) {
    const business = await Business.findOne({ _id: tenantId, stripeCustomerId: customerId });
    if (!business) throw new Error("Stripe customer is not associated with the authenticated tenant");
  }

  if (!stripe) {
    return {
      id: "mock_subscription_id",
      status: "trialing",
      mock: true,
      plan: planDetails,
      message: "Stripe not configured. Using mock billing mode.",
    };
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    metadata: { wrosPlan: planDetails.id },
    items: [{
      price_data: {
        currency: planDetails.currency,
        unit_amount: planDetails.monthlyPriceCents,
        recurring: { interval: "month" },
        product_data: { name: `WROS ${planDetails.name}`, metadata: { wrosPlan: planDetails.id } },
      },
    }],
    expand: ["latest_invoice.payment_intent"],
  });

  return { ...subscription, plan: planDetails };
};

const updateBusinessBilling = async ({ businessId, stripeCustomerId, plan, status }) => {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  if (stripeCustomerId) business.stripeCustomerId = stripeCustomerId;
  if (plan) business.subscriptionPlan = getPlan(plan).id;
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

  const endpointSecret = config.STRIPE_WEBHOOK_SECRET;
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
      const planId = subscription.metadata?.wrosPlan || subscription.items?.data?.[0]?.price?.product?.metadata?.wrosPlan;
      if (planId && PLAN_CATALOG[planId]) business.subscriptionPlan = planId;
      await business.save();
    }
  }

  return { received: true, type: event.type };
};

const generateInvoice = async ({ businessId, period }) => {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  const planDetails = getPlan(business.subscriptionPlan);
  const subscriptionAmountCents = planDetails.monthlyPriceCents;
  const messageAmountCents = business.messageCount * business.messageRateCents;
  const totalCents = subscriptionAmountCents + messageAmountCents;

  const invoice = await Invoice.create({
    businessId,
    period,
    subscriptionAmountCents,
    currency: planDetails.currency,
    messageCount: business.messageCount,
    messageAmountCents,
    totalCents,
    status: "issued",
  });

  business.messageCount = 0;
  await business.save();

  return invoice;
};

const listInvoices = async (businessId) => {
  const query = businessId ? { businessId } : {};
  return await Invoice.find(query).sort({ createdAt: -1 });
};

const issueLicenseToken = async (businessId) => {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  const token = jwt.sign(
    { businessId: business._id.toString(), plan: getPlan(business.subscriptionPlan) },
    config.JWT_SECRET,
    { expiresIn: "365d" }
  );

  business.licenseToken = token;
  await business.save();
  return token;
};

const verifyLicenseToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired license token");
  }
};

module.exports = {
  getPlan,
  listPlans,
  createStripeCustomer,
  createSubscription,
  updateBusinessBilling,
  handleWebhookEvent,
  generateInvoice,
  listInvoices,
  issueLicenseToken,
  verifyLicenseToken,
};
