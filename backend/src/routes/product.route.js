const express = require("express");
const router = express.Router();
const db = require("./database");

router.get("/", (req, res) => {
  db.query("SELECT * FROM sanpham", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Lỗi database" });
    }
    res.json(result);
  });
});

module.exports = router;