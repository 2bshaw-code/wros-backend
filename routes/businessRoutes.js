const express = require("express");
const {
  register,
  connectBusinessWhatsapp,
  getSettings,
  updateSettings,
} = require("../controllers/businessController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");

const router = express.Router();

router.post("/business/register", register);
router.use(authMiddleware, requireTenant);
router.post("/business/whatsapp/connect", connectBusinessWhatsapp);
router.get("/business/settings", getSettings);
router.put("/business/settings", updateSettings);

module.exports = router;
