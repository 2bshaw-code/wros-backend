const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { getSettingsHandler, updateSettingsHandler } = require("../controllers/settingsController");

const router = express.Router();
router.use(authMiddleware, requireTenant);
router.get("/settings", getSettingsHandler);
router.patch("/settings", updateSettingsHandler);

module.exports = router;