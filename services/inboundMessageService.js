const Message = require("../models/Message");
const { ensureCustomer } = require("./whatsappService");

const persistInboundMessage = async ({ tenantId, message }) => {
  const customer = await ensureCustomer(tenantId, message.sender);
  const saved = await Message.create({
    tenantId,
    customerId: customer._id,
    direction: "incoming",
    text: message.text || "",
    timestamp: message.timestamp || new Date(),
  });

  return { tenantId, customerId: String(customer._id), messageId: String(saved._id), provider: message.provider };
};

module.exports = { persistInboundMessage };