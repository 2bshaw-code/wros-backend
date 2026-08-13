const { sendSuccess, sendError } = require("../utils/response");
const fs = require("fs");
const { getAudioUrl } = require("google-tts-api");
const {
  recognizeProduct,
  scanShelf,
  generateReply,
  createOrderFromMessage,
  translateText,
  getAnalyticsOverview,
  askBob,
} = require("../services/aiService");

const productRecognize = async (req, res) => {
  try {
    const result = await recognizeProduct({ tenantId: req.tenantId, image: req.file?.buffer?.toString("base64") || null, payload: req.body || {} });
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const shelfScan = async (req, res) => {
  try {
    const result = await scanShelf({ tenantId: req.tenantId, image: req.file?.buffer?.toString("base64") || null, payload: req.body || {} });
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const whatsappReply = async (req, res) => {
  try {
    const result = await generateReply({ ...(req.body || {}), tenantId: req.tenantId, operatorId: req.user.id });
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const orderCreate = async (req, res) => {
  try {
    const result = await createOrderFromMessage({ ...(req.body || {}), tenantId: req.tenantId, operatorId: req.user.id });
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
    const result = await getAnalyticsOverview(req.tenantId);
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const ask = async (req, res) => {
  try {
    const result = await askBob({ prompt: req.body?.prompt, userId: req.body?.userId || req.user?.id, tenantId: req.tenantId, operatorId: req.user.id });
    sendSuccess(res, { reply: result.reply, tenantId: req.tenantId, operatorId: req.user.id }, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const upload = async (req, res) => {
  try {
    const content = fs.readFileSync(req.file.path);
    const isPng = content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = content.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
    const isWebp = content.subarray(0, 4).toString() === "RIFF" && content.subarray(8, 12).toString() === "WEBP";
    if (!isPng && !isJpeg && !isWebp) {
      fs.unlinkSync(req.file.path);
      return sendError(res, "Uploaded file is not a valid image", 400);
    }

    const url = `/uploads/${req.file.filename}`;
    console.info("AI image upload", { userId: req.user.id, file: req.file.filename, mimeType: req.file.mimetype, size: req.file.size });
    res.status(201).json({ success: true, url });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const tts = async (req, res) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) return sendError(res, "Text is required", 400);
    if (text.length > 500) return sendError(res, "Text must be 500 characters or fewer", 400);

    const audioUrl = getAudioUrl(text, { lang: "en", slow: false, host: "https://translate.google.com" });
    sendSuccess(res, { audioUrl }, 200);
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
  ask,
  upload,
  tts,
};
