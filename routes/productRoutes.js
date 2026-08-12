const express = require("express");
const {
  listProducts,
  addProduct,
  editProduct,
  removeProduct,
} = require("../controllers/productController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/products", listProducts);
router.post("/products", authMiddleware, addProduct);
router.put("/products/:id", authMiddleware, editProduct);
router.delete("/products/:id", authMiddleware, removeProduct);

module.exports = router;
