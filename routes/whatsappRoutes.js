const express = require("express");
const {
  receiveIncomingMessage,
  getCustomerConversation,
  createTemplateHandler,
  listTemplatesHandler,
  scheduleBroadcastHandler,
  sendMessageHandler,
  aiReplyHandler,
  riderStatusHandler,
} = require("../controllers/whatsappController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireTenant } = require("../middleware/tenantMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const router = express.Router();

router.post("/whatsapp/incoming", receiveIncomingMessage);
router.use(authMiddleware, requireTenant);
router.get("/whatsapp/messages/:customerId", getCustomerConversation);
router.post("/whatsapp/send", requirePermission("write"), sendMessageHandler);
router.post("/whatsapp/templates", createTemplateHandler);
router.get("/whatsapp/templates", listTemplatesHandler);
router.post("/whatsapp/broadcasts", scheduleBroadcastHandler);
router.post("/whatsapp/ai-reply", aiReplyHandler);
router.post("/whatsapp/rider-status", riderStatusHandler);

module.exports = router;
