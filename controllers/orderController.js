const { sendSuccess, sendError, isValidObjectId } = require("../utils/response");
const { createOrder, listOrders, getOrderById, updateOrderStatus, assignDelivery } = require("../services/orderService");

const requirePlanFeature = (req, feature) => {
  if (!req.user?.plan?.features?.[feature]) throw new Error(`This order feature requires a plan with ${feature}`);
};

const addOrder = async (req, res) => {
  try {
    const order = await createOrder(req.tenantId, req.body);
    sendSuccess(res, order, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const listOrderItems = async (req, res) => {
  try {
    const { items, total } = await listOrders(req.tenantId, req.query);
    sendSuccess(res, items, 200, { total });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, "Invalid order id", 400);
    }
    const order = await getOrderById(req.tenantId, req.params.id);
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    sendSuccess(res, order);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const editOrderStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, "Invalid order id", 400);
    }
    const order = await updateOrderStatus(req.tenantId, req.params.id, req.body.status);
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    sendSuccess(res, order);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const updateOrderStatusForMerchant = async (req, res) => {
  try {
    requirePlanFeature(req, "orders_full");
    const order = await updateOrderStatus(req.tenantId, req.body?.order_id, req.body?.status);
    if (!order) return sendError(res, "Order not found", 404);
    sendSuccess(res, order);
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

const assignDeliveryForMerchant = async (req, res) => {
  try {
    requirePlanFeature(req, "delivery_assignment");
    if (req.body?.fleet_id) requirePlanFeature(req, "delivery_fleet_assignment");
    const order = await assignDelivery(req.tenantId, req.body?.order_id, {
      operatorId: req.body?.operator_id || req.user.id,
      fleetId: req.body?.fleet_id,
      detail: req.body?.detail,
    });
    if (!order) return sendError(res, "Order not found", 404);
    sendSuccess(res, order);
  } catch (error) {
    sendError(res, error.message, 403);
  }
};

module.exports = {
  addOrder,
  listOrderItems,
  getOrder,
  editOrderStatus,
  updateOrderStatusForMerchant,
  assignDeliveryForMerchant,
};
