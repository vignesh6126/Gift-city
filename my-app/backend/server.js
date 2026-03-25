const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gift-city",
});

db.connect((err) => {
  if (err) {
    console.log("❌ DB Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// 📊 Stats for dashboard cards
app.get("/api/stats/invested", (req, res) => {
  const queries = {
    total: "SELECT COUNT(*) AS count FROM invested_completed",
    thisMonth: `SELECT COUNT(*) AS count FROM invested_completed 
                WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
    totalValue: "SELECT SUM(amount) AS total FROM invested_completed",
  };

  Promise.all([
    new Promise((resolve, reject) =>
      db.query(queries.total, (err, r) => err ? reject(err) : resolve(r[0].count))),
    new Promise((resolve, reject) =>
      db.query(queries.thisMonth, (err, r) => err ? reject(err) : resolve(r[0].count))),
    new Promise((resolve, reject) =>
      db.query(queries.totalValue, (err, r) => err ? reject(err) : resolve(r[0].total || 0))),
  ])
    .then(([total, thisMonth, totalValue]) => {
      res.json({ total, thisMonth, totalValue });
    })
    .catch((err) => res.json({ status: "error", message: err }));
});

app.get("/api/stats/empanelment", (req, res) => {
  // Replace with your actual empanelment table name
  db.query("SELECT COUNT(*) AS count FROM empanelment", (err, r) => {
    if (err) return res.json({ status: "error", message: err });
    res.json({ total: r[0].count });
  });
});

app.get("/api/stats/interested", (req, res) => {
  // Replace with your actual interested/leads table name
  db.query("SELECT COUNT(*) AS count FROM interested", (err, r) => {
    if (err) return res.json({ status: "error", message: err });
    res.json({ total: r[0].count });
  });
});


// 🔐 REGISTER API (creates user with hashed password)
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        return res.json({ status: "error", message: err });
      }

      res.json({ status: "success", message: "User registered" });
    });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});


// 🔐 LOGIN API (compare hashed password)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.json({ status: "error", message: err });

    if (result.length > 0) {
      const user = result[0];

      // ✅ Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        res.json({
          status: "success",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      } else {
        res.json({
          status: "error",
          message: "Wrong password",
        });
      }
    } else {
      res.json({
        status: "error",
        message: "User not found",
      });
    }
  });
});


// 🚀 Start server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});