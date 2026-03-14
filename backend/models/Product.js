//models/product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminname: {type: String},
  adminphone: {type: String},
  description: { type: String },
  mainPrice: { type: Number },
  actualPrice: { type: Number },
  rating: { type: Number },
  quantity: { type: Number },
  category: { type: String },
  images: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // store admin who created
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
