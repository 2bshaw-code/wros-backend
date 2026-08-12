const { sendSuccess, sendError } = require("../utils/response");
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../services/productService");

const listProducts = async (req, res) => {
  try {
    const products = await getProducts();
    sendSuccess(res, { items: products, count: products.length });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const addProduct = async (req, res) => {
  try {
    const product = await createProduct(req.body);
    sendSuccess(res, product, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const editProduct = async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) {
      return sendError(res, "Product not found", 404);
    }
    sendSuccess(res, product);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const removeProduct = async (req, res) => {
  try {
    const product = await deleteProduct(req.params.id);
    sendSuccess(res, { deleted: product._id }, 200);
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    sendError(res, error.message, statusCode);
  }
};

module.exports = {
  listProducts,
  addProduct,
  editProduct,
  removeProduct,
};
