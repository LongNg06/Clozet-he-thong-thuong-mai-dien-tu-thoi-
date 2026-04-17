// Add a new API endpoint to get revenue statistics for delivered orders (da_giao)
const express = require("express");
const router = express.Router();
const db = require("../database");

// ...existing code...

// ==================== REVENUE STATISTICS ====================
router.get("/revenue", (req, res) => {
  // Group by month/year, sum tong_thanh_toan for delivered orders
  const sql = `
    SELECT 
      DATE_FORMAT(ngay_dat, '%Y-%m') AS month,
      SUM(tong_thanh_toan) AS total
    FROM don_hang
    WHERE trang_thai_donhang = 'da_giao'
    GROUP BY month
    ORDER BY month ASC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows || []);
  });
});

module.exports = router;
