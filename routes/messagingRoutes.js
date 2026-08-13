const express = require("express");
const { receiveProviderMessage } = require("../controllers/messagingController");

const router = express.Router();

router.post("/messaging/:provider/inbound", receiveProviderMessage);

module.exports = router;