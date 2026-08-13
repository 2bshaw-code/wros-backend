const Customer = require("../models/Customer");
const Order = require("../models/Order");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createCustomer = async (tenantId, payload) => {
  try {
    const customer = new Customer({ ...payload, tenantId });
    return await customer.save();
  } catch (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

const listCustomers = async (tenantId, { page = 1, limit = 20, search = "" } = {}) => {
  try {
    const query = { tenantId };

    if (search) {
      const regex = { $regex: escapeRegex(search), $options: "i" };
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const safeLimit = Math.max(Number(limit) || 20, 1);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Customer.countDocuments(query),
    ]);

    return { items, total };
  } catch (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }
};

const findCustomerByPhone = async (tenantId, phone) => {
  try {
    return await Customer.findOne({ tenantId, phone });
  } catch (error) {
    throw new Error(`Failed to find customer by phone: ${error.message}`);
  }
};

const getCustomerById = async (tenantId, id) => {
  try {
    return await Customer.findOne({ _id: id, tenantId });
  } catch (error) {
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }
};

const updateCustomer = async (tenantId, id, payload) => {
  try {
    return await Customer.findOneAndUpdate({ _id: id, tenantId }, payload, { new: true, runValidators: true });
  } catch (error) {
    throw new Error(`Failed to update customer: ${error.message}`);
  }
};

const getCustomerOrders = async (tenantId, customerId) => {
  try {
    return await Order.find({ tenantId, customerId }).sort({ createdAt: -1 }).populate("items.productId");
  } catch (error) {
    throw new Error(`Failed to fetch customer orders: ${error.message}`);
  }
};

module.exports = {
  createCustomer,
  listCustomers,
  findCustomerByPhone,
  getCustomerById,
  updateCustomer,
  getCustomerOrders,
};
