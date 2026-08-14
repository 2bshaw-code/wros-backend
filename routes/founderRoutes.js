const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { founderMiddleware } = require("../middleware/founderMiddleware");
const { health, system, logs, configSummary, bobAsk, action } = require("../controllers/founderController");

const router = express.Router();
router.use(authMiddleware, founderMiddleware);
router.get("/founder/health/overview", health);
router.get("/founder/health/system", system);
router.get("/founder/health/config", configSummary);
router.get("/founder/logs", logs);
router.post("/founder/bob/ask", bobAsk);
router.post("/founder/actions/health-check", action("health-check"));
router.post("/founder/actions/cache-clear", action("cache-clear"));
router.post("/founder/actions/test-probe", action("test-probe"));
router.post("/founder/actions/seed-test-merchant", action("seed-test-merchant"));
router.post("/founder/actions/migration", action("migration"));
router.post("/founder/actions/build", action("frontend-build"));
router.post("/founder/actions/restart", action("backend-restart"));

module.exports = router;