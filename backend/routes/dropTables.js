// dropTables.js
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./app.db");

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS room_users");
  db.run("DROP TABLE IF EXISTS rooms");
  db.run("DROP TABLE IF EXISTS users", (err) => {
    if (err) console.error(err);
    else console.log("All tables dropped successfully!");
  });
});

db.close();
