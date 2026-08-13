const express = require("express");
const {
  createCustomer,
  createSubscriptionRoute,
  webhook,
  updateBilling,
  generateInvoiceHandler,
  listInvoicesHandler,
  issueLicenseHandler,
  verifyLicenseHandler,
  listPlansHandler,
} = require("../controllers/billingController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");

const router = express.Router();

router.post("/billing/webhook", webhook);
router.use(authMiddleware, requireTenant);
router.get("/billing/plans", listPlansHandler);
router.post("/billing/create-customer", createCustomer);
router.post("/billing/create-subscription", createSubscriptionRoute);
router.put("/billing/update-business", updateBilling);
router.post("/billing/generate-invoice", generateInvoiceHandler);
router.get("/billing/invoices", listInvoicesHandler);
router.post("/billing/license/issue", issueLicenseHandler);
router.post("/billing/license/verify", verifyLicenseHandler);

module.exports = router;
