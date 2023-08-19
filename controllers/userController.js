const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const secret = process.env.SECRET;
const nodemailer = require("nodemailer");

exports.create = async (req, res) => {
  try {
    const requiredFields = ["username", "password", "email"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "Required fields missing",
        missingFields,
      });
    } else {
      const existingUser = await User.findOne({
        $or: [{ username: req.body.username }, { email: req.body.email }],
      });

      if (existingUser) {
        return res
          .status(409)
          .json({ message: "This user or email already exists!" });
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = await User.create({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
        });
        res.status(201).json({ message: "Success!", user });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const foundUser = await User.findOne({
      email: req.body.email,
    });

    if (!foundUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const userStatus = await bcrypt.compare(
      req.body.password,
      foundUser.password
    );

    if (!userStatus || req.body.email !== foundUser.email) {
      return res.status(401).json({ message: "Incorrect password or email" });
    }

    jwt.sign({ foundUser }, secret, { expiresIn: "15m" }, (err, token) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error generating token", error: err.message });
      }
      res.status(200).json({
        message: "User logged in successfully",
        user: foundUser,
        token: token,
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const newCart = req.body.cartItems;
    const userId = req.body.userId;

    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedCart = [];
    newCart.forEach((newItem) => {
      const existingItemIndex = foundUser.cart.findIndex(
        (item) => item.articleNumber === newItem.articleNumber
      );
      if (existingItemIndex !== -1) {
        updatedCart.push({
          ...foundUser.cart[existingItemIndex],
          quantity: newItem.quantity,
        });
      } else {
        updatedCart.push(newItem);
      }
    });
    foundUser.cart = updatedCart;
    const savedUser = await foundUser.save();
    res.status(200).json({
      message: "Cart updated successfully",
      updatedUser: savedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.body.userId;
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "user cart",
      cart: foundUser.cart,
      user: foundUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};

exports.mergeCarts = async (req, res) => {
  try {
    const newCart = req.body.cartItems;
    const userId = req.body.userId;
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const mergedCart = [];
    foundUser.cart.forEach((existingItem) => {
      const matchingNewItem = newCart.find(
        (newItem) => newItem.articleNumber === existingItem.articleNumber
      );
      if (matchingNewItem) {
        mergedCart.push({
          ...existingItem,
          quantity: existingItem.quantity + matchingNewItem.quantity,
        });
      } else {
        mergedCart.push(existingItem);
      }
    });
    newCart.forEach((newItem) => {
      const existingItem = foundUser.cart.find(
        (item) => item.articleNumber === newItem.articleNumber
      );
      if (!existingItem) {
        mergedCart.push(newItem);
      }
    });
    foundUser.cart = mergedCart;
    const savedUser = await foundUser.save();
    res.status(200).json({
      message: "Cart updated successfully",
      updatedUser: savedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};

exports.sendEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Newsletter Subscription Confirmation",
      html: "Thank you for subscribing to our newsletter!",
    };
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "You have successfully subscribed to our newsletter!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while sending the email." });
  }
};
