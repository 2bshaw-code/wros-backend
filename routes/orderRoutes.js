const express = require("express");
const { addOrder, listOrderItems, getOrder, editOrderStatus, updateOrderStatusForMerchant, assignDeliveryForMerchant } = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.get("/orders", listOrderItems);
router.get("/orders/:id", getOrder);
router.post("/orders", addOrder);
router.post("/orders/update-status", updateOrderStatusForMerchant);
router.post("/orders/assign-delivery", assignDeliveryForMerchant);
router.put("/orders/:id", editOrderStatus);
router.patch("/orders/:id/status", editOrderStatus);

module.exports = router;
