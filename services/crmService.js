const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Message = require("../models/Message");

const requireFeature = (plan, feature) => {
  if (!plan?.features?.[feature]) {
    throw new Error(`This CRM feature requires a plan with ${feature}`);
  }
};

const getCustomerProfile = async (tenantId, customerId, plan) => {
  requireFeature(plan, "customer_list");
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  if (!customer) throw new Error("Customer not found");

  const [orders, messages] = await Promise.all([
    Order.find({ tenantId, customerId }).sort({ createdAt: -1 }),
    Message.find({ tenantId, customerId }).sort({ timestamp: -1 }),
  ]);

  const profile = {
    customer,
    orders,
    messages,
  };

  if (plan.features.crm_customer_profiles) {
    profile.tags = customer.tags;
    profile.notes = customer.notes;
    profile.deliveryTimeline = customer.deliveryTimeline;
    profile.bobInsights = customer.bobInsights;
  }

  if (plan.features.crm_customer_scoring) {
    profile.score = orders.reduce((total, order) => total + (order.total || 0), 0);
  }

  return profile;
};

const updateCustomerProfile = async (tenantId, customerId, payload, plan, operatorId) => {
  requireFeature(plan, "crm_customer_profiles");
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  if (!customer) throw new Error("Customer not found");

  if (payload.tags !== undefined) {
    requireFeature(plan, "crm_tags");
    customer.tags = [...new Set((payload.tags || []).map((tag) => String(tag).trim()).filter(Boolean))];
  }

  if (payload.note) {
    requireFeature(plan, "crm_notes");
    customer.notes.push({ body: payload.note, operatorId });
  }

  if (payload.deliveryEvent) {
    requireFeature(plan, "crm_delivery_timeline");
    customer.deliveryTimeline.push(payload.deliveryEvent);
  }

  if (payload.bobInsight) {
    requireFeature(plan, "crm_bob_insights");
    customer.bobInsights.push({ summary: payload.bobInsight });
  }

  await customer.save();
  return customer;
};

const getSegments = async (tenantId, plan) => {
  requireFeature(plan, "crm_segmentation");
  const customers = await Customer.find({ tenantId });
  const orders = await Order.find({ tenantId });
  const spend = orders.reduce((total, order) => {
    const key = String(order.customerId);
    total[key] = (total[key] || 0) + (order.total || 0);
    return total;
  }, {});

  return customers.map((customer) => ({
    customerId: customer._id,
    segment: (spend[String(customer._id)] || 0) >= 1000 ? "vip" : (spend[String(customer._id)] || 0) > 0 ? "active" : "new",
    score: spend[String(customer._id)] || 0,
  }));
};

module.exports = { getCustomerProfile, updateCustomerProfile, getSegments };