
// const express = require("express");
// const cors = require("cors");

// const app = express();

// require("./routes/database");
// const vnpConfig = require("./routes/vnpay");

// const routes = require("./routes/index");
// const categoryRoutes = require("./routes/categoryroutes");
// const productRoutes = require("./routes/product.route");

// app.use(cors());
// app.use(express.json());


// // static
// app.use("/danhmuc_img", express.static(__dirname + "/danhmuc_img"));
// app.use("/img", express.static(__dirname + "/img"));

// // routes
// app.use("/", routes);
// app.use("/categories", categoryRoutes);
// app.use("/products", productRoutes);

// app.listen(5000);
const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./routes/database");

const routes = require("./routes/index");
const categoryRoutes = require("./routes/categoryroutes");
const productRoutes = require("./routes/product.route");
const adminRoutes = require("./routes/admin.route");
const vnpayRoutes = require("./routes/vnpay"); // 👈 thêm dòng này

app.use(cors());
app.use(express.json());

// static
app.use("/danhmuc_img", express.static(__dirname + "/danhmuc_img"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/static", express.static(__dirname));

// routes
app.use("/", routes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes);
app.use("/api", vnpayRoutes); // 👈 thêm dòng này

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

// Forgot password — reset to a random new password
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

  db.query("SELECT id_KH, ho_ten FROM kh WHERE email = ?", [email], (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Generate random 8-char password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz23456789";
    let newPass = "";
    for (let i = 0; i < 8; i++) newPass += chars.charAt(Math.floor(Math.random() * chars.length));

    db.query("UPDATE kh SET mat_khau = ? WHERE email = ?", [newPass, email], (uErr) => {
      if (uErr) return res.status(500).json({ message: "Lỗi cập nhật mật khẩu" });
      res.json({ success: true, newPassword: newPass, ho_ten: rows[0].ho_ten });
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

// ==================== CHECKOUT / CREATE ORDER ====================
app.post("/checkout", (req, res) => {
  const { id_KH, ten_nguoinhan, so_dien_thoai, dia_chi_cu_the, phuong_xa, quan_huyen, tinh_thanh, items, tong_tien_hang, phi_van_chuyen, tong_thanh_toan, payment_method } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }
  if (!ten_nguoinhan || !so_dien_thoai || !dia_chi_cu_the) {
    return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
  }

  // 0. Verify stock for all items before creating order
  const productIds = items.map(it => it.id_sanpham);
  const placeholders = productIds.map(() => '?').join(',');
  db.query(`SELECT id_sanpham, ten_sanpham, so_luong_ton FROM sanpham WHERE id_sanpham IN (${placeholders})`, productIds, (stockErr, stockRows) => {
    if (stockErr) {
      console.error("Stock check error:", stockErr);
      return res.status(500).json({ message: "Lỗi kiểm tra tồn kho" });
    }

    const stockMap = {};
    (stockRows || []).forEach(r => { stockMap[r.id_sanpham] = r; });

    const outOfStock = [];
    for (const item of items) {
      const qty = Number(item.quantity || item.so_luong || 1);
      const sp = stockMap[item.id_sanpham];
      if (!sp) {
        outOfStock.push({ id_sanpham: item.id_sanpham, ten_sanpham: item.ten_sanpham || '', message: 'Sản phẩm không tồn tại' });
      } else if (qty > sp.so_luong_ton) {
        outOfStock.push({ id_sanpham: item.id_sanpham, ten_sanpham: sp.ten_sanpham, so_luong_ton: sp.so_luong_ton, message: `Chỉ còn ${sp.so_luong_ton} sản phẩm` });
      }
    }

    if (outOfStock.length > 0) {
      return res.status(400).json({ message: "Một số sản phẩm không đủ hàng", outOfStock });
    }

    // 1. Insert address
    const addrSql = "INSERT INTO diachi_nguoidung (id_KH, ten_nguoinhan, so_dien_thoai, dia_chi_cu_the, phuong_xa, quan_huyen, tinh_thanh) VALUES (?,?,?,?,?,?,?)";
    db.query(addrSql, [id_KH || null, ten_nguoinhan, so_dien_thoai, dia_chi_cu_the, phuong_xa || null, quan_huyen || null, tinh_thanh || null], (err, addrResult) => {
      if (err) {
        console.error("Address insert error:", err);
        return res.status(500).json({ message: "Lỗi lưu địa chỉ" });
      }
      const id_diachi = addrResult.insertId;

      // 2. Insert order
      const orderSql = "INSERT INTO don_hang (id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan, trang_thai_donhang) VALUES (?,?,?,?,?,?)";
      db.query(orderSql, [id_KH || null, id_diachi, tong_tien_hang || 0, phi_van_chuyen || 0, tong_thanh_toan || 0, "cho_xac_nhan"], (err2, orderResult) => {
        if (err2) {
          console.error("Order insert error:", err2);
          return res.status(500).json({ message: "Lỗi tạo đơn hàng" });
        }

        const id_donhang = orderResult.insertId;

        // 3. Insert payment record
        const paySql = "INSERT INTO thanh_toan (id_donhang, so_tien, trang_thai_thanhtoan) VALUES (?,?,?)";
        db.query(paySql, [id_donhang, tong_thanh_toan || 0, payment_method === "cod" ? "chua_thanh_toan" : "da_thanh_toan"], () => {});

        // 4. Decrement stock for each item
        for (const item of items) {
          const qty = Number(item.quantity || item.so_luong || 1);
          db.query("UPDATE sanpham SET so_luong_ton = so_luong_ton - ? WHERE id_sanpham = ? AND so_luong_ton >= ?", [qty, item.id_sanpham, qty], () => {});
        }

        // 5. If user is logged in, clear their giohang
        if (id_KH) {
          db.query("DELETE FROM giohang WHERE id_KH = ?", [id_KH], () => {});
        }

        res.json({ success: true, id_donhang, message: "Đặt hàng thành công" });
      });
    });
  });
});

app.listen(5000, () => {
    console.log("Server running port 5000");
});