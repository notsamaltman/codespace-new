// spaceRoutes.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = "super_secret_key"; // Make sure to use your real secret

const COLORS = [
  "#ef4444", "#22c55e", "#3b82f6",
  "#a855f7", "#f97316", "#06b6d4"
];

const getColorFromId = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};


/**
 * Initialize all WebSocket logic for the server
 * @param {import('http').Server} server - HTTP server to attach Socket.IO
 */
export const initSpaceSockets = (server, db) => {

  const io = new Server(server, {
    cors: { origin: "*" },
  });

  console.log("🟢 Socket.IO server initialized in spaceRoutes.js");

  // ---- In-memory rooms store ----
  // roomId => { code, language, participants, chat, codeHistory }
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Helper: decode JWT from socket auth
    const getUsernameFromToken = (token) => {
  return new Promise((resolve) => {
    try {
      if (!token) return resolve("Anonymous");

      const decoded = jwt.verify(token, JWT_SECRET);

      db.get(
        "SELECT username FROM users WHERE id = ?",
        [decoded.id],
        (err, row) => {
          if (err || !row) {
            resolve("Anonymous");
          } else {
            resolve(row.username); // ✅ STRING ONLY
          }
        }
      );
    } catch (err) {
      resolve("Anonymous");
    }
  });
};



    // ------------------------------
    // Join a room
    // ------------------------------
    socket.on("join-room", async ({ roomId, token }) => {
  const name = await getUsernameFromToken(token); // ✅ NOW A STRING
  const userId = socket.id;

  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: "",
      language: "python",
      participants: new Map(),
      chat: [],
      codeHistory: [],
    });
  }

  const room = rooms.get(roomId);
  room.participants.set(userId, {
  cursor: { line: 0, ch: 0 },
  name,
  color: getColorFromId(userId),
});


  socket.join(roomId);

  socket.emit("room-state", {
    code: room.code,
    language: room.language,
    participants: Array.from(room.participants.entries()).map(
  ([uid, info]) => ({
    userId: uid,
    name: info.name,
    color: info.color,
    cursor: info.cursor,
  })
),

    chat: room.chat,
    codeHistory: room.codeHistory,
  });

  socket.to(roomId).emit("user-joined", { userId, name });
});


    // ------------------------------
    // Leave a room
    // ------------------------------
    socket.on("leave-room", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const userId = socket.id;
      room.participants.delete(userId);
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { userId });
    });

    // ------------------------------
    // Code change
    // ------------------------------
    socket.on("code-change", ({ roomId, code }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const userId = socket.id;
      room.code = code;
      room.codeHistory.push({ code, timestamp: Date.now(), userId });

      socket.to(roomId).emit("code-update", { code, userId });
    });

    // ------------------------------
    // Cursor movement
    // ------------------------------
    socket.on("cursor-move", ({ roomId, cursor }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const userId = socket.id;
      const participant = room.participants.get(userId);
      if (participant) {
        participant.cursor = cursor;
        socket.to(roomId).emit("cursor-update", { userId, cursor });
      }
    });

    // ------------------------------
    // Chat messages
    // ------------------------------
    socket.on("chat-message", ({ roomId, message }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const userId = socket.id;
      const participant = room.participants.get(userId);
      const name = participant?.name || "Anonymous";

      const chatMessage = { userId, name, message, timestamp: Date.now() };
      room.chat.push(chatMessage);

      io.to(roomId).emit("chat-message", chatMessage);
    });

    socket.on("cursor-sync", ({ roomId, cursor }) => {
  const room = rooms.get(roomId);
  if (!room) return;

  const userId = socket.id;
  const participant = room.participants.get(userId);
  if (!participant) return;

  participant.cursor = cursor;

  socket.to(roomId).emit("cursor-batch-update", {
    userId,
    cursor,
    color: participant.color,
    name: participant.name,
  });
});


    // ------------------------------
    // Disconnect
    // ------------------------------
    socket.on("disconnect", () => {
      const userId = socket.id;
      rooms.forEach((room, roomId) => {
        if (room.participants.has(userId)) {
          room.participants.delete(userId);
          socket.to(roomId).emit("user-left", { userId });
        }
      });
    });
  });

  console.log("✅ spaceRoutes.js WebSocket logic active");
};
