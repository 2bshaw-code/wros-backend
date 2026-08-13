const { sendSuccess, sendError } = require("../utils/response");
const {
  getSalesTrend,
  getTopProducts,
  getCustomerSegments,
  getInventoryMovement,
  getSummary,
} = require("../services/reportService");

const salesTrend = async (req, res) => {
  try {
    const data = await getSalesTrend(req.tenantId, req.query);
    sendSuccess(res, data, 200, { total: data.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const topProducts = async (req, res) => {
  try {
    const data = await getTopProducts(req.tenantId, req.query);
    sendSuccess(res, data, 200, { total: data.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const customerSegments = async (req, res) => {
  try {
    const data = await getCustomerSegments(req.tenantId);
    sendSuccess(res, data, 200, { total: data.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const inventoryMovement = async (req, res) => {
  try {
    const data = await getInventoryMovement(req.tenantId, req.query);
    sendSuccess(res, data, 200, { total: data.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const summary = async (req, res) => {
  try {
    const data = await getSummary(req.tenantId, req.query);
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  salesTrend,
  topProducts,
  customerSegments,
  inventoryMovement,
  summary,
};
