const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { list } = require("../controllers/notificationController");
const router = express.Router();
router.use(authMiddleware, requireTenant);
router.get("/notifications", list);
module.exports = router;
