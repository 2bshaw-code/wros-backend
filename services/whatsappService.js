const Customer = require("../models/Customer");
const Message = require("../models/Message");

const normalizePhone = (value = "") => {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
};

const ensureCustomer = async (phone) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw new Error("Missing customer phone number");
  }

  let customer = await Customer.findOne({ phone: normalizedPhone });

  if (!customer) {
    customer = await Customer.create({
      name: `Customer ${normalizedPhone}`,
      email: `${normalizedPhone}@wros.local`,
      phone: normalizedPhone,
      city: "",
      address: "",
    });
  }

  return customer;
};

const saveIncomingMessage = async (payload) => {
  const entry = payload?.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (!message) {
    throw new Error("No WhatsApp message payload found");
  }

  const customerPhone = message?.from || message?.profile?.name;
  const customer = await ensureCustomer(customerPhone);
  const text = message?.text?.body || "";

  const savedMessage = await Message.create({
    customerId: customer._id,
    direction: "incoming",
    text,
    timestamp: new Date(),
  });

  return {
    customer,
    message: savedMessage,
    response: {
      customerId: customer._id.toString(),
      incoming: {
        from: customerPhone,
        text,
        timestamp: savedMessage.timestamp,
      },
      readyForReply: true,
    },
  };
};

const getCustomerMessages = async (customerId) => {
  return await Message.find({ customerId }).sort({ timestamp: 1 });
};

module.exports = {
  saveIncomingMessage,
  getCustomerMessages,
  ensureCustomer,
};
