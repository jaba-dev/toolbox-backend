const mongoose = require("mongoose");

function connectDB(url) {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
module.exports = connectDB;
