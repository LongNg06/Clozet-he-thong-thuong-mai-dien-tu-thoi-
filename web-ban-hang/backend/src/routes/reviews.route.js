const express = require("express");
const router = express.Router();
const db = require("../database");

// GET reviews for a product
router.get("/:id_sanpham", (req, res) => {
  const { id_sanpham } = req.params;
  const sql = `
    SELECT dg.*, kh.ho_ten
    FROM danh_gia dg
    LEFT JOIN kh ON dg.id_KH = kh.id_KH
    WHERE dg.id_sanpham = ?
    ORDER BY dg.ngay_tao DESC
  `;
  db.query(sql, [id_sanpham], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows || []);
  });
});

// CHECK if user can review a product
router.get("/can-review/:id_sanpham", (req, res) => {
  const { id_sanpham } = req.params;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.json({ canReview: false, orders: [] });
  const sql = `
    SELECT ct.id_donhang
    FROM chi_tiet_donhang ct
    JOIN don_hang dh ON ct.id_donhang = dh.id_donhang
    WHERE ct.id_sanpham = ?
      AND dh.id_KH = ?
      AND dh.trang_thai_donhang = 'da_giao'
      AND ct.id_donhang NOT IN (
        SELECT id_donhang FROM danh_gia WHERE id_sanpham = ? AND id_KH = ?
      )
  `;
  db.query(sql, [id_sanpham, id_KH, id_sanpham, id_KH], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ canReview: (rows && rows.length > 0), orders: rows || [] });
  });
});

// POST a new review
router.post("/", (req, res) => {
  const { id_sanpham, id_KH, id_donhang, so_sao, noi_dung } = req.body;
  if (!id_sanpham || !id_KH || !id_donhang || !so_sao) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }
  if (so_sao < 1 || so_sao > 5) {
    return res.status(400).json({ message: "Số sao không hợp lệ" });
  }
  // Verify: order must be delivered AND belong to this user AND contain this product
  const verifySql = `
    SELECT ct.id FROM chi_tiet_donhang ct
    JOIN don_hang dh ON ct.id_donhang = dh.id_donhang
    WHERE ct.id_sanpham = ? AND dh.id_KH = ? AND dh.trang_thai_donhang = 'da_giao' AND ct.id_donhang = ?
  `;
  db.query(verifySql, [id_sanpham, id_KH, id_donhang], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "Không hợp lệ" });
    }
    // Insert review
    const insertSql = `
      INSERT INTO danh_gia (id_sanpham, id_KH, id_donhang, so_sao, noi_dung, ngay_tao)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    db.query(insertSql, [id_sanpham, id_KH, id_donhang, so_sao, noi_dung || ''], (err2) => {
      if (err2) return res.status(500).json({ message: "DB error" });
      res.json({ success: true });
    });
  });
});

module.exports = router;
