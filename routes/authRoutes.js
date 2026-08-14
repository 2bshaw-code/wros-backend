const express = require("express");
const { register, login, consoleSignIn, refresh } = require("../controllers/authController");
const { me } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/signin", login);
router.post("/auth/console/signin", consoleSignIn);
router.post("/auth/refresh", refresh);
router.get("/auth/me", authMiddleware, me);

module.exports = router;
