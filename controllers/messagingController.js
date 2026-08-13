const Business = require("../models/Business");
const { routeInboundMessage } = require("../services/conversationRouter");
const { persistInboundMessage } = require("../services/inboundMessageService");
const { sendSuccess, sendError } = require("../utils/response");

const resolveTenant = async (message) => {
  const providerKey = `channelIdentifiers.${message.provider}`;
  const business = await Business.findOne({
    $or: [{ whatsappNumber: message.recipient }, { [providerKey]: message.recipient }],
  });
  return business?._id || null;
};

const receiveProviderMessage = async (req, res) => {
  try {
    const result = await routeInboundMessage({
      provider: req.params.provider,
      payload: req.body,
      headers: req.headers,
      resolveTenant,
      handleMessage: persistInboundMessage,
    });
    return sendSuccess(res, result, 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = { receiveProviderMessage };