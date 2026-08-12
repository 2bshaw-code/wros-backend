const { sendSuccess, sendError } = require("../utils/response");
const { createCustomer, listCustomers, findCustomerByPhone } = require("../services/customerService");

const addCustomer = async (req, res) => {
  try {
    const customer = await createCustomer(req.body);
    sendSuccess(res, customer, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const listCustomerItems = async (req, res) => {
  try {
    const customers = await listCustomers();
    sendSuccess(res, { items: customers, count: customers.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getCustomerByPhone = async (req, res) => {
  try {
    const customer = await findCustomerByPhone(req.params.phone);
    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }
    sendSuccess(res, customer);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  addCustomer,
  listCustomerItems,
  getCustomerByPhone,
};
