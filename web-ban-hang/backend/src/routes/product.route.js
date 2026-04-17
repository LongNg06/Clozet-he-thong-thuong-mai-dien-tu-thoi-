const express = require("express");
const router = express.Router();
const db = require("./database");

// GET ALL PRODUCTS (no limit) — for "Sản phẩm mới" page
router.get("/all", (req, res) => {
  const sql = `
    SELECT 
      sp.*,
      GROUP_CONCAT(DISTINCT m.ten_mau ORDER BY m.ten_mau SEPARATOR ',') AS mau_sac,
      GROUP_CONCAT(DISTINCT k.ten_kichco ORDER BY k.ten_kichco SEPARATOR ',') AS kich_co,
      MAX(anb.url_anh) AS hover_img,
      COALESCE(SUM(bt.so_luong_ton), 0) AS tong_ton_kho
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    LEFT JOIN mau m
      ON bt.id_mau = m.id_mau
    LEFT JOIN kich_co k
      ON bt.id_kichco = k.id_kichco
    LEFT JOIN anh_sanpham_bienthe anb
      ON anb.id_sanphambienthe = bt.id_sanphambienthe
    GROUP BY sp.id_sanpham
    ORDER BY sp.id_sanpham DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("SQL ERROR (all):", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
});

// SEARCH PRODUCTS BY NAME
router.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q || String(q).trim().length === 0) {
    return res.json([]);
  }
  const keyword = `%${String(q).trim()}%`;
  const limit = parseInt(req.query.limit, 10) || 5;

  const sql = `
    SELECT
      sp.id_sanpham,
      sp.ten_sanpham,
      sp.gia_goc,
      sp.gia_khuyen_mai,
      sp.anh
    FROM sanpham sp
    WHERE sp.ten_sanpham LIKE ?
    ORDER BY sp.id_sanpham DESC
    LIMIT ?
  `;

  db.query(sql, [keyword, limit], (err, results) => {
    if (err) {
      console.error("SQL ERROR (search):", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

// lấy chi tiết sản phẩm
router.get("/:id", (req, res) => {

  const id = req.params.id;

  const sql = `
  SELECT 
  sp.id_sanpham,
  sp.ten_sanpham,
  sp.gia_goc,
  sp.gia_khuyen_mai,
  sp.anh,
  sp.mo_ta,
  sp.trang_thai,

  m.id_mau,
  m.ten_mau,

  k.id_kichco,
  k.ten_kichco,

  bt.so_luong_ton,

  img.url_anh AS anh_bienthe,

  th.ten_brand AS ten_thuonghieu

FROM sanpham sp

LEFT JOIN sanpham_bienthe bt
ON sp.id_sanpham = bt.id_sanpham

LEFT JOIN mau m
ON bt.id_mau = m.id_mau

LEFT JOIN kich_co k
ON bt.id_kichco = k.id_kichco

LEFT JOIN anh_sanpham_bienthe img
ON bt.id_sanphambienthe = img.id_sanphambienthe

LEFT JOIN thuonghieu th
ON sp.id_thuonghieu = th.id_thuonghieu

WHERE sp.id_sanpham = ?
  `;

  db.query(sql,[id],(err,result)=>{

    if(err){
      console.log(err);
      res.status(500).json(err);
      return;
    }

    res.json(result);

  });

});

// Quick stock check endpoint
router.get("/products/stock/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    `SELECT sp.id_sanpham, sp.trang_thai, COALESCE(SUM(bt.so_luong_ton), 0) AS so_luong_ton
     FROM sanpham sp
     LEFT JOIN sanpham_bienthe bt ON sp.id_sanpham = bt.id_sanpham
     WHERE sp.id_sanpham = ?
     GROUP BY sp.id_sanpham`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!rows || rows.length === 0) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      res.json(rows[0]);
    }
  );
});

router.get("/products/:id", (req, res) => {

const id = req.params.id;

const sql = `
SELECT 
sp.id_sanpham,
sp.ten_sanpham,
sp.gia_goc,
sp.gia_khuyen_mai,
sp.anh,
sp.mo_ta,
sp.trang_thai,
sp.so_luong_ton,

m.id_mau,
m.ten_mau,

k.id_kichco,
k.ten_kichco,

img.anh AS anh_bienthe

FROM sanpham sp

LEFT JOIN sanpham_bienthe bt
ON sp.id_sanpham = bt.id_sanpham

LEFT JOIN mau m
ON bt.id_mau = m.id_mau

LEFT JOIN kich_co k
ON bt.id_kichco = k.id_kichco

LEFT JOIN anh_sanpham_bienthe img
ON bt.id_sanphambienthe = img.id_sanphambienthe

WHERE sp.id_sanpham = ?
`;

db.query(sql,[id],(err,result)=>{

if(err){
console.log(err)
res.status(500).json(err)
return
}

res.json(result)

})

});


// GET /api/products — chuẩn RESTful
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      sp.*,
      GROUP_CONCAT(DISTINCT m.ten_mau ORDER BY m.ten_mau SEPARATOR ',') AS mau_sac,
      GROUP_CONCAT(DISTINCT k.ten_kichco ORDER BY k.ten_kichco SEPARATOR ',') AS kich_co,
      MAX(anb.url_anh) AS hover_img,
      COALESCE(SUM(bt.so_luong_ton), 0) AS tong_ton_kho
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    LEFT JOIN mau m
      ON bt.id_mau = m.id_mau
    LEFT JOIN kich_co k
      ON bt.id_kichco = k.id_kichco
    LEFT JOIN anh_sanpham_bienthe anb
      ON anb.id_sanphambienthe = bt.id_sanphambienthe
    GROUP BY sp.id_sanpham
    ORDER BY sp.id_sanpham DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("SQL ERROR (products):", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
});

// GET PRODUCTS BY CATEGORY
router.get("/category/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      sp.*,
      GROUP_CONCAT(DISTINCT m.ten_mau ORDER BY m.ten_mau SEPARATOR ',') AS mau_sac,
      GROUP_CONCAT(DISTINCT k.ten_kichco ORDER BY k.ten_kichco SEPARATOR ',') AS kich_co,
      MAX(anb.url_anh) AS hover_img,
      COALESCE(SUM(bt.so_luong_ton), 0) AS tong_ton_kho
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    LEFT JOIN mau m
      ON bt.id_mau = m.id_mau
    LEFT JOIN kich_co k
      ON bt.id_kichco = k.id_kichco
    LEFT JOIN anh_sanpham_bienthe anb
      ON anb.id_sanphambienthe = bt.id_sanphambienthe
    WHERE sp.id_danhmuc = ?
    GROUP BY sp.id_sanpham
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("SQL ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(results);
  });
});

// GET ONSALE PRODUCTS (products that have gia_khuyen_mai NOT NULL)
router.get("/onsale", (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const sql = `
    SELECT
      sp.*,
      COUNT(DISTINCT bt.id_mau) AS mau_sac,
      COUNT(DISTINCT bt.id_kichco) AS kich_co,
      MAX(anb.url_anh) AS hover_img
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    LEFT JOIN anh_sanpham_bienthe anb
      ON anb.id_sanphambienthe = bt.id_sanphambienthe
    WHERE sp.gia_khuyen_mai IS NOT NULL
    GROUP BY sp.id_sanpham
    LIMIT ?
  `;

  db.query(sql, [limit], (err, results) => {
    if (err) {
      console.error("SQL ERROR (onsale):", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

// GET LOW-STOCK PRODUCTS (sort by minimum stock ascending)
router.get("/lowstock", (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  const sql = `
    SELECT
      sp.*,
      COUNT(DISTINCT bt.id_mau) AS mau_sac,
      COUNT(DISTINCT bt.id_kichco) AS kich_co,
      MAX(anb.url_anh) AS hover_img,
      MIN(bt.so_luong_ton) AS min_stock
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    LEFT JOIN anh_sanpham_bienthe anb
      ON anb.id_sanphambienthe = bt.id_sanphambienthe
    GROUP BY sp.id_sanpham
    ORDER BY MIN(bt.so_luong_ton) IS NULL, MIN(bt.so_luong_ton) ASC
    LIMIT ?
  `;

  db.query(sql, [limit], (err, results) => {
    if (err) {
      console.error("SQL ERROR (lowstock):", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

module.exports = router;