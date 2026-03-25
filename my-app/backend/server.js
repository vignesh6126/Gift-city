const express = require("express");
const cors    = require("cors");
const bcrypt  = require("bcrypt");
const db      = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ── Mount routes ───────────────────────────────────────────────────────────────
const investedRoutes   = require("./routes/investedRoutes");
const interestedRoutes = require("./routes/interestedRoutes");

console.log("Routes loaded");

app.use("/api/invested",   investedRoutes);
app.use("/api/interested", interestedRoutes);

// Test route
app.get("/test", (req, res) => res.send("Test route works"));

console.log("Routes mounted");

// ── Stats: invested ────────────────────────────────────────────────────────────
app.get("/api/stats/invested", async (req, res) => {
  try {
    const [totalResult]      = await db.query("SELECT COUNT(*) AS count FROM customers_completed");
    const [thisMonthResult]  = await db.query(
      "SELECT COUNT(*) AS count FROM customers_completed WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())"
    );
    const [totalValueResult] = await db.query("SELECT SUM(amount) AS total FROM customers_completed");

    res.json({
      total:      totalResult[0].count,
      thisMonth:  thisMonthResult[0].count,
      totalValue: totalValueResult[0].total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stats: empanelment ─────────────────────────────────────────────────────────
app.get("/api/stats/empanelment", async (req, res) => {
  try {
    const [result] = await db.query("SELECT COUNT(*) AS count FROM empanelment");
    res.json({ total: result[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stats: interested ──────────────────────────────────────────────────────────
app.get("/api/stats/interested", async (req, res) => {
  try {
    const [result] = await db.query("SELECT COUNT(*) AS count FROM customers_interested");
    res.json({ total: result[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Register ───────────────────────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    res.json({ status: "success", message: "User registered" });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

// ── Login ──────────────────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM users WHERE email = ?", [req.body.email]);
    if (result.length === 0)
      return res.json({ status: "error", message: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, result[0].password);
    if (isMatch) {
      res.json({
        status: "success",
        user: { id: result[0].id, name: result[0].name, email: result[0].email },
      });
    } else {
      res.json({ status: "error", message: "Wrong password" });
    }
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});