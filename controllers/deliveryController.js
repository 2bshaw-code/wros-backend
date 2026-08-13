const { sendSuccess, sendError } = require("../utils/response");
const config = require("../config");
const {
  listOperators,
  listZones,
  createOperator,
  createZone,
  assignRider,
  updateDeliveryStatus,
  markPickup,
  getTimeline,
  getAnalytics,
} = require("../services/localDeliveryService");

const requireLdmPlan = (req) => {
  if (!config.LDM_ENABLED) throw new Error("Local Delivery Mode is disabled");
  if (!req.user?.plan?.features?.delivery_enabled) throw new Error("This delivery feature requires a delivery-enabled merchant plan");
  if (!req.user?.businessId) throw new Error("Merchant console business is required");
  return req.user.businessId;
};

const entitlements = (req, res) => {
  if (!req.user?.plan?.features) {
    return sendError(res, "Merchant console plan is required", 403);
  }

  const features = req.user.plan.features;
  sendSuccess(res, {
    enabled: features.delivery_enabled,
    routing: features.delivery_routing,
    operators: features.delivery_operators,
    zones: Boolean(features.delivery_zones),
    notifications: Boolean(features.delivery_notifications),
    fees: Boolean(features.delivery_fees),
    fleetManagement: Boolean(features.delivery_fleet_management),
    analytics: Boolean(features.delivery_analytics),
  });
};

const operators = async (req, res) => {
  try {
    sendSuccess(res, await listOperators(requireLdmPlan(req)));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const addOperator = async (req, res) => {
  try {
    sendSuccess(res, await createOperator({ ...req.body, merchantId: requireLdmPlan(req) }), 201);
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const zones = async (req, res) => {
  try {
    sendSuccess(res, await listZones(requireLdmPlan(req)));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const addZone = async (req, res) => {
  try {
    if (!req.user?.plan?.features?.delivery_zones) throw new Error("This delivery feature requires delivery_zones");
    sendSuccess(res, await createZone({ ...req.body, merchantId: requireLdmPlan(req) }), 201);
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const assign = async (req, res) => {
  try {
    const merchantId = requireLdmPlan(req);
    sendSuccess(res, await assignRider({
      merchantId,
      orderId: req.body?.order_id,
      riderId: req.body?.rider_id,
      zoneId: req.body?.zone_id,
      feeCents: req.body?.fee_cents,
      cashOnDelivery: req.body?.cash_on_delivery,
      confirmedBy: req.user.id,
    }));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const updateStatus = async (req, res) => {
  try {
    requireLdmPlan(req);
    sendSuccess(res, await updateDeliveryStatus({ orderId: req.body?.order_id, riderPhone: req.body?.rider_phone, status: req.body?.status, detail: req.body?.detail }));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const timeline = async (req, res) => {
  try {
    requireLdmPlan(req);
    sendSuccess(res, await getTimeline(req.params.orderId));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const pickup = async (req, res) => {
  try {
    requireLdmPlan(req);
    sendSuccess(res, await markPickup({ orderId: req.body?.order_id, instructions: req.body?.instructions }));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const analytics = async (req, res) => {
  try {
    if (!req.user?.plan?.features?.delivery_analytics) throw new Error("This delivery feature requires delivery_analytics");
    sendSuccess(res, await getAnalytics(requireLdmPlan(req)));
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

module.exports = { entitlements, operators, addOperator, zones, addZone, assign, updateStatus, timeline, pickup, analytics };