const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { generate, send, get, customer } = require("../controllers/invoiceController");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.post("/invoices/generate", generate);
router.post("/invoices/send", send);
router.get("/invoices/customer/:id", customer);
router.get("/invoices/:id", get);

module.exports = router;