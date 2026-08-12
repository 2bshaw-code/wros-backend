const { sendSuccess, sendError } = require("../utils/response");
const { saveIncomingMessage, getCustomerMessages } = require("../services/whatsappService");

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
    const messages = await getCustomerMessages(req.params.customerId);
    sendSuccess(res, {
      customerId: req.params.customerId,
      messages: messages.map((msg) => ({
        id: msg._id,
        direction: msg.direction,
        text: msg.text,
        timestamp: msg.timestamp,
      })),
      count: messages.length,
    });
  } catch (error) {
    sendError(res, "Unable to fetch conversation history", 500, error.message);
  }
};

module.exports = {
  receiveIncomingMessage,
  getCustomerConversation,
};
