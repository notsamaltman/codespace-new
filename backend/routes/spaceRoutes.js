// spaceRoutes.js
import { Server } from "socket.io";

/**
 * Initialize all WebSocket logic for the server
 * @param {import('http').Server} server - HTTP server to attach Socket.IO
 */
export const initSpaceSockets = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }, // tighten in production
  });

  console.log("🟢 Socket.IO server initialized in spaceRoutes.js");

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId || socket.id} joined room ${roomId}`);
      socket.to(roomId).emit("user-joined", { userId: userId || socket.id });
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on("code-change", ({ roomId, code }) => {
      socket.to(roomId).emit("code-update", code);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  console.log("✅ spaceRoutes.js WebSocket logic active");
};
