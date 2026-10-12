const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found. Token invalid." });
      }

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);
      return res.status(401).json({ message: "Not authorized, token verification failed." });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }
};

module.exports = { protect };
