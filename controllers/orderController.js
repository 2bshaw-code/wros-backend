const { sendSuccess, sendError } = require("../utils/response");
const { createOrder, listOrders, updateOrderStatus } = require("../services/orderService");

const addOrder = async (req, res) => {
  try {
    const order = await createOrder(req.body);
    sendSuccess(res, order, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const listOrderItems = async (req, res) => {
  try {
    const orders = await listOrders();
    sendSuccess(res, { items: orders, count: orders.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const editOrderStatus = async (req, res) => {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.status);
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    sendSuccess(res, order);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

module.exports = {
  addOrder,
  listOrderItems,
  editOrderStatus,
};
