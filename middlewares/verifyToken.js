const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;

const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Unauthorized!" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach decoded user information to the request object
    next();
  } catch (err) {
    res
      .status(403)
      .json({ message: "Token verification failed", error: err.message });
  }
};

module.exports = verifyToken;
