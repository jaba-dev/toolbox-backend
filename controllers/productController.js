const Products = require("../models/Product");
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Products.find({});
    const mappedProducts = products.map((product) => {
      product.imageURL =
        req.protocol + "://" + req.get("host") + "/images/" + product.imageURL;
      return product;
    });
    res.status(200).json(mappedProducts);
  } catch (error) {
    res
      .status(400)
      .send({ text: "something went wrong", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Products.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(400)
      .json({ text: "something went wrong", error: error.message });
  }
};
