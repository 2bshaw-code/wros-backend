const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { customerProfile, updateProfile, segments } = require("../controllers/crmController");

const router = express.Router();

router.use(authMiddleware, requireTenant);
router.get("/crm/customers/:customerId", customerProfile);
router.put("/crm/customers/:customerId", updateProfile);
router.get("/crm/segments", segments);

module.exports = router;