const express = require("express");
const router = express.Router();
const db = require("../database");

// GET wishlist
router.get("/", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });
  const sql = `
    SELECT yt.id, yt.id_sanpham, yt.ngay_them,
           sp.ten_sanpham, sp.gia_goc, sp.gia_khuyen_mai, sp.anh
    FROM yeu_thich yt
    JOIN sanpham sp ON yt.id_sanpham = sp.id_sanpham
    WHERE yt.id_KH = ?
    ORDER BY yt.ngay_them DESC
  `;
  db.query(sql, [id_KH], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows || []);
  });
});

// ADD to wishlist
router.post("/", (req, res) => {
  const { id_KH, id_sanpham } = req.body;
  if (!id_KH || !id_sanpham) return res.status(400).json({ message: "Missing data" });
  db.query("INSERT IGNORE INTO yeu_thich (id_KH, id_sanpham) VALUES (?,?)", [id_KH, id_sanpham], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true, message: "Đã thêm vào yêu thích" });
  });
});

// REMOVE from wishlist
router.delete("/:id_sanpham", (req, res) => {
  const { id_sanpham } = req.params;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });
  db.query("DELETE FROM yeu_thich WHERE id_KH = ? AND id_sanpham = ?", [id_KH, id_sanpham], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true, message: "Đã xóa khỏi yêu thích" });
  });
});

// CHECK if product is in wishlist
router.get("/check/:id_sanpham", (req, res) => {
  const { id_sanpham } = req.params;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.json({ inWishlist: false });
  db.query("SELECT id FROM yeu_thich WHERE id_KH = ? AND id_sanpham = ?", [id_KH, id_sanpham], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ inWishlist: rows && rows.length > 0 });
  });
});

module.exports = router;
