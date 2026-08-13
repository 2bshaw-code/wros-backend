const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  return filter;
};

const getSalesTrend = async (tenantId, { startDate, endDate } = {}) => {
  try {
    const match = { tenantId, ...buildDateFilter(startDate, endDate) };
    const results = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return results.map((row) => ({ date: row._id, sales: row.sales }));
  } catch (error) {
    throw new Error(`Failed to compute sales trend: ${error.message}`);
  }
};

const getTopProducts = async (tenantId, { startDate, endDate, limit = 5 } = {}) => {
  try {
    const match = { tenantId, ...buildDateFilter(startDate, endDate) };
    const results = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$product.name", "Unknown"] },
          category: "$product.category",
          unitsSold: 1,
          revenue: 1,
        },
      },
    ]);
    return results;
  } catch (error) {
    throw new Error(`Failed to compute top products: ${error.message}`);
  }
};

const getCustomerSegments = async (tenantId) => {
  try {
    const customers = await Customer.find({ tenantId });
    const orders = await Order.find({ tenantId });

    const spendByCustomer = orders.reduce((acc, order) => {
      const key = String(order.customerId);
      acc[key] = (acc[key] || 0) + (order.total || 0);
      return acc;
    }, {});

    const segments = { vip: 0, loyal: 0, new: 0, regular: 0 };
    customers.forEach((customer) => {
      const spend = spendByCustomer[String(customer._id)] || 0;
      if (spend >= 1000) segments.vip += 1;
      else if (spend >= 300) segments.loyal += 1;
      else if (spend > 0) segments.regular += 1;
      else segments.new += 1;
    });

    return Object.entries(segments).map(([segment, count]) => ({ segment, count }));
  } catch (error) {
    throw new Error(`Failed to compute customer segments: ${error.message}`);
  }
};

const getInventoryMovement = async (tenantId, { startDate, endDate } = {}) => {
  try {
    const match = { tenantId, ...buildDateFilter(startDate, endDate) };
    const results = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          stockOut: { $sum: "$items.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return results.map((row) => ({ date: row._id, stockOut: row.stockOut, stockIn: 0 }));
  } catch (error) {
    throw new Error(`Failed to compute inventory movement: ${error.message}`);
  }
};

const getSummary = async (tenantId, { startDate, endDate } = {}) => {
  try {
    const match = { tenantId, ...buildDateFilter(startDate, endDate) };
    const orders = await Order.find(match);
    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = await Customer.countDocuments({ tenantId });
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return { totalSales, totalOrders, totalCustomers, avgOrderValue };
  } catch (error) {
    throw new Error(`Failed to compute report summary: ${error.message}`);
  }
};

module.exports = {
  getSalesTrend,
  getTopProducts,
  getCustomerSegments,
  getInventoryMovement,
  getSummary,
};
