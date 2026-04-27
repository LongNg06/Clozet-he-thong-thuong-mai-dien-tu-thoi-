const express = require("express");
const router = express.Router();
const db = require("../database");

// GET all blogs (public)
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM baiviet WHERE trang_thai = 1 ORDER BY ngay_tao DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(rows);
    }
  );
});

// GET single blog (public)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM baiviet WHERE id_baiviet = ? AND trang_thai = 1",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!rows.length) return res.status(404).json({ message: "Không tìm thấy" });
      res.json(rows[0]);
    }
  );
});

module.exports = router;
