console.log("auth routes file loaded");

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = "super_secret_key";

export default (db) => {

  router.post("/signup", async (req, res) => {
    const { email, username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
      [email, username, hashed],
      (err) => {
        if (err) return res.status(400).json({ error: "User exists" });
        res.json({ message: "Signup successful" });
      }
    );
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "48h" });
        res.json({ token });
      }
    );
  });

  return router;
};
