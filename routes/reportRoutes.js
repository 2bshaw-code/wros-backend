const express = require("express");
const {
  salesTrend,
  topProducts,
  customerSegments,
  inventoryMovement,
  summary,
} = require("../controllers/reportController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.get("/reports/sales", salesTrend);
router.get("/reports/sales-trend", salesTrend);
router.get("/reports/top-products", topProducts);
router.get("/reports/customer-segments", customerSegments);
router.get("/reports/inventory", inventoryMovement);
router.get("/reports/inventory-movement", inventoryMovement);
router.get("/reports/summary", summary);

module.exports = router;
