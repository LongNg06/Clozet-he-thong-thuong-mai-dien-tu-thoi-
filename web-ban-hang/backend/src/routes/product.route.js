const express = require("express");
const router = express.Router();
const db = require("./database");


// lấy chi tiết sản phẩm
router.get("/:id", (req, res) => {

  const id = req.params.id;

  const sql = `
  SELECT 
  sp.id_sanpham,
  sp.ten_sanpham,
  sp.gia_goc,
  sp.anh,
  sp.mo_ta,

  m.id_mau,
  m.ten_mau,

  k.id_kichco,
  k.ten_kichco,

  bt.so_luong_ton

FROM sanpham sp

LEFT JOIN sanpham_bienthe bt
ON sp.id_sanpham = bt.id_sanpham

LEFT JOIN mau m
ON bt.id_mau = m.id_mau

LEFT JOIN kich_co k
ON bt.id_kichco = k.id_kichco

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
router.get("/products/:id", (req, res) => {

const id = req.params.id;

const sql = `
SELECT 
sp.id_sanpham,
sp.ten_sanpham,
sp.gia_goc,
sp.anh,
sp.mo_ta,

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


router.get("/", (req, res) => {
  const sql = `
    SELECT 
      sp.*,
      COUNT(DISTINCT bt.id_mau) AS mau_sac,
      COUNT(DISTINCT bt.id_kichco) AS kich_co,
      MAX(anb.url_anh) AS hover_img
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    LEFT JOIN sanpham_bienthe bt2
      ON sp.id_sanpham = bt2.id_sanpham
    LEFT JOIN anh_sanpham_bienthe anb
      ON anb.id_sanphambienthe = bt2.id_sanphambienthe
    GROUP BY sp.id_sanpham
    LIMIT 6
  `;

  db.query(sql, (err, result) => {
    if (err) {
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
      COUNT(DISTINCT bt.id_kichco) AS kich_co,
      MAX(anb.url_anh) AS hover_img
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    LEFT JOIN sanpham_bienthe bt2
      ON sp.id_sanpham = bt2.id_sanpham
    LEFT JOIN anh_sanpham_bienthe anb
      ON anb.id_sanphambienthe = bt2.id_sanphambienthe
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
// GET PRODUCTS BY CATEGORY
router.get("/category/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      sp.*,
      COUNT(DISTINCT bt.id_mau) AS mau_sac,
      COUNT(DISTINCT bt.id_kichco) AS kich_co,
      MAX(anb.url_anh) AS hover_img
    FROM sanpham sp
    LEFT JOIN sanpham_bienthe bt
      ON sp.id_sanpham = bt.id_sanpham
    LEFT JOIN sanpham_bienthe bt2
      ON sp.id_sanpham = bt2.id_sanpham
    LEFT JOIN anh_sanpham_bienthe anb
      ON anb.id_sanphambienthe = bt2.id_sanphambienthe
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
module.exports = router;