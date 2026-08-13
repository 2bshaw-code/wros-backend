const express = require("express");
const { getStatusController, getWeatherController } = require("../controllers/systemController");

const router = express.Router();

router.get("/status", getStatusController);
router.get("/system/weather", getWeatherController);

module.exports = router;
