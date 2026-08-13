const DeliveryOperator = require("../models/DeliveryOperator");
const DeliveryZone = require("../models/DeliveryZone");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Message = require("../models/Message");

const RIDER_STATUS = Object.freeze({
  accepted: "accepted",
  "on the way": "on_the_way",
  arrived: "arrived",
  delivered: "delivered",
  failed: "failed",
});

const requireFeature = (plan, feature) => {
  if (!plan?.features?.[feature]) throw new Error(`This delivery feature requires a plan with ${feature}`);
};

const normalizePhone = (value = "") => String(value).replace(/\D/g, "");

const listOperators = (merchantId) => DeliveryOperator.find({ merchantId, active: true }).sort({ name: 1 });
const listZones = (merchantId) => DeliveryZone.find({ merchantId }).sort({ name: 1 });

const createOperator = async ({ merchantId, name, phone, role = "rider", phoneVerified = false }) => {
  if (!merchantId || !name || !phone) throw new Error("merchant_id, name, and phone are required");
  return DeliveryOperator.create({ merchantId, name, phone: normalizePhone(phone), role, phoneVerified });
};

const createZone = async ({ merchantId, name, feeCents, estimatedMinutes, riderPreference, feeMode, cashOnDeliveryAllowed }) => {
  if (!merchantId || !name) throw new Error("merchant_id and name are required");
  return DeliveryZone.create({ merchantId, name, feeCents, estimatedMinutes, riderPreference, feeMode, cashOnDeliveryAllowed });
};

const appendTimeline = async (order, status, detail) => {
  order.deliveryTimeline.push({ status, detail });
  return order.save();
};

const notifyCustomer = async (customerId, text) => {
  if (!customerId) return null;
  return Message.create({ customerId, direction: "outgoing", text, status: "sent" });
};

const assignRider = async ({ merchantId, orderId, riderId, zoneId, feeCents, cashOnDelivery, confirmedBy }) => {
  const [order, rider] = await Promise.all([Order.findById(orderId), DeliveryOperator.findById(riderId)]);
  if (!order) throw new Error("Order not found");
  if (!rider || rider.merchantId !== merchantId || !rider.active) throw new Error("Active merchant rider not found");
  if (!rider.phoneVerified) throw new Error("Rider phone must be verified before assignment");
  if (!confirmedBy) throw new Error("Merchant confirmation is required before assignment");

  order.deliveryMode = "rider";
  order.deliveryAssignment = { operatorId: rider._id.toString(), fleetId: rider.role === "fleet_rider" ? rider._id.toString() : "", assignedAt: new Date() };
  order.deliveryZoneId = zoneId || null;
  order.deliveryFeeCents = Number(feeCents || 0);
  order.cashOnDelivery = Boolean(cashOnDelivery);
  await appendTimeline(order, "assigned", `Assigned to ${rider.name}`);

  await notifyCustomer(order.customerId, "Your delivery has been assigned. We will keep you updated on WhatsApp.");
  return { order, rider, riderQuickReplies: ["Accepted", "On the way", "Arrived", "Delivered", "Failed"] };
};

const updateDeliveryStatus = async ({ orderId, riderPhone, status, detail = "" }) => {
  const normalizedStatus = RIDER_STATUS[String(status || "").toLowerCase()];
  if (!normalizedStatus) throw new Error("Unsupported rider status");
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  const rider = await DeliveryOperator.findById(order.deliveryAssignment?.operatorId);
  if (!rider || normalizePhone(rider.phone) !== normalizePhone(riderPhone) || !rider.phoneVerified) {
    throw new Error("Verified assigned rider is required");
  }

  await appendTimeline(order, normalizedStatus, detail || `Rider marked ${normalizedStatus}`);
  if (normalizedStatus === "delivered") order.status = "completed";
  if (normalizedStatus === "failed") order.status = "processing";
  await order.save();
  await notifyCustomer(order.customerId, `Delivery update: ${normalizedStatus.replace(/_/g, " ")}.`);
  return order;
};

const markPickup = async ({ orderId, instructions }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  order.deliveryMode = "pickup";
  await appendTimeline(order, "pickup", instructions || "Merchant requested customer pickup");
  await notifyCustomer(order.customerId, `Pickup instructions: ${instructions || "Please contact the merchant to arrange collection."}`);
  return order;
};

const getTimeline = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  return order.deliveryTimeline;
};

const getAnalytics = async (merchantId) => {
  const riders = await DeliveryOperator.find({ merchantId });
  const riderIds = riders.map((rider) => rider._id.toString());
  const orders = await Order.find({ "deliveryAssignment.operatorId": { $in: riderIds } });
  const delivered = orders.filter((order) => order.deliveryTimeline.some((event) => event.status === "delivered"));
  const failed = orders.filter((order) => order.deliveryTimeline.some((event) => event.status === "failed"));
  return {
    totalAssignments: orders.length,
    deliverySuccessRate: orders.length ? delivered.length / orders.length : 0,
    deliveryFailures: failed.length,
    riderPerformance: riders.map((rider) => ({ riderId: rider._id, name: rider.name, assignments: orders.filter((order) => order.deliveryAssignment.operatorId === rider._id.toString()).length })),
  };
};

module.exports = { RIDER_STATUS, listOperators, listZones, createOperator, createZone, assignRider, updateDeliveryStatus, markPickup, getTimeline, getAnalytics };