const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: String, // 🆕 Store image path for order summary
      },
    ],
    adminphone: String,
 
    totalAmount: { type: Number, required: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Order Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    deliveryEstimate: { type: String },

    // 🆕 New fields for delivery assignment
    deliveryBoyName: { type: String },
    deliveryBoyPhone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
