const express = require("express");
const router = express.Router();
const db = require("../database");

// GET user addresses
router.get("/addresses", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });
  const sql = `SELECT * FROM diachi_nguoidung WHERE id_KH = ? ORDER BY id_diachi DESC`;
  db.query(sql, [id_KH], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results || []);
  });
});

module.exports = router;
