const { products, orders, customers } = require("../services/sampleDataService");
const { sendSuccess, sendError } = require("../utils/response");

const getProducts = (req, res) => {
  try {
    sendSuccess(res, { items: products, count: products.length });
  } catch (error) {
    sendError(res, "Unable to fetch products", 500, error.message);
  }
};

const getOrders = (req, res) => {
  try {
    sendSuccess(res, { items: orders, count: orders.length });
  } catch (error) {
    sendError(res, "Unable to fetch orders", 500, error.message);
  }
};

const getCustomers = (req, res) => {
  try {
    sendSuccess(res, { items: customers, count: customers.length });
  } catch (error) {
    sendError(res, "Unable to fetch customers", 500, error.message);
  }
};

module.exports = {
  getProducts,
  getOrders,
  getCustomers,
};
