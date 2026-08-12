const { sendSuccess, sendError } = require("../utils/response");
const {
  createStripeCustomer,
  createSubscription,
  handleWebhookEvent,
  updateBusinessBilling,
} = require("../services/billingService");

const createCustomer = async (req, res) => {
  try {
    const result = await createStripeCustomer(req.body || {});
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const createSubscriptionRoute = async (req, res) => {
  try {
    const result = await createSubscription(req.body || {});
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const webhook = async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers["stripe-signature"] || "";
    const result = await handleWebhookEvent(payload, signature);
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const updateBilling = async (req, res) => {
  try {
    const business = await updateBusinessBilling(req.body || {});
    sendSuccess(res, business, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  createCustomer,
  createSubscriptionRoute,
  webhook,
  updateBilling,
};
