const express = require("express");
const {
  getOverview,
  getAdminProducts,
  getAdminOrders,
  getAdminCustomers,
} = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin/overview", authMiddleware, getOverview);
router.get("/admin/products", authMiddleware, getAdminProducts);
router.get("/admin/orders", authMiddleware, getAdminOrders);
router.get("/admin/customers", authMiddleware, getAdminCustomers);

module.exports = router;
