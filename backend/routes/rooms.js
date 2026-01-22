import express from "express";
import { v4 as uuid } from "uuid";
import auth from "../middleware/auth.js";

const router = express.Router();

export default (db) => {
  // ===== Create Room =====
  router.post("/create", auth, (req, res) => {
  const { name } = req.body;
  const hostId = req.user?.id;

  console.log("Creating room by user:", req.user); // debug

  if (!name) return res.status(400).json({ error: "Room name required" });
  if (!hostId) return res.status(400).json({ error: "Invalid user" });

  const roomId = uuid();
  const participantCount = 1;

  db.run(
    `INSERT INTO rooms (id, name, host_id, participant_count) VALUES (?, ?, ?, ?)`,
    [roomId, name, hostId, participantCount],
    function (err) {
      if (err) {
        console.error("DB Error inserting room:", err.message);
        return res.status(500).json({ error: err.message });
      }

      db.run(
        `INSERT INTO room_users (room_id, user_id) VALUES (?, ?)`,
        [roomId, hostId],
        function (err2) {
          if (err2) {
            console.error("DB Error inserting room_users:", err2.message);
            return res.status(500).json({ error: err2.message });
          }

          res.status(201).json({
            id: roomId,
            name,
            host_id: hostId,
            participant_count: participantCount,
            language: null,
            code: null,
          });
        }
      );
    }
  );
});


  // ===== Join Room =====
  router.post("/join", auth, (req, res) => {
    const { roomId } = req.body;
    const userId = req.user.id; // get userId from JWT

    if (!roomId) return res.status(400).json({ error: "Room ID is required" });

    db.get("SELECT * FROM rooms WHERE id = ?", [roomId], (err, room) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!room) return res.status(404).json({ error: "Room not found" });

      db.run(
        "INSERT OR IGNORE INTO room_users (room_id, user_id) VALUES (?, ?)",
        [roomId, userId],
        function (err2) {
          if (err2) return res.status(500).json({ error: "Failed to join room" });

          db.run(
            "UPDATE rooms SET participant_count = participant_count + 1 WHERE id = ?",
            [roomId],
            function (err3) {
              if (err3) return res.status(500).json({ error: "Failed to update participant count" });

              res.json({ roomId });
            }
          );
        }
      );
    });
  });

  router.get("/user", auth, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT r.*, 
           CASE WHEN r.host_id = ? THEN 'owner' ELSE 'member' END as role
    FROM rooms r
    JOIN room_users ru ON r.id = ru.room_id
    WHERE ru.user_id = ?
  `;

  db.all(query, [userId, userId], (err, rows) => {
    if (err) {
      console.error("DB Error fetching rooms:", err);
      return res.status(500).json({ error: "Failed to fetch rooms" }); // ✅ must use res.json
    }

    const classrooms = rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role, // owner/member
      participantCount: r.participant_count,
      language: r.language,
      code: r.code,
    }));

    console.log("Sending rooms:", classrooms); // log to debug
    res.json(classrooms); // ✅ must send JSON, not res.send()
  });
});


  return router;
};
