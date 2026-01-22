import express from "express";
import http from "http";
import { initSpaceSockets } from "./routes/spaceRoutes.js"; // <-- now works
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import sqlite3 from "sqlite3";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import userroutes from "./routes/userroutes.js";
import cors from "cors";

const app = express();
const db = new sqlite3.Database("./app.db");

// ---- Middleware & tables setup (unchanged) ----
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(logger);

app.use("/auth", authRoutes(db));
app.use("/rooms", roomRoutes(db));
app.use("/api/users", userroutes);
app.use(errorHandler);

// ---- Create HTTP server ----
const server = http.createServer(app);

// ---- Initialize WebSockets ----
initSpaceSockets(server);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server + WebSocket running on http://localhost:${PORT}`);
});
