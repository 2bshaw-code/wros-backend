const { sendSuccess, sendError } = require("../utils/response");
const {
  recognizeProduct,
  scanShelf,
  generateReply,
  createOrderFromMessage,
  translateText,
  getAnalyticsOverview,
} = require("../services/aiService");

const productRecognize = async (req, res) => {
  try {
    const result = await recognizeProduct({ image: req.file?.buffer?.toString("base64") || null, payload: req.body || {} });
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const shelfScan = async (req, res) => {
  try {
    const result = await scanShelf({ image: req.file?.buffer?.toString("base64") || null, payload: req.body || {} });
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const whatsappReply = async (req, res) => {
  try {
    const result = await generateReply(req.body || {});
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const orderCreate = async (req, res) => {
  try {
    const result = await createOrderFromMessage(req.body || {});
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const translate = async (req, res) => {
  try {
    const result = await translateText(req.body || {});
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const analyticsOverview = async (req, res) => {
  try {
    const result = await getAnalyticsOverview();
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  productRecognize,
  shelfScan,
  whatsappReply,
  orderCreate,
  translate,
  analyticsOverview,
};
