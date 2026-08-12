const express = require("express");
const { receiveIncomingMessage, getCustomerConversation } = require("../controllers/whatsappController");

const router = express.Router();

router.post("/whatsapp/incoming", receiveIncomingMessage);
router.get("/whatsapp/messages/:customerId", getCustomerConversation);

module.exports = router;
