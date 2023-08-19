const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: String,
  imageURL: String,
  categories: Array,
  brand: String,
  articleNumber: String,
  specifications: Object,
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
