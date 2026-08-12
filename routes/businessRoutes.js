const express = require("express");
const {
  register,
  connectBusinessWhatsapp,
  getSettings,
  updateSettings,
} = require("../controllers/businessController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/business/register", register);
router.post("/business/whatsapp/connect", authMiddleware, connectBusinessWhatsapp);
router.get("/business/settings", authMiddleware, getSettings);
router.put("/business/settings", authMiddleware, updateSettings);

module.exports = router;
