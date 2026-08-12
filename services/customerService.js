const Customer = require("../models/Customer");

const createCustomer = async (payload) => {
  try {
    const customer = new Customer(payload);
    return await customer.save();
  } catch (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

const listCustomers = async () => {
  try {
    return await Customer.find({}).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }
};

const findCustomerByPhone = async (phone) => {
  try {
    return await Customer.findOne({ phone });
  } catch (error) {
    throw new Error(`Failed to find customer by phone: ${error.message}`);
  }
};

module.exports = {
  createCustomer,
  listCustomers,
  findCustomerByPhone,
};
