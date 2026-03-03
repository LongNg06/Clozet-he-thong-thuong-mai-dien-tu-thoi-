const express = require("express");
const router = express.Router();
const db = require("./database");



router.get("/", (req, res) => {
  const sql = `
    SELECT 
      sp.*,
      COUNT(DISTINCT bt.id_mau) AS mau_sac,
      COUNT(DISTINCT bt.id_kichco) AS kich_co
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    GROUP BY sp.id_sanpham
    LIMIT 6
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("SQL ERROR:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }

    res.json(result);
  });
});


router.get("/bosuutap/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      sp.*,
      COUNT(DISTINCT bt.id_mau) AS mau_sac,
      COUNT(DISTINCT bt.id_kichco) AS kich_co
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    WHERE sp.id_bosuutap = ?
    GROUP BY sp.id_sanpham
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("SQL ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    console.log("Bosuutap results:", results);
    res.json(results);
  });
});
module.exports = router;