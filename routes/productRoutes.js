const router = require("express").Router();
const productRoutes = require("../controllers/productController");
router.get("/", productRoutes.getAllProducts);
// router.post("/", productRoutes.createProduct);

module.exports = router;
