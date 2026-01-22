import express from "express";
import { v4 as uuid } from "uuid";
import auth from "../middleware/auth.js";

const router = express.Router();

export default (db) => {

  router.post("/create", auth, (req, res) => {
    const roomId = uuid();

    db.run(
      "INSERT INTO rooms (id, host_id) VALUES (?, ?)",
      [roomId, req.user.id],
      () => res.json({ roomId })
    );
  });

  router.post("/join", auth, (req, res) => {
    const { roomId } = req.body;

    db.get(
      "SELECT * FROM rooms WHERE id = ?",
      [roomId],
      (err, room) => {
        if (!room) return res.status(404).json({ error: "Room not found" });
        res.json({ message: "Joined room", roomId });
      }
    );
  });

  return router;
};
