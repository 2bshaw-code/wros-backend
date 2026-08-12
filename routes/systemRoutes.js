const express = require("express");
const { getStatusController } = require("../controllers/systemController");

const router = express.Router();

router.get("/status", getStatusController);

module.exports = router;
