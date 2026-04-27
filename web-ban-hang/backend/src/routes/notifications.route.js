const express = require("express");
const router = express.Router();
const db = require("../database");

// GET unread notifications count
router.get("/unread-count", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.json({ count: 0 });
  db.query(
    "SELECT COUNT(*) AS count FROM thongbao WHERE id_KH = ? AND da_doc = 0 AND nguoi_gui = 'admin'",
    [id_KH],
    (err, rows) => {
      if (err) return res.json({ count: 0 });
      res.json({ count: rows[0]?.count || 0 });
    }
  );
});

module.exports = router;
