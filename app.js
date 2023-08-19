require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/config");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.json({
    origin: "*",
  })
);
app.use(morgan("tiny"));
app.use("/images", express.static(path.join(__dirname, "images")));
// app.use(express.static("images"));

app.get("/", (req, res) => {
  res.json({ message: "welcome to ecommerce app" });
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));

app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

if (app.get("env") === "development") {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({ message: err.message, error: err });
  });
}

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("connected to database");
    app.listen(PORT, () => {
      console.log("server started on port 8080!");
    });
  } catch (error) {
    console.log("error: " + error.message);
  }
}

start();
