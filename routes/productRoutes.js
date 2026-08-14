const express = require("express");
const {
  listProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
  adjustProductStock,
} = require("../controllers/productController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.get("/products", requirePermission("read"), listProducts);
router.get("/products/:id", getProduct);
router.post("/products", requirePermission("write"), addProduct);
router.put("/products/:id", requirePermission("write"), editProduct);
router.post("/products/:id/stock-adjustment", requirePermission("write"), adjustProductStock);
router.delete("/products/:id", requirePermission("delete"), removeProduct);

module.exports = router;
