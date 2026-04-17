const express = require("express");
const router = express.Router();
const db = require("../database");

// ensure cart table exists with id_KH and variant columns
const ensureTable = `
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_KH INT NOT NULL,
  id_sanpham INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  size_name VARCHAR(50) DEFAULT NULL,
  color_name VARCHAR(50) DEFAULT NULL,
  variant_image TEXT DEFAULT NULL
)
`;
db.query(ensureTable, (err) => {
  if (err) console.error("Cannot ensure cart table:", err);
  // Add id_KH column if missing (upgrade from old schema)
  db.query("SHOW COLUMNS FROM cart LIKE 'id_KH'", (e, rows) => {
    if (!e && rows && rows.length === 0) {
      db.query("ALTER TABLE cart ADD COLUMN id_KH INT NOT NULL DEFAULT 0 AFTER id", () => {});
    }
  });
  // Add variant columns if missing
  db.query("SHOW COLUMNS FROM cart LIKE 'size_name'", (e, rows) => {
    if (!e && rows && rows.length === 0) {
      db.query("ALTER TABLE cart ADD COLUMN size_name VARCHAR(50) DEFAULT NULL", () => {});
      db.query("ALTER TABLE cart ADD COLUMN color_name VARCHAR(50) DEFAULT NULL", () => {});
      db.query("ALTER TABLE cart ADD COLUMN variant_image TEXT DEFAULT NULL", () => {});
    }
  });
});

// get cart items for a specific user
router.get("/", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  const sql = `
    SELECT c.id, c.id_sanpham, c.quantity, c.size_name, c.color_name, c.variant_image,
           sp.ten_sanpham, sp.anh, sp.gia_goc, sp.gia_khuyen_mai, sp.trang_thai
    FROM cart c
    LEFT JOIN sanpham sp ON sp.id_sanpham = c.id_sanpham
    WHERE c.id_KH = ?
  `;
  db.query(sql, [id_KH], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results || []);
  });
});

// add item to cart (increment if exists for same product+size+color) — with stock check
router.post("/add", (req, res) => {
  const { id_KH, id_sanpham, quantity, size_name, color_name, variant_image } = req.body;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });
  if (!id_sanpham) return res.status(400).json({ message: "Missing id_sanpham" });
  const q = Number(quantity || 1);

  // Check stock first (from variant table)
  db.query(
    `SELECT sp.trang_thai, COALESCE(SUM(bt.so_luong_ton), 0) AS so_luong_ton
     FROM sanpham sp
     LEFT JOIN sanpham_bienthe bt ON sp.id_sanpham = bt.id_sanpham
     WHERE sp.id_sanpham = ?
     GROUP BY sp.id_sanpham`,
    [id_sanpham],
    (sErr, sRows) => {
    if (sErr) return res.status(500).json({ message: "DB error" });
    if (!sRows || sRows.length === 0) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    const stock = sRows[0].so_luong_ton;
    if (sRows[0].trang_thai === 0) return res.status(400).json({ message: "Sản phẩm đã ngừng kinh doanh" });

    // Match by product + size + color
    const matchSql = "SELECT id, quantity FROM cart WHERE id_KH = ? AND id_sanpham = ? AND (size_name <=> ?) AND (color_name <=> ?)";
    db.query(matchSql, [id_KH, id_sanpham, size_name || null, color_name || null], (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      const currentInCart = (rows && rows.length > 0) ? rows[0].quantity : 0;
      const newQ = currentInCart + q;

      if (newQ > stock) {
        return res.status(400).json({ message: `Chỉ còn ${stock} sản phẩm trong kho`, so_luong_ton: stock });
      }

      if (rows && rows.length > 0) {
        const existing = rows[0];
        db.query("UPDATE cart SET quantity = ? WHERE id = ?", [newQ, existing.id], (uErr) => {
          if (uErr) return res.status(500).json({ message: "DB error" });
          return res.json({ id: existing.id, id_sanpham, quantity: newQ });
        });
      } else {
        db.query("INSERT INTO cart (id_KH, id_sanpham, quantity, size_name, color_name, variant_image) VALUES (?, ?, ?, ?, ?, ?)",
          [id_KH, id_sanpham, q, size_name || null, color_name || null, variant_image || null], (iErr, result) => {
          if (iErr) return res.status(500).json({ message: "DB error" });
          return res.json({ id: result.insertId, id_sanpham, quantity: q });
        });
      }
    });
  });
});

// update quantity
router.put("/update", (req, res) => {
  const { id, id_KH, quantity } = req.body;
  if (!id || !id_KH) return res.status(400).json({ message: "Missing id or id_KH" });
  const q = Number(quantity || 1);
  db.query("UPDATE cart SET quantity = ? WHERE id = ? AND id_KH = ?", [q, id, id_KH], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ id, quantity: q });
  });
});

// remove item
router.delete("/remove/:id", (req, res) => {
  const { id } = req.params;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });
  db.query("DELETE FROM cart WHERE id = ? AND id_KH = ?", [id, id_KH], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ id });
  });
});

// clear cart for user (checkout)
router.post("/checkout", (req, res) => {
  const { id_KH } = req.body;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });
  db.query("DELETE FROM cart WHERE id_KH = ?", [id_KH], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true });
  });
});

module.exports = router;
