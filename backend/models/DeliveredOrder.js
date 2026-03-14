// models/DeliveredOrder.js
const mongoose = require("mongoose");

const deliveredOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        price: Number,
        quantity: Number,
        image: String, // Store image path for delivered order summary
      },
    ],
    totalAmount: Number,
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    adminphone: String,

    date: Date,
    status: String,
    deliveredAt: Date,
    deliveryBoyName: String,
    deliveryBoyPhone: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveredOrder", deliveredOrderSchema);
