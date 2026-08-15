const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { ownerMiddleware } = require("../middleware/ownerMiddleware");
const { overview } = require("../controllers/ownerController");

const router = express.Router();
router.use(authMiddleware, ownerMiddleware);
router.get("/owner/overview", overview);

module.exports = router;
