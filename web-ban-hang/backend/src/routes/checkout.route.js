const express = require("express");
const router = express.Router();
const db = require("../database");

// Thanh toán COD: Tạo đơn hàng mới
router.post("/", (req, res) => {
  console.log("[BACKEND] req.body /api/checkout:", req.body);
  const { id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan, cartItems } = req.body;
  if (!id_KH || !id_diachi || tong_tien_hang == null || phi_van_chuyen == null || tong_thanh_toan == null || !Array.isArray(cartItems) || cartItems.length === 0) {
    console.log("[BACKEND] Lỗi thiếu thông tin:", { id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan, cartItems });
    return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
  }
  // Tạo đơn hàng
  const sqlOrder = `INSERT INTO don_hang (id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan, phuong_thuc_thanh_toan, trang_thai_donhang, ngay_dat) VALUES (?, ?, ?, ?, ?, 'cod', 'cho_xac_nhan', NOW())`;
  db.query(sqlOrder, [id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan], (err, result) => {
    if (err) {
      console.error("[BACKEND] DB error khi insert don_hang:", err);
      return res.status(500).json({ message: "DB error" });
    }
    const id_donhang = result.insertId;
    // Thêm chi tiết đơn hàng
    const sqlDetail = `INSERT INTO chi_tiet_donhang (id_donhang, id_sanpham, so_luong, gia_ban) VALUES ?`;
    const values = cartItems.map(item => [id_donhang, item.id_sanpham, item.so_luong, item.gia_ban]);
    db.query(sqlDetail, [values], (err2) => {
      if (err2) {
        console.error("[BACKEND] DB error khi insert chi_tiet_donhang:", err2);
        console.error("[BACKEND] SQL:", sqlDetail, values);
        return res.status(500).json({ message: "DB error" });
      }
      res.json({ success: true, id_donhang });
    });
  });
});

module.exports = router;
