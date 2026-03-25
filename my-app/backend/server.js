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