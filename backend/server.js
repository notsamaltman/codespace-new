import express from "express";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import sqlite3 from "sqlite3";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import userroutes from "./routes/userroutes.js"
import cors from "cors";



const app = express();

const db = new sqlite3.Database("./app.db");

// ===== CREATE TABLES (AUTO-MIGRATION) =====
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
      host_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});
// ========================================

app.use(
  cors({
    origin: true,
    credentials:true,
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
app.use("/rooms", roomRoutes(db));

app.use("/api/users", userroutes);

app.use(errorHandler);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
