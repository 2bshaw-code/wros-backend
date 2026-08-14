const { sendSuccess, sendError, isValidObjectId } = require("../utils/response");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} = require("../services/productService");

const listProducts = async (req, res) => {
  try {
    const { items, total } = await getProducts(req.tenantId, req.query);
    sendSuccess(res, items, 200, { total });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, "Invalid product id", 400);
    }
    const product = await getProductById(req.tenantId, req.params.id);
    if (!product) {
      return sendError(res, "Product not found", 404);
    }
    sendSuccess(res, product);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const addProduct = async (req, res) => {
  try {
    const product = await createProduct(req.tenantId, req.body);
    sendSuccess(res, product, 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const editProduct = async (req, res) => {
  try {
    const product = await updateProduct(req.tenantId, req.params.id, req.body);
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
    const product = await deleteProduct(req.tenantId, req.params.id);
    sendSuccess(res, { deleted: product._id }, 200);
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    sendError(res, error.message, statusCode);
  }
};

const adjustProductStock = async (req, res) => { try { return sendSuccess(res, await adjustStock(req.tenantId, req.params.id, req.body?.adjustment, req.body?.threshold)); } catch (error) { return sendError(res, error.message, 400); } };

module.exports = {
  listProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
  adjustProductStock,
};
