const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// DATABASE
const db = new Database("database.db");

/* =========================
   TABLES
========================= */

// USERS
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT
)`).run();

// BOOKINGS (DATE + TIME)
db.prepare(`
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  date TEXT,
  time TEXT
)`).run();

/* =========================
   DEFAULT ADMIN
========================= */
if (db.prepare("SELECT COUNT(*) AS c FROM users").get().c === 0) {
  db.prepare(`
    INSERT INTO users (username,password,role)
    VALUES ('admin','admin123','admin')
  `).run();
}

/* =========================
   AUTH
========================= */

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare(
    "SELECT role FROM users WHERE username=? AND password=?"
  ).get(username, password);

  if (!user) return res.json({ message: "Invalid login" });

  res.json({ role: user.role });
});

// SIGNUP
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  const exists = db.prepare(
    "SELECT * FROM users WHERE username=?"
  ).get(username);

  if (exists) return res.json({ message: "User already exists" });

  db.prepare(
    "INSERT INTO users (username,password,role) VALUES (?,?,?)"
  ).run(username, password, "user");

  res.json({ message: "Signup successful" });
});

/* =========================
   BOOK APPOINTMENT
========================= */

app.post("/book", (req, res) => {
  const { username, date, time } = req.body;

  const conflict = db.prepare(
    "SELECT * FROM bookings WHERE date=? AND time=?"
  ).get(date, time);

  if (conflict) {
    return res.json({ message: "Slot not available" });
  }

  db.prepare(
    "INSERT INTO bookings (username,date,time) VALUES (?,?,?)"
  ).run(username, date, time);

  res.json({ message: "Appointment booked successfully" });
});

/* =========================
   USER – MY APPOINTMENTS
========================= */

app.get("/my-bookings/:username", (req, res) => {
  const bookings = db.prepare(
    "SELECT date,time FROM bookings WHERE username=?"
  ).all(req.params.username);

  res.json(bookings);
});

/* =========================
   ADMIN APIs
========================= */

app.get("/admin/users", (req, res) => {
  const users = db.prepare(
    "SELECT username,password,role FROM users"
  ).all();
  res.json(users);
});

app.get("/admin/bookings", (req, res) => {
  const bookings = db.prepare(
    "SELECT username,date,time FROM bookings"
  ).all();
  res.json(bookings);
});

/* =========================
   SERVER
========================= */

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
