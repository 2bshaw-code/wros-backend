const express = require("express");
const {
  register,
  connectBusinessWhatsapp,
  getSettings,
  updateSettings,
  initialize,
} = require("../controllers/businessController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");

const router = express.Router();

router.post("/business/register", register);
router.post("/business/init", authMiddleware, initialize);
router.use("/business", authMiddleware, requireTenant);
router.post("/business/whatsapp/connect", connectBusinessWhatsapp);
router.get("/business/settings", getSettings);
router.put("/business/settings", updateSettings);

module.exports = router;
