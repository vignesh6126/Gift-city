const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ─────────────────────────────────────────────
// CUSTOMERS COMPLETED
// ─────────────────────────────────────────────

router.get("/completed", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers_completed ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/completed", async (req, res) => {
  const { client_name, first_investment, amount, scheme, bank } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO customers_completed (client_name, first_investment, amount, scheme, bank) VALUES (?, ?, ?, ?, ?)",
      [client_name, first_investment, amount, scheme, bank]
    );
    const [rows] = await db.query("SELECT * FROM customers_completed WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/completed/:id", async (req, res) => {
  const { client_name, first_investment, amount, scheme, bank } = req.body;
  try {
    await db.query(
      "UPDATE customers_completed SET client_name=?, first_investment=?, amount=?, scheme=?, bank=? WHERE id=?",
      [client_name, first_investment, amount, scheme, bank, req.params.id]
    );
    const [rows] = await db.query("SELECT * FROM customers_completed WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/completed/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM customers_completed WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// CUSTOMERS PENDING
// ─────────────────────────────────────────────

router.get("/pending", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers_pending ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/pending", async (req, res) => {
  const { client_name, amount_tobe_invested, scheme, bank, submission_date, status } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO customers_pending (client_name, amount_tobe_invested, scheme, bank, submission_date, status) VALUES (?, ?, ?, ?, ?, ?)",
      [client_name, amount_tobe_invested, scheme, bank, submission_date, status]
    );
    const [rows] = await db.query("SELECT * FROM customers_pending WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/pending/:id", async (req, res) => {
  const { client_name, amount_tobe_invested, scheme, bank, submission_date, status } = req.body;
  try {
    await db.query(
      "UPDATE customers_pending SET client_name=?, amount_tobe_invested=?, scheme=?, bank=?, submission_date=?, status=? WHERE id=?",
      [client_name, amount_tobe_invested, scheme, bank, submission_date, status, req.params.id]
    );
    const [rows] = await db.query("SELECT * FROM customers_pending WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/pending/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM customers_pending WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;