const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { founderMiddleware } = require("../middleware/founderMiddleware");
const { forecast, optimise, anomaly, security } = require("../controllers/quantumController");

const router = express.Router();
router.use(authMiddleware, founderMiddleware);
router.post("/quantum/forecast", forecast);
router.post("/quantum/optimise", optimise);
router.post("/quantum/anomaly", anomaly);
router.post("/quantum/security", security);
module.exports = router;