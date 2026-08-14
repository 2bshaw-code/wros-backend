const express = require("express");
const {
  addCustomer,
  listCustomerItems,
  getCustomerByPhone,
  getCustomer,
  editCustomer,
  getCustomerOrderHistory,
} = require("../controllers/customerController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.get("/customers", requirePermission("read"), listCustomerItems);
router.get("/customers/phone/:phone", getCustomerByPhone);
router.get("/customers/:id/orders", getCustomerOrderHistory);
router.get("/customers/:id", getCustomer);
router.post("/customers", requirePermission("write"), addCustomer);
router.put("/customers/:id", requirePermission("write"), editCustomer);

module.exports = router;
