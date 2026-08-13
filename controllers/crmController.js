const { sendSuccess, sendError } = require("../utils/response");
const { getCustomerProfile, updateCustomerProfile, getSegments } = require("../services/crmService");

const requireMerchantPlan = (req) => {
  if (!req.user?.plan?.features) throw new Error("Merchant console plan is required");
  return req.user.plan;
};

const customerProfile = async (req, res) => {
  try {
    sendSuccess(res, await getCustomerProfile(req.tenantId, req.params.customerId, requireMerchantPlan(req)));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const updateProfile = async (req, res) => {
  try {
    sendSuccess(res, await updateCustomerProfile(req.tenantId, req.params.customerId, req.body || {}, requireMerchantPlan(req), req.user.id));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const segments = async (req, res) => {
  try {
    const items = await getSegments(req.tenantId, requireMerchantPlan(req));
    sendSuccess(res, items, 200, { total: items.length });
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

module.exports = { customerProfile, updateProfile, segments };