const express = require("express");
const {
  productRecognize,
  shelfScan,
  whatsappReply,
  orderCreate,
  translate,
  analyticsOverview,
} = require("../controllers/aiController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/ai/product/recognize", authMiddleware, productRecognize);
router.post("/ai/shelf/scan", authMiddleware, shelfScan);
router.post("/ai/whatsapp/reply", authMiddleware, whatsappReply);
router.post("/ai/order/create", authMiddleware, orderCreate);
router.post("/ai/translate", authMiddleware, translate);
router.get("/ai/analytics/overview", authMiddleware, analyticsOverview);

module.exports = router;
