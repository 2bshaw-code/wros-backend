const Order = require("../models/Order");

const createOrder = async (payload) => {
  try {
    const order = new Order(payload);
    return await order.save();
  } catch (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

const listOrders = async () => {
  try {
    return await Order.find({}).sort({ createdAt: -1 }).populate("customerId").populate("items.productId");
  } catch (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }
};

const updateOrderStatus = async (id, status) => {
  try {
    return await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

module.exports = {
  createOrder,
  listOrders,
  updateOrderStatus,
};
