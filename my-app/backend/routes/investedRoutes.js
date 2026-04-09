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
  const { client_name, first_investment, amount, scheme, amc_name, bank } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO customers_completed (client_name, first_investment, amount, scheme, amc_name, bank) VALUES (?, ?, ?, ?, ?, ?)",
      [client_name, first_investment, amount, scheme, amc_name, bank]
    );
    const [rows] = await db.query("SELECT * FROM customers_completed WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/completed/:id", async (req, res) => {
  const { client_name, first_investment, amount, scheme, amc_name, bank } = req.body;
  try {
    await db.query(
      "UPDATE customers_completed SET client_name=?, first_investment=?, amount=?, scheme=?, amc_name=?, bank=? WHERE id=?",
      [client_name, first_investment, amount, scheme, amc_name, bank, req.params.id]
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
  const { client_name, amount_tobe_invested, scheme, amc_name, bank, submission_date, status } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO customers_pending (client_name, amount_tobe_invested, scheme, amc_name, bank, submission_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [client_name, amount_tobe_invested, scheme, amc_name, bank, submission_date, status]
    );
    const [rows] = await db.query("SELECT * FROM customers_pending WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/pending/:id", async (req, res) => {
  const { client_name, amount_tobe_invested, scheme, amc_name, bank, submission_date, status } = req.body;
  try {
    await db.query(
      "UPDATE customers_pending SET client_name=?, amount_tobe_invested=?, scheme=?, amc_name=?, bank=?, submission_date=?, status=? WHERE id=?",
      [client_name, amount_tobe_invested, scheme, amc_name, bank, submission_date, status, req.params.id]
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
router.post("/move/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // 1. Get pending record
    const [pendingRows] = await db.query(
      "SELECT * FROM customers_pending WHERE id = ?",
      [id]
    );

    if (pendingRows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const p = pendingRows[0];

    // 2. INSERT into customers_completed (same as your current POST)
    await db.query(
      `INSERT INTO customers_completed 
      (client_name, first_investment, amount, scheme, amc_name, bank)
      VALUES (?, CURDATE(), ?, ?, ?, ?)`,
      [p.client_name, p.amount_tobe_invested, p.scheme, p.amc_name, p.bank]
    );

    // 3. UPDATE customers table (ONLY NEW PART 🔥)
    const [existing] = await db.query(
      "SELECT * FROM customers WHERE customer_name = ?",
      [p.client_name]
    );

    if (existing.length > 0) {
      await db.query(
  `UPDATE customers 
   SET amount_invested = ?
   WHERE customer_name = ?`,
  [p.amount_tobe_invested, p.client_name]
);
    } else {
      await db.query(
        `INSERT INTO customers (customer_name, amount_invested)
         VALUES (?, ?)`,
        [p.client_name, p.amount_tobe_invested]
      );
    }

    // 4. DELETE from pending (you already had this logic)
    await db.query(
      "DELETE FROM customers_pending WHERE id = ?",
      [id]
    );

    res.json({ message: "Moved + Updated customers" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;