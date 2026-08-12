const express = require("express");
const { addCustomer, listCustomerItems, getCustomerByPhone } = require("../controllers/customerController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/customers", listCustomerItems);
router.get("/customers/phone/:phone", getCustomerByPhone);
router.post("/customers", authMiddleware, addCustomer);

module.exports = router;
