const Product = require("../models/Product");
const Admin = require("../models/Admin");
const cloudinary = require("cloudinary").v2;
const pLimit = require("p-limit");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add product
exports.addProduct = async (req, res) => {
  try {
    const { images, ...rest } = req.body;
    let imgUrls = [];

    if (images && images.length > 0) {
      const limit = pLimit(2);
      const uploads = images.map(img => limit(() => cloudinary.uploader.upload(img)));
      const results = await Promise.all(uploads);
      imgUrls = results.map(r => r.secure_url);
    }

 const admin = await Admin.findById(req.admin._id);
    const product = new Product({ ...rest, images: imgUrls, createdBy: req.admin._id, location: admin.location,adminname: admin.name,adminphone: admin.phone});
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products of logged-in admin
exports.getMyProducts = async (req, res) => {
  const products = await Product.find({ createdBy: req.admin._id });
  res.json(products);
};

// Edit product
exports.editProduct = async (req, res) => {
  try {
    const { images, ...rest } = req.body;
    if (images && images.length > 0) {
      const limit = pLimit(2);
      const uploads = images.map(img => limit(() => cloudinary.uploader.upload(img)));
      const results = await Promise.all(uploads);
      rest.images = results.map(r => r.secure_url);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, rest, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
