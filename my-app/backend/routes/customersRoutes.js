const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ─────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────

// GET all customers
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM customers ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE customer (PAN removed)
router.post("/", async (req, res) => {
  const { customer_name, amount_invested, esops_rsus_stocks, gift_city_ac } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO customers (customer_name, amount_invested, esops_rsus_stocks, gift_city_ac) VALUES (?, ?, ?, ?)",
      [customer_name, amount_invested || null, esops_rsus_stocks || "no", gift_city_ac || "no"]
    );

    const [rows] = await db.query(
      "SELECT * FROM customers WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE customer (PAN removed)
router.put("/:id", async (req, res) => {
  const { customer_name, amount_invested, esops_rsus_stocks, gift_city_ac } = req.body;

  try {
    await db.query(
      "UPDATE customers SET customer_name=?, amount_invested=?, esops_rsus_stocks=?, gift_city_ac=? WHERE id=?",
      [customer_name, amount_invested || null, esops_rsus_stocks || "no", gift_city_ac || "no", req.params.id]
    );

    const [rows] = await db.query(
      "SELECT * FROM customers WHERE id = ?",
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE customer
router.delete("/:id", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM customers WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;