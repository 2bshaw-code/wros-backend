const express = require("express");
const { addOrder, listOrderItems, editOrderStatus } = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/orders", listOrderItems);
router.post("/orders", authMiddleware, addOrder);
router.put("/orders/:id", authMiddleware, editOrderStatus);

module.exports = router;
