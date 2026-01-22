import http from "http";
import { Server } from "socket.io";
import express from "express";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import sqlite3 from "sqlite3";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import userroutes from "./routes/userroutes.js";
import cors from "cors";

const app = express();
const db = new sqlite3.Database("./app.db");

// ===== Tables setup (same as your code) =====
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
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

// ===== Middleware =====
app.use(cors({ origin: true, credentials: true, methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"], allowedHeaders:["Content-Type","Authorization"] }));
app.use(express.json());
app.use(logger);

app.use("/auth", authRoutes(db));
app.use("/rooms", roomRoutes(db));
app.use("/api/users", userroutes);
app.use(errorHandler);

// ===== Create HTTP server for both HTTP + WS =====
const server = http.createServer(app);

// ===== Initialize WebSockets =====
import { initSpaceSockets } from "./routes/spaceRoutes.js";
initSpaceSockets(server, db); // pass the HTTP server

// ===== Listen =====
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server + WebSocket running on http://localhost:${PORT}`);
});
