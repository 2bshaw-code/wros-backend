const Product = require("../models/Product");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { sendSuccess, sendError } = require("../utils/response");

const getPagination = (req) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const safeLimit = Math.min(limit, 100);

  return {
    page,
    limit: safeLimit,
    skip: (page - 1) * safeLimit,
  };
};

const getSort = (req) => {
  const sortField = req.query.sort || "createdAt";
  const order = String(req.query.order || "desc").toLowerCase() === "asc" ? 1 : -1;
  return { [sortField]: order };
};

const getOverview = async (req, res) => {
  try {
    const [products, orders, customers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Customer.countDocuments(),
    ]);

    sendSuccess(res, {
      counts: {
        products,
        orders,
        customers,
      },
    });
  } catch (error) {
    sendError(res, "Unable to load admin overview", 500, error.message);
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const sort = getSort(req);

    const [items, total] = await Promise.all([
      Product.find({}).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    sendSuccess(res, {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    sendError(res, "Unable to load products", 500, error.message);
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const sort = getSort(req);
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate("customerId")
        .populate("items.productId")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    sendSuccess(res, {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    sendError(res, "Unable to load orders", 500, error.message);
  }
};

const getAdminCustomers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const sort = getSort(req);

    const [items, total] = await Promise.all([
      Customer.find({}).sort(sort).skip(skip).limit(limit),
      Customer.countDocuments(),
    ]);

    sendSuccess(res, {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    sendError(res, "Unable to load customers", 500, error.message);
  }
};

module.exports = {
  getOverview,
  getAdminProducts,
  getAdminOrders,
  getAdminCustomers,
};
