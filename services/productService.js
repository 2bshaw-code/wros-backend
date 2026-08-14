const Product = require("../models/Product");
const { notifyOnce } = require("./notificationService");
const { sendError } = require("../utils/response");

const PRODUCT_FILTER_FIELDS = ["category", "sku", "supplier"];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getProducts = async (tenantId, { page = 1, limit = 20, search = "", category = "", supplier = "", filter = "", stockMin = "", stockMax = "", priceMin = "", priceMax = "" } = {}) => {
  try {
    const query = { tenantId };

    if (category) {
      query.category = category;
    }
    if (supplier) query.supplier = { $regex: escapeRegex(supplier), $options: "i" };

    if (filter) {
      const [field, value] = String(filter).split(":");
      if (PRODUCT_FILTER_FIELDS.includes(field) && value !== undefined) {
        query[field] = value;
      }
    }

    if (search) {
      query.name = { $regex: escapeRegex(search), $options: "i" };
    }
    const stock = {};
    const price = {};
    if (stockMin !== "" && Number.isFinite(Number(stockMin))) stock.$gte = Number(stockMin);
    if (stockMax !== "" && Number.isFinite(Number(stockMax))) stock.$lte = Number(stockMax);
    if (priceMin !== "" && Number.isFinite(Number(priceMin))) price.$gte = Number(priceMin);
    if (priceMax !== "" && Number.isFinite(Number(priceMax))) price.$lte = Number(priceMax);
    if (Object.keys(stock).length) query.stock = stock;
    if (Object.keys(price).length) query.price = price;

    const safeLimit = Math.max(Number(limit) || 20, 1);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Product.countDocuments(query),
    ]);

    return { items, total };
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

const getProductById = async (tenantId, id) => {
  try {
    return await Product.findOne({ _id: id, tenantId });
  } catch (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

const createProduct = async (tenantId, payload) => {
  try {
    const product = new Product({ ...payload, tenantId });
    return await product.save();
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

const updateProduct = async (tenantId, id, payload) => {
  try {
    return await Product.findOneAndUpdate({ _id: id, tenantId }, payload, { new: true, runValidators: true });
  } catch (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

const adjustStock = async (tenantId, id, adjustment, threshold = 5) => {
  const product = await Product.findOne({ _id: id, tenantId });
  if (!product) throw new Error("Product not found");
  const amount = Number(adjustment);
  if (!Number.isInteger(amount) || amount === 0) throw new Error("Stock adjustment must be a non-zero integer");
  const nextStock = product.stock + amount;
  if (nextStock < 0) throw new Error("Stock cannot be negative");
  product.stock = nextStock;
  await product.save();
  if (nextStock < Number(threshold)) await notifyOnce({ tenantId, type: "low_stock", entityId: product._id, message: `${product.name} is below the low-stock threshold` });
  return product;
};

const deleteProduct = async (tenantId, id) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: id, tenantId });
    if (!deleted) {
      throw new Error("Product not found");
    }
    return deleted;
  } catch (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
};
