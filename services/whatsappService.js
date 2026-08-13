const Customer = require("../models/Customer");
const Message = require("../models/Message");
const MessageTemplate = require("../models/MessageTemplate");
const Order = require("../models/Order");
const Business = require("../models/Business");
const config = require("../config");
const { registerProvider, send: sendThroughProvider } = require("./messagingEngine");

const normalizePhone = (value = "") => {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
};

const ensureCustomer = async (tenantId, phone) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw new Error("Missing customer phone number");
  }

  let customer = await Customer.findOne({ tenantId, phone: normalizedPhone });

  if (!customer) {
    customer = await Customer.create({
      tenantId,
      name: `Customer ${normalizedPhone}`,
      email: `${normalizedPhone}@wros.local`,
      phone: normalizedPhone,
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

  const merchantPhone = normalizePhone(change?.value?.metadata?.display_phone_number || "");
  const business = await Business.findOne({ whatsappNumber: merchantPhone });
  if (!business) throw new Error("No merchant tenant is mapped to this WhatsApp number");
  const tenantId = business._id.toString();
  const customerPhone = message?.from || message?.profile?.name;
  const customer = await ensureCustomer(tenantId, customerPhone);
  const text = message?.text?.body || "";

  const savedMessage = await Message.create({
    tenantId,
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
      tenantId,
      incoming: {
        from: customerPhone,
        text,
        timestamp: savedMessage.timestamp,
      },
      readyForReply: true,
    },
  };
};

const getCustomerMessages = async (tenantId, customerId) => {
  return await Message.find({ tenantId, customerId }).sort({ timestamp: 1 });
};

// --- WhatsApp Automation Engine ---

const createTemplate = async ({ tenantId, name, body, category = "general" }) => {
  if (!name || !body) {
    throw new Error("Template name and body are required");
  }

  return await MessageTemplate.create({ tenantId, name, body, category, isActive: true });
};

const listTemplates = async (tenantId) => {
  return await MessageTemplate.find({ tenantId, isActive: true }).sort({ createdAt: -1 });
};

const buildAiReply = ({ text = "", customerName = "Customer" }) => {
  const normalized = String(text).trim().toLowerCase();

  if (!normalized) {
    return { intent: "greeting", reply: `Hello ${customerName}! Thanks for contacting WROS.` };
  }

  if (normalized.includes("price") || normalized.includes("product") || normalized.includes("catalog")) {
    return { intent: "product_query", reply: `Hi ${customerName}, we can help with product pricing and catalog questions.` };
  }

  if (normalized.includes("order") || normalized.includes("buy") || normalized.includes("purchase")) {
    return { intent: "order_request", reply: `I can help with your order. Share the product and quantity and I’ll guide the next step.` };
  }

  if (normalized.includes("complaint") || normalized.includes("issue") || normalized.includes("problem")) {
    return { intent: "complaint", reply: `I’m sorry you’re having trouble. Please share the issue details and we’ll resolve it quickly.` };
  }

  return { intent: "greeting", reply: `Hello ${customerName}! Thanks for contacting WROS. We’re here to help.` };
};

// Same vip/loyal/regular/new heuristic as reportService.getCustomerSegments, but returns matching customers.
const getCustomersBySegment = async (tenantId, segment) => {
  const [customers, orders] = await Promise.all([Customer.find({ tenantId }), Order.find({ tenantId })]);

  const spendByCustomer = orders.reduce((acc, order) => {
    const key = String(order.customerId);
    acc[key] = (acc[key] || 0) + (order.total || 0);
    return acc;
  }, {});

  return customers.filter((customer) => {
    const spend = spendByCustomer[String(customer._id)] || 0;
    if (segment === "vip") return spend >= 1000;
    if (segment === "loyal") return spend >= 300 && spend < 1000;
    if (segment === "regular") return spend > 0 && spend < 300;
    if (segment === "new") return spend === 0;
    return false;
  });
};

const recordMessageBilling = async (tenantId, count) => {
  if (count <= 0) return null;
  const business = await Business.findById(tenantId);
  if (!business) return null;

  business.messageCount += count;
  await business.save();
  return business;
};

const getSegmentSummary = async (tenantId) => {
  const segments = ["vip", "loyal", "regular", "new"];
  const summary = {};

  for (const segment of segments) {
    const customers = await getCustomersBySegment(tenantId, segment);
    summary[segment] = customers.length;
  }

  return summary;
};

const scheduleBroadcast = async ({ tenantId, templateId, segment, scheduledAt }) => {
  const template = await MessageTemplate.findOne({ _id: templateId, tenantId });
  if (!template) {
    throw new Error("Message template not found");
  }

  const customers = await getCustomersBySegment(tenantId, segment);
  const broadcastId = `bc_${Date.now()}`;
  const sendTime = scheduledAt ? new Date(scheduledAt) : new Date();
  const isFuture = sendTime.getTime() > Date.now();

  const messages = await Message.insertMany(
    customers.map((customer) => ({
      tenantId,
      customerId: customer._id,
      direction: "outgoing",
      text: template.body,
      templateId: template._id,
      broadcastId,
      scheduledAt: sendTime,
      status: isFuture ? "queued" : "sent",
    }))
  );

  if (!isFuture) {
    await recordMessageBilling(tenantId, messages.length);
  }

  return {
    broadcastId,
    segment,
    recipientCount: messages.length,
    scheduledAt: sendTime,
    status: isFuture ? "queued" : "sent",
  };
};

const sendMessage = async ({ tenantId, customerId, text, templateId = null }) => {
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  if (!customer) throw new Error("Customer not found");
  const message = await sendThroughProvider({ tenantId, recipient: customer.phone, text, context: { customerId, templateId } });
  await recordMessageBilling(tenantId, 1);
  return message;
};

registerProvider("whatsapp", {
  rateLimitPerMinute: 80,
  send: async ({ tenantId, recipient, text, context }) => {
    let providerMessageId = "";
    let status = "sent";
    if (config.WHATSAPP_ACCESS_TOKEN && config.WHATSAPP_PHONE_NUMBER_ID) {
      const response = await fetch(`https://graph.facebook.com/v20.0/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: recipient, type: "text", text: { body: text } }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error?.message || `WhatsApp delivery failed with status ${response.status}`);
      providerMessageId = body?.messages?.[0]?.id || "";
      status = "queued";
    }
    return Message.create({ tenantId, customerId: context.customerId, direction: "outgoing", text, templateId: context.templateId, status, provider: "whatsapp", providerMessageId });
  },
  normalizeInbound: (payload = {}) => ({
    provider: "whatsapp",
    tenantHint: payload.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number || null,
    externalMessageId: payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id || null,
    sender: payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || null,
    recipient: payload.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number || null,
    type: payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type || "text",
    text: payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || "",
    timestamp: new Date().toISOString(),
    raw: payload,
  }),
  validateWebhook: (payload) => ({ valid: Boolean(payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) }),
});

module.exports = {
  saveIncomingMessage,
  getCustomerMessages,
  createTemplate,
  listTemplates,
  buildAiReply,
  getCustomersBySegment,
  getSegmentSummary,
  scheduleBroadcast,
  sendMessage,
  ensureCustomer,
};
