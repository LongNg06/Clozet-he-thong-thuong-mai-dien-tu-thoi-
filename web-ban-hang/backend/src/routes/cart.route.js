const express = require("express");
const router = express.Router();
const db = require("./database");

// ensure cart table exists
const ensureTable = `
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_sanpham INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1
)
`;
db.query(ensureTable, (err) => {
  if (err) console.error("Cannot ensure cart table:", err);
});

// get cart items with product info
router.get("/", (req, res) => {
  const sql = `
    SELECT c.id, c.id_sanpham, c.quantity,
           sp.ten_sanpham, sp.anh, sp.gia_goc, sp.gia_khuyen_mai, sp.trang_thai
    FROM cart c
    LEFT JOIN sanpham sp ON sp.id_sanpham = c.id_sanpham
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results || []);
  });
});

// add item to cart (increment if exists) — with stock check
router.post("/add", (req, res) => {
  const { id_sanpham, quantity } = req.body;
  if (!id_sanpham) return res.status(400).json({ message: "Missing id_sanpham" });
  const q = Number(quantity || 1);

  // Check stock first
  db.query("SELECT so_luong_ton, trang_thai FROM sanpham WHERE id_sanpham = ?", [id_sanpham], (sErr, sRows) => {
    if (sErr) return res.status(500).json({ message: "DB error" });
    if (!sRows || sRows.length === 0) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    const stock = sRows[0].so_luong_ton;
    if (sRows[0].trang_thai === 0) return res.status(400).json({ message: "Sản phẩm đã ngừng kinh doanh" });

    db.query("SELECT id, quantity FROM cart WHERE id_sanpham = ?", [id_sanpham], (err, rows) => {
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
        db.query("INSERT INTO cart (id_sanpham, quantity) VALUES (?, ?)", [id_sanpham, q], (iErr, result) => {
          if (iErr) return res.status(500).json({ message: "DB error" });
          return res.json({ id: result.insertId, id_sanpham, quantity: q });
        });
      }
    });
  });
});

// update quantity
router.put("/update", (req, res) => {
  const { id, quantity } = req.body;
  if (!id) return res.status(400).json({ message: "Missing id" });
  const q = Number(quantity || 1);
  db.query("UPDATE cart SET quantity = ? WHERE id = ?", [q, id], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ id, quantity: q });
  });
});

// remove item
router.delete("/remove/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM cart WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ id });
  });
});

// checkout (simple: clear cart)
router.post("/checkout", (req, res) => {
  db.query("DELETE FROM cart", (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true });
  });
});

module.exports = router;
