const express = require("express");
const {
  getOverview,
  getAdminProducts,
  getAdminOrders,
  getAdminCustomers,
} = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware, requireTenant, requirePermission("manage_tenants"));
router.get("/admin/overview", getOverview);
router.get("/admin/products", getAdminProducts);
router.get("/admin/orders", getAdminOrders);
router.get("/admin/customers", getAdminCustomers);

module.exports = router;
