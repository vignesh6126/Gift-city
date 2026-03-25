const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ─────────────────────────────────────────────
// EMPANELMENT COMPLETED
// ─────────────────────────────────────────────

router.get("/completed", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM empanelment_completed ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/completed", async (req, res) => {
  const { AMC_name, products, Empanelment_date, boardings } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO empanelment_completed (AMC_name, products, Empanelment_date, boardings) VALUES (?, ?, ?, ?)",
      [AMC_name, products || null, Empanelment_date || null, boardings || null]
    );
    const [rows] = await db.query(
      "SELECT * FROM empanelment_completed WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/completed/:id", async (req, res) => {
  const { AMC_name, products, Empanelment_date, boardings } = req.body;
  try {
    await db.query(
      "UPDATE empanelment_completed SET AMC_name=?, products=?, Empanelment_date=?, boardings=? WHERE id=?",
      [AMC_name, products || null, Empanelment_date || null, boardings || null, req.params.id]
    );
    const [rows] = await db.query(
      "SELECT * FROM empanelment_completed WHERE id = ?",
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/completed/:id", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM empanelment_completed WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// EMPANELMENT PENDING
// ─────────────────────────────────────────────

router.get("/pending", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM empanelment_pending ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/pending", async (req, res) => {
  const { AMC_name, products, submission_date, status } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO empanelment_pending (AMC_name, products, submission_date, status) VALUES (?, ?, ?, ?)",
      [AMC_name, products || null, submission_date || null, status || null]
    );
    const [rows] = await db.query(
      "SELECT * FROM empanelment_pending WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/pending/:id", async (req, res) => {
  const { AMC_name, products, submission_date, status } = req.body;
  try {
    await db.query(
      "UPDATE empanelment_pending SET AMC_name=?, products=?, submission_date=?, status=? WHERE id=?",
      [AMC_name, products || null, submission_date || null, status || null, req.params.id]
    );
    const [rows] = await db.query(
      "SELECT * FROM empanelment_pending WHERE id = ?",
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/pending/:id", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM empanelment_pending WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;