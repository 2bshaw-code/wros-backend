const Product = require("../models/Product");
const { sendError } = require("../utils/response");

const getProducts = async () => {
  try {
    return await Product.find({}).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

const createProduct = async (payload) => {
  try {
    const product = new Product(payload);
    return await product.save();
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

const updateProduct = async (id, payload) => {
  try {
    return await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  } catch (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

const deleteProduct = async (id) => {
  try {
    const deleted = await Product.findByIdAndDelete(id);
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
  createProduct,
  updateProduct,
  deleteProduct,
};
