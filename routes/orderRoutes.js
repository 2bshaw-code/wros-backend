const express = require("express");
const { addOrder, listOrderItems, getOrder, editOrderStatus, updateOrderStatusForMerchant, assignDeliveryForMerchant } = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.get("/orders", requirePermission("read"), listOrderItems);
router.get("/orders/:id", getOrder);
router.post("/orders", requirePermission("write"), addOrder);
router.post("/orders/update-status", updateOrderStatusForMerchant);
router.post("/orders/assign-delivery", assignDeliveryForMerchant);
router.put("/orders/:id", requirePermission("write"), editOrderStatus);
router.patch("/orders/:id/status", requirePermission("write"), editOrderStatus);

module.exports = router;
