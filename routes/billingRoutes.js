const express = require("express");
const {
  createCustomer,
  createSubscriptionRoute,
  webhook,
  updateBilling,
} = require("../controllers/billingController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/billing/create-customer", authMiddleware, createCustomer);
router.post("/billing/create-subscription", authMiddleware, createSubscriptionRoute);
router.post("/billing/webhook", webhook);
router.put("/billing/update-business", authMiddleware, updateBilling);

module.exports = router;
