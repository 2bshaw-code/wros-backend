const express = require("express");
const { getProducts, getOrders, getCustomers } = require("../controllers/dataController");

const router = express.Router();

router.get("/products", getProducts);
router.get("/orders", getOrders);
router.get("/customers", getCustomers);

module.exports = router;
