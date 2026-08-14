const Order = require("../models/Order");
const { notifyOnce } = require("./notificationService");

const ORDER_FILTER_FIELDS = ["status", "customerId"];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createOrder = async (tenantId, payload) => {
  try {
    const order = new Order({ ...payload, tenantId });
    const saved = await order.save();
    await notifyOnce({ tenantId, type: "new_order", entityId: saved._id, message: `New order ${saved.orderNumber} created` });
    return saved;
  } catch (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

const listOrders = async (tenantId, { page = 1, limit = 20, status = "", customerId = "", search = "", filter = "" } = {}) => {
  try {
    const query = { tenantId };

    if (status) {
      query.status = status;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    if (filter) {
      const [field, value] = String(filter).split(":");
      if (ORDER_FILTER_FIELDS.includes(field) && value !== undefined) {
        query[field] = value;
      }
    }

    if (search) {
      query.orderNumber = { $regex: escapeRegex(search), $options: "i" };
    }

    const safeLimit = Math.max(Number(limit) || 20, 1);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).populate("customerId").populate("items.productId"),
      Order.countDocuments(query),
    ]);

    return { items, total };
  } catch (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }
};

const getOrderById = async (tenantId, id) => {
  try {
    return await Order.findOne({ _id: id, tenantId }).populate("customerId").populate("items.productId");
  } catch (error) {
    throw new Error(`Failed to fetch order: ${error.message}`);
  }
};

const listOrdersByCustomer = async (tenantId, customerId) => {
  try {
    return await Order.find({ tenantId, customerId }).sort({ createdAt: -1 }).populate("items.productId");
  } catch (error) {
    throw new Error(`Failed to fetch customer orders: ${error.message}`);
  }
};

const updateOrderStatus = async (tenantId, id, status) => {
  try {
    return await Order.findOneAndUpdate(
      { _id: id, tenantId },
      { status },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

const assignDelivery = async (tenantId, id, { operatorId, fleetId, detail = "Delivery assigned" }) => {
  const order = await Order.findOne({ _id: id, tenantId });
  if (!order) return null;

  order.deliveryAssignment = { operatorId: operatorId || "", fleetId: fleetId || "", assignedAt: new Date() };
  order.deliveryTimeline.push({ status: "assigned", detail });
  return order.save();
};

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  listOrdersByCustomer,
  updateOrderStatus,
  assignDelivery,
};
