const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(403).json("Access denied.");

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.Admin = decoded;
    next();
  } catch (error) {
    res.status(400).json("Invalid token");
  }
};
