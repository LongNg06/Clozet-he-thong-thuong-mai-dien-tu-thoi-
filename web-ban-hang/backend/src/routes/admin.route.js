const express = require("express");
const router = express.Router();
const db = require("./database");

// ==================== DASHBOARD STATS ====================
router.get("/stats", (req, res) => {
  const queries = {
    totalProducts: "SELECT COUNT(*) AS total FROM sanpham",
    ordersToday: `SELECT COUNT(*) AS total FROM don_hang WHERE DATE(ngay_dat) = CURDATE()`,
    totalMembers: "SELECT COUNT(*) AS total FROM kh WHERE role = 'user'",
  };

  const results = {};
  let done = 0;
  const keys = Object.keys(queries);

  keys.forEach((key) => {
    db.query(queries[key], (err, rows) => {
      if (err) {
        console.error(`Stats error (${key}):`, err);
        results[key] = 0;
      } else {
        results[key] = rows[0]?.total || 0;
      }
      done++;
      if (done === keys.length) {
        res.json(results);
      }
    });
  });
});

// ==================== RECENT ORDERS ====================
router.get("/orders/recent", (req, res) => {
  const sql = `
    SELECT dh.id_donhang, dh.tong_thanh_toan, dh.trang_thai_donhang, dh.ngay_dat,
           kh.ho_ten
    FROM don_hang dh
    LEFT JOIN kh ON dh.id_KH = kh.id_KH
    ORDER BY dh.ngay_dat DESC
    LIMIT 10
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});

// ==================== LOW STOCK ====================
router.get("/low-stock", (req, res) => {
  const sql = `
    SELECT sp.id_sanpham, sp.ten_sanpham, sp.anh,
           COALESCE(sp.so_luong_ton, 0) AS tong_ton
    FROM sanpham sp
    WHERE COALESCE(sp.so_luong_ton, 0) < 10
    ORDER BY sp.so_luong_ton ASC
    LIMIT 10
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});

// ==================== ORDERS CRUD ====================
// GET all orders
router.get("/orders", (req, res) => {
  const sql = `
    SELECT dh.*, kh.ho_ten, kh.email,
           dc.ten_nguoinhan, dc.so_dien_thoai, dc.dia_chi_cu_the, dc.phuong_xa, dc.quan_huyen, dc.tinh_thanh
    FROM don_hang dh
    LEFT JOIN kh ON dh.id_KH = kh.id_KH
    LEFT JOIN diachi_nguoidung dc ON dh.id_diachi = dc.id_diachi
    ORDER BY dh.ngay_dat DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});

// UPDATE order status
router.put("/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { trang_thai_donhang } = req.body;
  if (!trang_thai_donhang) return res.status(400).json({ message: "Thiếu trạng thái" });

  const allowed = ["cho_xac_nhan", "dang_giao", "da_giao", "da_huy"];
  if (!allowed.includes(trang_thai_donhang)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  db.query(
    "UPDATE don_hang SET trang_thai_donhang = ? WHERE id_donhang = ?",
    [trang_thai_donhang, id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ success: true });
    }
  );
});

// ==================== PRODUCTS CRUD ====================
// GET all products for admin
router.get("/products", (req, res) => {
  const sql = `
    SELECT sp.*, dm.ten_danhmuc,
           COALESCE(sp.so_luong_ton, 0) AS tong_ton_kho
    FROM sanpham sp
    LEFT JOIN danhmuc dm ON sp.id_danhmuc = dm.id_danhmuc
    ORDER BY sp.id_sanpham DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});

// CREATE product
router.post("/products", (req, res) => {
  const { ten_sanpham, gia_goc, gia_khuyen_mai, id_danhmuc, anh, mo_ta, trang_thai } = req.body;
  if (!ten_sanpham || !gia_goc) return res.status(400).json({ message: "Thiếu thông tin" });

  const sql = `INSERT INTO sanpham (ten_sanpham, gia_goc, gia_khuyen_mai, id_danhmuc, anh, mo_ta, trang_thai)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [ten_sanpham, gia_goc, gia_khuyen_mai || null, id_danhmuc || null, anh || '', mo_ta || null, trang_thai ?? 1], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ id: result.insertId, message: "Thêm thành công" });
  });
});

// UPDATE product
router.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { ten_sanpham, gia_goc, gia_khuyen_mai, id_danhmuc, anh, mo_ta, trang_thai } = req.body;

  const sql = `UPDATE sanpham SET ten_sanpham=?, gia_goc=?, gia_khuyen_mai=?, id_danhmuc=?, anh=?, mo_ta=?, trang_thai=?
               WHERE id_sanpham=?`;
  db.query(sql, [ten_sanpham, gia_goc, gia_khuyen_mai || null, id_danhmuc || null, anh || '', mo_ta || null, trang_thai ?? 1, id], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true });
  });
});

// DELETE product
router.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM sanpham_bienthe WHERE id_sanpham = ?", [id], () => {
    db.query("DELETE FROM sanpham WHERE id_sanpham = ?", [id], (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ success: true });
    });
  });
});

// ==================== CATEGORIES CRUD ====================
// GET all categories
router.get("/categories", (req, res) => {
  const sql = `
    SELECT dm.*, COUNT(sp.id_sanpham) AS so_san_pham
    FROM danhmuc dm
    LEFT JOIN sanpham sp ON dm.id_danhmuc = sp.id_danhmuc
    GROUP BY dm.id_danhmuc
    ORDER BY dm.id_danhmuc
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});

// CREATE category
router.post("/categories", (req, res) => {
  const { ten_danhmuc, mo_ta, HinhAnh } = req.body;
  if (!ten_danhmuc) return res.status(400).json({ message: "Thiếu tên danh mục" });

  db.query("INSERT INTO danhmuc (ten_danhmuc, mo_ta, HinhAnh, trang_thai) VALUES (?, ?, ?, 1)",
    [ten_danhmuc, mo_ta || null, HinhAnh || ''], (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ id: result.insertId, message: "Thêm thành công" });
    });
});

// UPDATE category
router.put("/categories/:id", (req, res) => {
  const { id } = req.params;
  const { ten_danhmuc, mo_ta, HinhAnh } = req.body;

  db.query("UPDATE danhmuc SET ten_danhmuc=?, mo_ta=?, HinhAnh=? WHERE id_danhmuc=?",
    [ten_danhmuc, mo_ta || null, HinhAnh || '', id], (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ success: true });
    });
});

// DELETE category
router.delete("/categories/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM danhmuc WHERE id_danhmuc = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true });
  });
});

// ==================== MEMBERS ====================
router.get("/members", (req, res) => {
  const sql = "SELECT id_KH, ho_ten, email, so_dien_thoai, role, trang_thai, ngay_tao FROM kh ORDER BY ngay_tao DESC";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});

module.exports = router;
