const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── GET all ───────────────────────────────────────────────────────────────────
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

// ── GET single ────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST add ──────────────────────────────────────────────────────────────────
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
        product_name      || null,
        min_investment    != null && min_investment !== "" ? Number(min_investment) : null,
        onboarding_process || null,
        structure          || null,
        lock_in            || null,
        amc_name           || null,
      ]
    );
    res.json({
      id: result.insertId,
      product_name,
      min_investment,
      onboarding_process,
      structure,
      lock_in,
      amc_name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT update ────────────────────────────────────────────────────────────────
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
    const [result] = await db.query(
      `UPDATE products
       SET product_name      = ?,
           min_investment    = ?,
           onboarding_process = ?,
           structure          = ?,
           lock_in            = ?,
           amc_name           = ?
       WHERE id = ?`,
      [
        product_name      || null,
        min_investment    != null && min_investment !== "" ? Number(min_investment) : null,
        onboarding_process || null,
        structure          || null,
        lock_in            || null,
        amc_name           || null,
        req.params.id,
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE ────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM products WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;