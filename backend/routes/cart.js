// routes/cart.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authMiddleware } = require("../middleware/auth");

// 🟢 GET user cart based on location
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const userId = req.user._id;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location required" });
    }

    // Find cart for this user and location
    const cart = await Cart.findOne({
      userId,
      "location.lat": parseFloat(lat),
      "location.lng": parseFloat(lng),
    }).populate("products.productId");

    if (!cart) {
      return res.json({
        products: [],
        location: { lat: parseFloat(lat), lng: parseFloat(lng), address: "" },
      });
    }

    // ✅ Include address in the response
    res.json({
      products: cart.products,
      location: {
        lat: cart.location.lat,
        lng: cart.location.lng,
        address: cart.location.address || "",
      },
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 Add product to cart
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, lat, lng, address, quantity = 1 } = req.body;
    const userId = req.user._id;
console.log(address);

    if (!productId || !lat || !lng) {
      return res.status(400).json({ message: "Product ID and location required" });
    }

    let cart = await Cart.findOne({
      userId,
      "location.lat": parseFloat(lat),
      "location.lng": parseFloat(lng),
    });

    if (!cart) {
      // 🟢 Create new cart with address
      cart = new Cart({
        userId,
        location: { lat, lng, address: address || "Not provided" },
        products: [],
      });
    } else if (address && (!cart.location.address || cart.location.address !== address)) {
      // 🟢 Update address if changed or empty
      cart.location.address = address;
    }

    // 🟢 Add or update product
    const existingItem = cart.products.find(
      (p) => p.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();

    const populatedCart = await cart.populate("products.productId");
    res.json(populatedCart);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 Remove product
router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const { productId, lat, lng } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({
      userId,
      "location.lat": parseFloat(lat),
      "location.lng": parseFloat(lng),
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    res.json(await cart.populate("products.productId"));
  } catch (err) {
    console.error("Error removing product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Set quantity
router.post("/set-quantity", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, lat, lng } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({
      userId,
      "location.lat": parseFloat(lat),
      "location.lng": parseFloat(lng),
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find(
      (p) => p.productId.toString() === productId
    );
    if (item) item.quantity = quantity;

    await cart.save();
    res.json(await cart.populate("products.productId"));
  } catch (err) {
    console.error("Error updating quantity:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Clear cart
router.post("/clear", authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user._id;

    await Cart.findOneAndDelete({
      userId,
      "location.lat": parseFloat(lat),
      "location.lng": parseFloat(lng),
    });

    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
