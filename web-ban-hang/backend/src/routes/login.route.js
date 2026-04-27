const express = require("express");
const router = express.Router();
const db = require("../database");

// login
router.post("/", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM kh WHERE email = ? AND mat_khau = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (result.length === 0) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }
    const user = result[0];
    res.json({
      user: {
        id: user.id_KH,
        name: user.ho_ten,
        email: user.email,
        role: user.role
      }
    });
  });
});

module.exports = router;
