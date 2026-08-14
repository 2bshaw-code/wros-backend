const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { entitlements, operators, addOperator, zones, addZone, assign, updateStatus, timeline, pickup, analytics } = require("../controllers/deliveryController");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.get("/delivery", entitlements);
router.get("/delivery/operators", operators);
router.post("/delivery/operators", addOperator);
router.get("/delivery/zones", zones);
router.post("/delivery/zones", addZone);
router.post("/delivery/assign", assign);
router.post("/delivery/update-status", updateStatus);
router.get("/delivery/timeline/:orderId", timeline);
router.post("/delivery/pickup", pickup);
router.get("/delivery/analytics", analytics);

module.exports = router;