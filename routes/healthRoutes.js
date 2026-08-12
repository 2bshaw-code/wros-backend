const express = require("express");
const { getHealthController } = require("../controllers/healthController");

const router = express.Router();

router.get("/health", getHealthController);

module.exports = router;
