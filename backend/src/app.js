const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./routes/database"); // kết nối database

// ✅ require trước
const routes = require("./routes/index");
const categoryRoutes = require("./routes/categoryroutes");

// middleware
app.use(cors());
app.use(express.json());

// static ảnh
app.use("/danhmuc_img", express.static(__dirname + "/danhmuc_img"));
app.use("/img", express.static(__dirname + "/img"));

// routes
app.use("/", routes);
app.use("/categories", categoryRoutes);

// login
app.post("/login", (req, res) => {
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

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  // check rỗng
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  // check email tồn tại
  const checkSql = "SELECT * FROM kh WHERE email = ?";
  db.query(checkSql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (result.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // thêm user
    const insertSql =
      "INSERT INTO kh (ho_ten, email, mat_khau, role) VALUES (?, ?, ?, 'user')";

    db.query(insertSql, [name, email, password], (err) => {
      if (err) return res.status(500).json({ message: "Lỗi server" });

      res.json({ message: "Đăng ký thành công" });
    });
  });
});

// chạy server
app.listen(5000, () => {
  console.log("Server đang chạy ở port 5000");
});