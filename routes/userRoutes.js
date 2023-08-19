const express = require("express");
const User = require("../controllers/userController");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

router.post("/subscribe", User.sendEmail);
router.post("/retrieve-cart", verifyToken, User.getCart);
router.post("/merge-carts", verifyToken, User.mergeCarts);
router.post("/signup", User.create);
router.post("/login", User.login);
router.post("/update-cart", verifyToken, User.updateCart);

module.exports = router;
