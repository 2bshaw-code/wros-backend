const Category = require("../models/Category");
const Product = require("../models/Product");
const { sendSuccess, sendError } = require("../utils/response");

const list = async (req, res) => sendSuccess(res, await Category.find({ tenantId: req.tenantId }).sort({ name: 1 }));
const create = async (req, res) => { try { const category = await Category.create({ tenantId: req.tenantId, name: req.body?.name, description: req.body?.description || "" }); return sendSuccess(res, category, 201); } catch (error) { return sendError(res, error.message, 400); } };
const assign = async (req, res) => { try { const category = await Category.findOne({ tenantId: req.tenantId, name: req.body?.category }); if (!category) return sendError(res, "Category not found", 404); const product = await Product.findOneAndUpdate({ _id: req.body?.productId, tenantId: req.tenantId }, { category: category.name }, { new: true, runValidators: true }); if (!product) return sendError(res, "Product not found", 404); return sendSuccess(res, product); } catch (error) { return sendError(res, error.message, 400); } };
module.exports = { list, create, assign };
