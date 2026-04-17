const express = require("express");
const router = express.Router();
const db = require("./database");

// Lấy danh sách đơn hàng theo id_KH và phương thức thanh toán
// Lấy đơn hàng theo id_KH, id_diachi và các trường khác phải khác null
router.get("/", (req, res) => {
  const { id_KH, id_diachi, phuong_thuc_thanh_toan } = req.query;
  if (!id_KH) return res.status(400).json({ message: "Thiếu id_KH" });

  let sql = `SELECT * FROM don_hang WHERE id_KH = ?`;
  const params = [id_KH];
  if (id_diachi) {
    sql += ` AND id_diachi = ?`;
    params.push(id_diachi);
  }
  if (phuong_thuc_thanh_toan) {
    sql += ` AND phuong_thuc_thanh_toan = ?`;
    params.push(phuong_thuc_thanh_toan);
  }
  // Loại bỏ các đơn hàng thiếu thông tin quan trọng
  sql += ` AND tong_tien_hang IS NOT NULL AND phi_van_chuyen IS NOT NULL AND tong_thanh_toan IS NOT NULL`;
  sql += ` ORDER BY ngay_dat DESC`;

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});

module.exports = router;
