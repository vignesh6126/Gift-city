const express = require("express");
const router  = express.Router();
const db      = require("../db");

router.get("/all", async (req, res) => {
  try {
    const results = await Promise.allSettled([
      db.query("SELECT COUNT(*) AS cnt FROM empanelment_completed"),
      db.query("SELECT COUNT(*) AS cnt FROM empanelment_pending"),
      db.query("SELECT COUNT(*) AS cnt FROM customers_completed"),
      db.query("SELECT COUNT(*) AS cnt FROM customers_pending"),
      db.query("SELECT COUNT(*) AS cnt FROM gift_city_ac_active"),
      db.query("SELECT COUNT(*) AS cnt FROM gift_city_ac_inactive"),
      db.query("SELECT COUNT(*) AS cnt FROM customers_interested"),
    ]);

    const getCount = (result) => {
      if (result.status === "fulfilled") {
        const [[row]] = result.value;
        return Number(row?.cnt ?? 0);
      }
      return 0;
    };

    const empCompleted  = getCount(results[0]);
    const empPending    = getCount(results[1]);
    const custCompleted = getCount(results[2]);
    const custPending   = getCount(results[3]);
    const giftActive    = getCount(results[4]);
    const giftInactive  = getCount(results[5]);
    const prospects     = getCount(results[6]);

    res.json({
      empanelment_done: {
        completed: empCompleted,
        total:     empCompleted + empPending,
      },
      customers_onboarding: {
        completed: custCompleted,
        total:     custCompleted + custPending,
      },
      gift_city_ac_active: {
        completed: giftActive,
        total:     giftActive + giftInactive,
      },
      prospects_count: prospects,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
