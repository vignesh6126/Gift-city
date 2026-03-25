const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── GET all ───────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM customers_interested ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST add ──────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { client_name, last_meeting, next_meeting, invested } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO customers_interested (client_name, last_meeting, next_meeting, invested) VALUES (?, ?, ?, ?)",
      [client_name, last_meeting || null, next_meeting || null, invested || "no"]
    );
    res.json({ id: result.insertId, client_name, last_meeting, next_meeting, invested });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT update ────────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { client_name, last_meeting, next_meeting, invested } = req.body;
  try {
    await db.query(
      "UPDATE customers_interested SET client_name=?, last_meeting=?, next_meeting=?, invested=? WHERE id=?",
      [client_name, last_meeting || null, next_meeting || null, invested || "no", req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE ────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM customers_interested WHERE id=?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;