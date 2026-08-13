const { sendSuccess, sendError } = require("../utils/response");
const {
  createStripeCustomer,
  createSubscription,
  handleWebhookEvent,
  updateBusinessBilling,
  generateInvoice,
  listInvoices,
  issueLicenseToken,
  verifyLicenseToken,
  listPlans,
} = require("../services/billingService");

const listPlansHandler = async (req, res) => {
  sendSuccess(res, listPlans(), 200);
};

const createCustomer = async (req, res) => {
  try {
    const result = await createStripeCustomer({ ...(req.body || {}), tenantId: req.tenantId });
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const createSubscriptionRoute = async (req, res) => {
  try {
    const result = await createSubscription({ ...(req.body || {}), tenantId: req.tenantId });
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const webhook = async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers["stripe-signature"] || "";
    const result = await handleWebhookEvent(req.rawBody || payload, signature);
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const updateBilling = async (req, res) => {
  try {
    const business = await updateBusinessBilling({ ...(req.body || {}), businessId: req.tenantId });
    sendSuccess(res, business, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const generateInvoiceHandler = async (req, res) => {
  try {
    const invoice = await generateInvoice({ ...(req.body || {}), businessId: req.tenantId });
    sendSuccess(res, invoice, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const listInvoicesHandler = async (req, res) => {
  try {
    const invoices = await listInvoices(req.tenantId);
    sendSuccess(res, invoices, 200, { total: invoices.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const issueLicenseHandler = async (req, res) => {
  try {
    const token = await issueLicenseToken(req.tenantId);
    sendSuccess(res, { licenseToken: token }, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const verifyLicenseHandler = async (req, res) => {
  try {
    const decoded = verifyLicenseToken(req.body.licenseToken);
    sendSuccess(res, decoded, 200);
  } catch (error) {
    sendError(res, error.message, 401);
  }
};

module.exports = {
  listPlansHandler,
  createCustomer,
  createSubscriptionRoute,
  webhook,
  updateBilling,
  generateInvoiceHandler,
  listInvoicesHandler,
  issueLicenseHandler,
  verifyLicenseHandler,
};
