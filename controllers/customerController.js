const { sendSuccess, sendError, isValidObjectId } = require("../utils/response");
const {
  createCustomer,
  listCustomers,
  findCustomerByPhone,
  getCustomerById,
  updateCustomer,
  getCustomerOrders,
} = require("../services/customerService");

const addCustomer = async (req, res) => {
  try {
    const customer = await createCustomer(req.tenantId, req.body);
    sendSuccess(res, customer, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const listCustomerItems = async (req, res) => {
  try {
    const { items, total } = await listCustomers(req.tenantId, req.query);
    sendSuccess(res, items, 200, { total });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getCustomerByPhone = async (req, res) => {
  try {
    const customer = await findCustomerByPhone(req.tenantId, req.params.phone);
    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }
    sendSuccess(res, customer);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getCustomer = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, "Invalid customer id", 400);
    }
    const customer = await getCustomerById(req.tenantId, req.params.id);
    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }
    sendSuccess(res, customer);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const editCustomer = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, "Invalid customer id", 400);
    }
    const customer = await updateCustomer(req.tenantId, req.params.id, req.body);
    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }
    sendSuccess(res, customer);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getCustomerOrderHistory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, "Invalid customer id", 400);
    }
    const orders = await getCustomerOrders(req.tenantId, req.params.id);
    sendSuccess(res, orders, 200, { total: orders.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  addCustomer,
  listCustomerItems,
  getCustomerByPhone,
  getCustomer,
  editCustomer,
  getCustomerOrderHistory,
};
