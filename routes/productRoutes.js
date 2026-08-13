const express = require("express");
const {
  listProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
} = require("../controllers/productController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.get("/products", listProducts);
router.get("/products/:id", getProduct);
router.post("/products", addProduct);
router.put("/products/:id", editProduct);
router.delete("/products/:id", removeProduct);

module.exports = router;
