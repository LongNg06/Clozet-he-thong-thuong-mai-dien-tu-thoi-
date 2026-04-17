const express = require("express");
const router = express.Router();
const db = require("../database"); 

// GET ALL CATEGORY
router.get("/", (req, res) => {
  const sql = "SELECT * FROM danhmuc";

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      console.error("SQL ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(result);
  });
});

module.exports = router;