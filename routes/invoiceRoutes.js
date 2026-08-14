const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const { generate, create, edit, send, get, customer } = require("../controllers/invoiceController");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.post("/invoices/generate", generate);
router.post("/invoices", requirePermission("write"), create);
router.put("/invoices/:id", requirePermission("write"), edit);
router.post("/invoices/send", send);
router.get("/invoices/customer/:id", customer);
router.get("/invoices/:id", get);

module.exports = router;