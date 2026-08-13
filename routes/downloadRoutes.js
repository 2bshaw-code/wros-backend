const express = require("express");
const { download } = require("../controllers/downloadController");

const router = express.Router();

router.get("/downloads/:platform", download);

module.exports = router;