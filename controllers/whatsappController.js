const { sendSuccess, sendError } = require("../utils/response");
const config = require("../config");
const {
  saveIncomingMessage,
  getCustomerMessages,
  createTemplate,
  listTemplates,
  scheduleBroadcast,
  sendMessage,
} = require("../services/whatsappService");
const { generateReply } = require("../services/aiService");
const { RIDER_STATUS, updateDeliveryStatus } = require("../services/localDeliveryService");

const receiveIncomingMessage = async (req, res) => {
  try {
    const result = await saveIncomingMessage(req.body);
    sendSuccess(res, result.response, 200);
  } catch (error) {
    sendError(res, "Unable to process incoming WhatsApp message", 400, error.message);
  }
};

const getCustomerConversation = async (req, res) => {
  try {
    const messages = await getCustomerMessages(req.tenantId, req.params.customerId);
    sendSuccess(res, {
      customerId: req.params.customerId,
      messages: messages.map((msg) => ({
        id: msg._id,
        direction: msg.direction,
        text: msg.text,
        status: msg.status,
        timestamp: msg.timestamp,
      })),
      count: messages.length,
    });
  } catch (error) {
    sendError(res, "Unable to fetch conversation history", 500, error.message);
  }
};

const createTemplateHandler = async (req, res) => {
  try {
    const template = await createTemplate({ ...(req.body || {}), tenantId: req.tenantId });
    sendSuccess(res, template, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const listTemplatesHandler = async (req, res) => {
  try {
    const templates = await listTemplates(req.tenantId);
    sendSuccess(res, templates, 200, { total: templates.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const scheduleBroadcastHandler = async (req, res) => {
  try {
    const result = await scheduleBroadcast({ ...(req.body || {}), tenantId: req.tenantId });
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const sendMessageHandler = async (req, res) => {
  try {
    const message = await sendMessage({ ...(req.body || {}), tenantId: req.tenantId });
    sendSuccess(res, message, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const aiReplyHandler = async (req, res) => {
  try {
    const result = await generateReply({ ...(req.body || {}), tenantId: req.tenantId, operatorId: req.user?.id });
    sendSuccess(res, result, 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const riderStatusHandler = async (req, res) => {
  try {
    if (!config.LDM_ENABLED || !config.WHATSAPP_RIDER_MODE) {
      return sendError(res, "WhatsApp rider mode is disabled", 403);
    }
    const status = String(req.body?.status || "").toLowerCase();
    if (!RIDER_STATUS[status]) return sendError(res, "Unsupported rider quick-reply status", 400);
    const order = await updateDeliveryStatus({ orderId: req.body?.order_id, riderPhone: req.body?.rider_phone, status, detail: req.body?.detail });
    sendSuccess(res, { orderId: order._id, status: RIDER_STATUS[status] });
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  receiveIncomingMessage,
  getCustomerConversation,
  createTemplateHandler,
  listTemplatesHandler,
  scheduleBroadcastHandler,
  sendMessageHandler,
  aiReplyHandler,
  riderStatusHandler,
};
