const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET || "sklajdlaks"; 

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];  

  try {
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
    authMiddleware
}
