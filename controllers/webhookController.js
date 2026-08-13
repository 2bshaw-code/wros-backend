const crypto = require("crypto");
const { routeInboundMessage } = require("../services/conversationRouter");
const { persistInboundMessage } = require("../services/inboundMessageService");
const Business = require("../models/Business");
const config = require("../config");

const verifySignature = (req) => {
  if (!config.WHATSAPP_APP_SECRET) return true;
  const signature = req.headers["x-hub-signature-256"] || "";
  const expected = `sha256=${crypto.createHmac("sha256", config.WHATSAPP_APP_SECRET).update(req.rawBody || Buffer.from(JSON.stringify(req.body))).digest("hex")}`;
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

const resolveTenant = async (message) => {
  const business = await Business.findOne({ whatsappNumber: String(message.recipient || "").replace(/\D/g, "") });
  return business?._id || null;
};

const receiveWhatsAppWebhook = async (req, res) => {
  if (!verifySignature(req)) return res.status(403).send("Invalid webhook signature");
  try {
    const result = await routeInboundMessage({ provider: "whatsapp", payload: req.body, headers: req.headers, resolveTenant, handleMessage: persistInboundMessage });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

module.exports = { receiveWhatsAppWebhook };