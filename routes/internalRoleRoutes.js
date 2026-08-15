const express = require("express");
const { assignRole } = require("../controllers/internalRoleController");

const router = express.Router();

router.post("/internal/assign-role", assignRole);

module.exports = router;