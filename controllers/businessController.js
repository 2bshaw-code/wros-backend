const { sendSuccess, sendError } = require("../utils/response");
const {
  registerBusiness,
  connectWhatsapp,
  getBusinessSettings,
  updateBusinessSettings,
} = require("../services/businessService");

const register = async (req, res) => {
  try {
    const business = await registerBusiness(req.body || {});
    sendSuccess(res, business, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const connectBusinessWhatsapp = async (req, res) => {
  try {
    const business = await connectWhatsapp(req.tenantId, req.body || {});
    sendSuccess(res, business, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getSettings = async (req, res) => {
  try {
    const business = await getBusinessSettings(req.tenantId);
    sendSuccess(res, business, 200);
  } catch (error) {
    sendError(res, error.message, 404);
  }
};

const updateSettings = async (req, res) => {
  try {
    const business = await updateBusinessSettings(req.tenantId, req.body || {});
    sendSuccess(res, business, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  register,
  connectBusinessWhatsapp,
  getSettings,
  updateSettings,
};
