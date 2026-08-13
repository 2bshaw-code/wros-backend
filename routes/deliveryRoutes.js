const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { entitlements, operators, addOperator, zones, addZone, assign, updateStatus, timeline, pickup, analytics } = require("../controllers/deliveryController");

const router = express.Router();

router.get("/delivery", authMiddleware, entitlements);
router.get("/delivery/operators", authMiddleware, operators);
router.post("/delivery/operators", authMiddleware, addOperator);
router.get("/delivery/zones", authMiddleware, zones);
router.post("/delivery/zones", authMiddleware, addZone);
router.post("/delivery/assign", authMiddleware, assign);
router.post("/delivery/update-status", authMiddleware, updateStatus);
router.get("/delivery/timeline/:orderId", authMiddleware, timeline);
router.post("/delivery/pickup", authMiddleware, pickup);
router.get("/delivery/analytics", authMiddleware, analytics);

module.exports = router;