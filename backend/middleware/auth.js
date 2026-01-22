import jwt from "jsonwebtoken";

const SECRET = "super_secret_key";

export default function auth(req, res, next) {
  // Expect header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Malformed token" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // attach user info to request
    req.user = decoded;
    next();
  });
}
