const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ─────────────────────────────────────────────
// GIFT CITY A/C — ACTIVE
// ─────────────────────────────────────────────

router.get("/active", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gift_city_ac_active ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GET /active error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/active", async (req, res) => {
  const { customer_name, bank_name, opened_date } = req.body;
  console.log("POST /gift-city/active body:", req.body);
  try {
    const [result] = await db.query(
      "INSERT INTO gift_city_ac_active (customer_name, bank_name, opened_date) VALUES (?, ?, ?)",
      [customer_name || null, bank_name || null, opened_date || null]
    );
    const [rows] = await db.query(
      "SELECT * FROM gift_city_ac_active WHERE id = ?", [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /gift-city/active error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put("/active/:id", async (req, res) => {
  const { customer_name, bank_name, opened_date } = req.body;
  try {
    await db.query(
      "UPDATE gift_city_ac_active SET customer_name=?, bank_name=?, opened_date=? WHERE id=?",
      [customer_name, bank_name || null, opened_date || null, req.params.id]
    );
    const [rows] = await db.query(
      "SELECT * FROM gift_city_ac_active WHERE id = ?", [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /gift-city/active error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/active/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM gift_city_ac_active WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /gift-city/active error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GIFT CITY A/C — INACTIVE
// ─────────────────────────────────────────────

router.get("/inactive", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gift_city_ac_inactive ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GET /inactive error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/inactive", async (req, res) => {
  const { customer_name, bank_name, delay_reason } = req.body;
  console.log("POST /gift-city/inactive body:", req.body);
  try {
    const [result] = await db.query(
      "INSERT INTO gift_city_ac_inactive (customer_name, bank_name, delay_reason) VALUES (?, ?, ?)",
      [customer_name || null, bank_name || null, delay_reason || null]
    );
    const [rows] = await db.query(
      "SELECT * FROM gift_city_ac_inactive WHERE id = ?", [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /gift-city/inactive error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put("/inactive/:id", async (req, res) => {
  const { customer_name, bank_name, delay_reason } = req.body;
  try {
    await db.query(
      "UPDATE gift_city_ac_inactive SET customer_name=?, bank_name=?, delay_reason=? WHERE id=?",
      [customer_name, bank_name || null, delay_reason || null, req.params.id]
    );
    const [rows] = await db.query(
      "SELECT * FROM gift_city_ac_inactive WHERE id = ?", [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /gift-city/inactive error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/inactive/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM gift_city_ac_inactive WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /gift-city/inactive error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;