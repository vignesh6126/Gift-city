

const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

// GET all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — create new product
router.post("/", async (req, res) => {
  const {
    product_name,
    min_investment,
    onboarding_process,
    structure,
    lock_in,
    amc_name,
  } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO products
        (product_name, min_investment, onboarding_process, structure, lock_in, amc_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        product_name        || null,
        min_investment      || null,
        onboarding_process  || "offline",
        structure           || "outbound/cat-III",
        lock_in             || null,
        amc_name            || null,
      ]
    );
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — update existing product
router.put("/:id", async (req, res) => {
  const {
    product_name,
    min_investment,
    onboarding_process,
    structure,
    lock_in,
    amc_name,
  } = req.body;
  try {
    await db.query(
      `UPDATE products
       SET product_name=?, min_investment=?, onboarding_process=?, structure=?, lock_in=?, amc_name=?
       WHERE id=?`,
      [
        product_name        || null,
        min_investment      || null,
        onboarding_process  || "offline",
        structure           || "outbound/cat-III",
        lock_in             || null,
        amc_name            || null,
        req.params.id,
      ]
    );
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — remove a product
router.delete("/:id", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM products WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;