import express from "express";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import sqlite3 from "sqlite3";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js"; // <-- make sure this is correct
import userroutes from "./routes/userroutes.js";
import cors from "cors";

const app = express();
const db = new sqlite3.Database("./app.db");

// ===== CREATE TABLES =====
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      host_id INTEGER NOT NULL,
      participant_count INTEGER DEFAULT 1,
      language TEXT DEFAULT NULL,
      code TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS room_users (
      room_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
});
// ========================================

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(logger);

app.get("/test", (req, res) => {
  res.sendStatus(200);
});

app.use("/auth", authRoutes(db));
app.use("/rooms", roomRoutes(db)); // <-- fixed this

app.use("/api/users", userroutes);
app.use(errorHandler);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
