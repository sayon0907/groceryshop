const express = require("express");
const router = express.Router();
const auth= require("../middleware/productmiddle"); // ✅ gets the actual function
const {
  addProduct,
  editProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/productController");

router.post("/", auth, addProduct);
router.get("/", auth, getMyProducts);
router.put("/:id", auth, editProduct);
router.delete("/:id", auth, deleteProduct);

module.exports = router;
