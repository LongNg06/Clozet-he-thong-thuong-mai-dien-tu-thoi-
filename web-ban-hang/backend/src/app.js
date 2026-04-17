require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// static images
app.use("/img", express.static("src/img"));
app.use("/danhmuc_img", express.static("src/danhmuc_img"));
app.use("/blog_img", express.static("src/blog_img"));


// import router tổng
const routes = require("./routes");

// dùng router
app.use("/api", routes);


// test server
app.get("/", (req, res) => {
    res.send("API running");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});

// ===== EMAIL =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ===== BLOG =====
app.get("/blogs", (req, res) => {
  db.query(
    "SELECT * FROM baiviet WHERE trang_thai = 1 ORDER BY ngay_tao DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(rows);
    }
  );
});


// ===== PORT =====
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log("Server running on port", PORT);
// });

app.get("/blogs/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM baiviet WHERE id_baiviet = ? AND trang_thai = 1", [id], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(rows[0]);
  });
});

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

// Forgot password — send random code to registered email
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

  db.query("SELECT id_KH, ho_ten FROM kh WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Generate random 6-char code (letters + digits)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

    // Store code with 10-minute expiry
    resetCodes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });

    try {
      await transporter.sendMail({
        from: `"Clozet Shop" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Mã xác nhận đặt lại mật khẩu - Clozet",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #e11d48; text-align: center;">Clozet - Đặt lại mật khẩu</h2>
            <p>Xin chào <b>${rows[0].ho_ten}</b>,</p>
            <p>Mã xác nhận của bạn là:</p>
            <div style="text-align: center; padding: 15px; background: #f5f5f5; border-radius: 10px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #111;">
              ${code}
            </div>
            <p style="color: #888; font-size: 13px; margin-top: 15px;">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          </div>
        `,
      });
      res.json({ success: true, message: "Mã xác nhận đã được gửi đến email của bạn" });
    } catch (mailErr) {
      console.error("Send mail error:", mailErr);
      res.status(500).json({ message: "Không thể gửi email. Vui lòng thử lại sau." });
    }
  });
});

// Verify reset code and set new password
app.post("/verify-reset-code", (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const stored = resetCodes.get(email);
  if (!stored) {
    return res.status(400).json({ message: "Mã xác nhận không tồn tại. Vui lòng gửi lại mã." });
  }
  if (Date.now() > stored.expires) {
    resetCodes.delete(email);
    return res.status(400).json({ message: "Mã xác nhận đã hết hạn. Vui lòng gửi lại mã." });
  }
  if (stored.code !== code.toUpperCase().trim()) {
    return res.status(400).json({ message: "Mã xác nhận không đúng" });
  }

  db.query("UPDATE kh SET mat_khau = ? WHERE email = ?", [newPassword, email], (err) => {
    if (err) return res.status(500).json({ message: "Lỗi cập nhật mật khẩu" });
    resetCodes.delete(email);
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
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

  // 0. Verify stock for all items before creating order (stock from variant table)
  const productIds = items.map(it => it.id_sanpham);
  const placeholders = productIds.map(() => '?').join(',');
  db.query(
    `SELECT sp.id_sanpham, sp.ten_sanpham, COALESCE(SUM(bt.so_luong_ton), 0) AS so_luong_ton
     FROM sanpham sp
     LEFT JOIN sanpham_bienthe bt ON sp.id_sanpham = bt.id_sanpham
     WHERE sp.id_sanpham IN (${placeholders})
     GROUP BY sp.id_sanpham`,
    productIds,
    (stockErr, stockRows) => {
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
      const orderSql = "INSERT INTO don_hang (id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan, trang_thai_donhang, phuong_thuc_thanh_toan) VALUES (?,?,?,?,?,?,?)";
      db.query(orderSql, [id_KH || null, id_diachi, tong_tien_hang || 0, phi_van_chuyen || 0, tong_thanh_toan || 0, "cho_xac_nhan", payment_method || "cod"], (err2, orderResult) => {
        if (err2) {
          console.error("Order insert error:", err2);
          return res.status(500).json({ message: "Lỗi tạo đơn hàng" });
        }

        const id_donhang = orderResult.insertId;

        // 3. Insert payment record
        const paySql = "INSERT INTO thanh_toan (id_donhang, so_tien, trang_thai_thanhtoan) VALUES (?,?,?)";
        db.query(paySql, [id_donhang, tong_thanh_toan || 0, payment_method === "cod" ? "chua_thanh_toan" : "da_thanh_toan"], () => {});

        // 4. Decrement stock for each item + save order details
        for (const item of items) {
          const qty = Number(item.quantity || item.so_luong || 1);
          db.query("UPDATE sanpham_bienthe SET so_luong_ton = so_luong_ton - ? WHERE id_sanpham = ? AND so_luong_ton >= ?", [qty, item.id_sanpham, qty], () => {});
          // Save order item
          db.query(
            "INSERT INTO chi_tiet_donhang (id_donhang, id_sanpham, ten_sanpham, so_luong, gia, size_name, color_name) VALUES (?,?,?,?,?,?,?)",
            [id_donhang, item.id_sanpham, item.ten_sanpham || "", qty, Number(item.gia_khuyen_mai || item.gia_goc || 0), item.size_name || null, item.color_name || null],
            () => {}
          );
        }

        // 5. If user is logged in, clear their cart
        if (id_KH) {
          db.query("DELETE FROM cart WHERE id_KH = ?", [id_KH], () => {});
          db.query("DELETE FROM giohang WHERE id_KH = ?", [id_KH], () => {});
        }

        res.json({ success: true, id_donhang, message: "Đặt hàng thành công" });
      });
    });
  });
});

// ==================== NOTIFICATIONS / THÔNG BÁO ====================
// Auto-create thongbao table
db.query(`
  CREATE TABLE IF NOT EXISTS thongbao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_KH INT DEFAULT NULL,
    nguoi_gui ENUM('admin','user') NOT NULL DEFAULT 'admin',
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT,
    parent_id INT DEFAULT NULL,
    da_doc TINYINT DEFAULT 0,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => { if (err) console.log("thongbao table exists or error:", err.message); });

// Admin: send notification to a customer (or all if id_KH = 0)
app.post("/notifications", (req, res) => {
  const { id_KH, tieu_de, noi_dung, parent_id } = req.body;
  const nguoi_gui = req.body.nguoi_gui || "admin";
  if (!tieu_de) return res.status(400).json({ message: "Thiếu tiêu đề" });

  if (Number(id_KH) === 0 && nguoi_gui === "admin") {
    // Send to ALL customers
    db.query("SELECT id_KH FROM kh WHERE role = 'user'", (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      const users = rows || [];
      if (users.length === 0) return res.json({ success: true, message: "Không có khách hàng" });
      const values = users.map(u => [u.id_KH, nguoi_gui, tieu_de, noi_dung || "", parent_id || null, 0]);
      db.query("INSERT INTO thongbao (id_KH, nguoi_gui, tieu_de, noi_dung, parent_id, da_doc) VALUES ?", [values], (err2) => {
        if (err2) return res.status(500).json({ message: "DB error" });
        res.json({ success: true, message: `Đã gửi đến ${users.length} khách hàng` });
      });
    });
  } else {
    db.query(
      "INSERT INTO thongbao (id_KH, nguoi_gui, tieu_de, noi_dung, parent_id) VALUES (?,?,?,?,?)",
      [id_KH || null, nguoi_gui, tieu_de, noi_dung || "", parent_id || null],
      (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json({ success: true, id: result.insertId });
      }
    );
  }
});

// User: get my notifications
app.get("/notifications", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  db.query(
    `SELECT * FROM thongbao WHERE id_KH = ? ORDER BY ngay_tao DESC LIMIT 50`,
    [id_KH],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(rows || []);
    }
  );
});

// User: unread count
app.get("/notifications/unread-count", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.json({ count: 0 });

  db.query(
    "SELECT COUNT(*) AS count FROM thongbao WHERE id_KH = ? AND da_doc = 0 AND nguoi_gui = 'admin'",
    [id_KH],
    (err, rows) => {
      if (err) return res.json({ count: 0 });
      res.json({ count: rows[0]?.count || 0 });
    }
  );
});

// Mark as read
app.put("/notifications/:id/read", (req, res) => {
  db.query("UPDATE thongbao SET da_doc = 1 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true });
  });
});

// Mark all as read for a user
app.put("/notifications/read-all", (req, res) => {
  const id_KH = req.body.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });
  db.query("UPDATE thongbao SET da_doc = 1 WHERE id_KH = ? AND da_doc = 0", [id_KH], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true });
  });
});

// Admin: get all notification threads (grouped by user)
app.get("/admin/notifications", (req, res) => {
  db.query(
    `SELECT tb.*, kh.ho_ten, kh.email
     FROM thongbao tb
     LEFT JOIN kh ON tb.id_KH = kh.id_KH
     ORDER BY tb.ngay_tao DESC
     LIMIT 100`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(rows || []);
    }
  );
});

// Admin: unread count (user replies)
app.get("/admin/notifications/unread-count", (req, res) => {
  db.query(
    "SELECT COUNT(*) AS count FROM thongbao WHERE nguoi_gui = 'user' AND da_doc = 0",
    (err, rows) => {
      if (err) return res.json({ count: 0 });
      res.json({ count: rows[0]?.count || 0 });
    }
  );
});

// Admin: mark user reply as read
app.put("/admin/notifications/read-all", (req, res) => {
  db.query("UPDATE thongbao SET da_doc = 1 WHERE nguoi_gui = 'user' AND da_doc = 0", (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true });
  });
});


// ==================== USER ACCOUNT APIs ====================
// Get user orders
app.get("/user/orders", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  const sql = `
    SELECT dh.id_donhang, dh.tong_tien_hang, dh.phi_van_chuyen, dh.tong_thanh_toan,
           dh.trang_thai_donhang, dh.ngay_dat, dh.phuong_thuc_thanh_toan,
           dc.ten_nguoinhan, dc.so_dien_thoai, dc.dia_chi_cu_the, dc.phuong_xa, dc.quan_huyen, dc.tinh_thanh
    FROM don_hang dh
    LEFT JOIN diachi_nguoidung dc ON dh.id_diachi = dc.id_diachi
    WHERE dh.id_KH = ?
    ORDER BY dh.ngay_dat DESC
  `;
  db.query(sql, [id_KH], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results || []);
  });
});

// Cancel order (user can cancel if not yet shipped)
app.put("/user/orders/:id/cancel", (req, res) => {
  const { id } = req.params;
  const { id_KH } = req.body;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  // Only allow cancel if order is cho_xac_nhan (pending)
  db.query(
    "SELECT trang_thai_donhang FROM don_hang WHERE id_donhang = ? AND id_KH = ?",
    [id, id_KH],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!rows || rows.length === 0) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      const status = rows[0].trang_thai_donhang;
      if (status !== "cho_xac_nhan") {
        return res.status(400).json({ message: "Chỉ có thể hủy đơn khi đang chờ xác nhận" });
      }

      db.query(
        "UPDATE don_hang SET trang_thai_donhang = 'da_huy' WHERE id_donhang = ? AND id_KH = ?",
        [id, id_KH],
        (err2) => {
          if (err2) return res.status(500).json({ message: "DB error" });
          res.json({ success: true, message: "Đã hủy đơn hàng" });
        }
      );
    }
  );
});

// Get user addresses
app.get("/user/addresses", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  const sql = `SELECT * FROM diachi_nguoidung WHERE id_KH = ? ORDER BY id_diachi DESC`;
  db.query(sql, [id_KH], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results || []);
  });
});

// Add new address
app.post("/user/addresses", (req, res) => {
  const { id_KH, ten_nguoinhan, so_dien_thoai, dia_chi_cu_the, phuong_xa, quan_huyen, tinh_thanh } = req.body;
  if (!id_KH || !ten_nguoinhan || !so_dien_thoai || !dia_chi_cu_the) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }
  const sql = "INSERT INTO diachi_nguoidung (id_KH, ten_nguoinhan, so_dien_thoai, dia_chi_cu_the, phuong_xa, quan_huyen, tinh_thanh) VALUES (?,?,?,?,?,?,?)";
  db.query(sql, [id_KH, ten_nguoinhan, so_dien_thoai, dia_chi_cu_the, phuong_xa || null, quan_huyen || null, tinh_thanh || null], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi lưu địa chỉ" });
    res.json({ success: true, id_diachi: result.insertId, message: "Thêm địa chỉ thành công" });
  });
});

// Delete address
app.delete("/user/addresses/:id", (req, res) => {
  const id_diachi = req.params.id;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  // Check if any order references this address
  db.query("SELECT id_donhang FROM don_hang WHERE id_diachi = ? LIMIT 1", [id_diachi], (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi kiểm tra địa chỉ" });
    if (rows && rows.length > 0) {
      return res.status(400).json({ message: "Không thể xóa địa chỉ này vì đã được sử dụng trong đơn hàng" });
    }

    db.query("DELETE FROM diachi_nguoidung WHERE id_diachi = ? AND id_KH = ?", [id_diachi, id_KH], (err2, result) => {
      if (err2) return res.status(500).json({ message: "Lỗi xóa địa chỉ" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      res.json({ success: true, message: "Đã xóa địa chỉ" });
    });
  });
});

// ==================== REVIEWS / ĐÁNH GIÁ ====================
// GET reviews for a product
app.get("/reviews/:id_sanpham", (req, res) => {
  const { id_sanpham } = req.params;
  const sql = `
    SELECT dg.*, kh.ho_ten
    FROM danh_gia dg
    LEFT JOIN kh ON dg.id_KH = kh.id_KH
    WHERE dg.id_sanpham = ?
    ORDER BY dg.ngay_tao DESC
  `;
  db.query(sql, [id_sanpham], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows || []);
  });
});

// CHECK if user can review a product (bought + order delivered + not yet reviewed)
app.get("/reviews/can-review/:id_sanpham", (req, res) => {
  const { id_sanpham } = req.params;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.json({ canReview: false, orders: [] });

  // Find delivered orders containing this product that user hasn't reviewed yet
  const sql = `
    SELECT ct.id_donhang
    FROM chi_tiet_donhang ct
    JOIN don_hang dh ON ct.id_donhang = dh.id_donhang
    WHERE ct.id_sanpham = ?
      AND dh.id_KH = ?
      AND dh.trang_thai_donhang = 'da_giao'
      AND ct.id_donhang NOT IN (
        SELECT id_donhang FROM danh_gia WHERE id_sanpham = ? AND id_KH = ?
      )
  `;
  db.query(sql, [id_sanpham, id_KH, id_sanpham, id_KH], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ canReview: (rows && rows.length > 0), orders: rows || [] });
  });
});

// POST a new review
app.post("/reviews", (req, res) => {
  const { id_sanpham, id_KH, id_donhang, so_sao, noi_dung } = req.body;
  if (!id_sanpham || !id_KH || !id_donhang || !so_sao) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }
  if (so_sao < 1 || so_sao > 5) {
    return res.status(400).json({ message: "Số sao không hợp lệ" });
  }

  // Verify: order must be delivered AND belong to this user AND contain this product
  const verifySql = `
    SELECT ct.id FROM chi_tiet_donhang ct
    JOIN don_hang dh ON ct.id_donhang = dh.id_donhang
    WHERE ct.id_donhang = ? AND ct.id_sanpham = ? AND dh.id_KH = ? AND dh.trang_thai_donhang = 'da_giao'
    LIMIT 1
  `;
  db.query(verifySql, [id_donhang, id_sanpham, id_KH], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!rows || rows.length === 0) {
      return res.status(403).json({ message: "Bạn không có quyền đánh giá sản phẩm này" });
    }

    // Check if already reviewed this order+product
    db.query("SELECT id_danhgia FROM danh_gia WHERE id_donhang = ? AND id_sanpham = ? AND id_KH = ?", [id_donhang, id_sanpham, id_KH], (err2, existing) => {
      if (err2) return res.status(500).json({ message: "DB error" });
      if (existing && existing.length > 0) {
        return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi" });
      }

      db.query(
        "INSERT INTO danh_gia (id_sanpham, id_KH, id_donhang, so_sao, noi_dung) VALUES (?,?,?,?,?)",
        [id_sanpham, id_KH, id_donhang, so_sao, noi_dung || ""],
        (err3, result) => {
          if (err3) return res.status(500).json({ message: "Lỗi lưu đánh giá" });
          res.json({ success: true, id_danhgia: result.insertId, message: "Đánh giá thành công" });
        }
      );
    });
  });
});

// ==================== WISHLIST / YÊU THÍCH ====================
// Auto-create wishlist table
db.query(`
  CREATE TABLE IF NOT EXISTS yeu_thich (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_KH INT NOT NULL,
    id_sanpham INT NOT NULL,
    ngay_them DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wish (id_KH, id_sanpham)
  )
`, (err) => { if (err) console.log("yeu_thich table exists or error:", err.message); });

// GET wishlist items for a user
app.get("/wishlist", (req, res) => {
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  const sql = `
    SELECT yt.id, yt.id_sanpham, yt.ngay_them,
           sp.ten_sanpham, sp.gia_goc, sp.gia_khuyen_mai, sp.anh
    FROM yeu_thich yt
    JOIN sanpham sp ON yt.id_sanpham = sp.id_sanpham
    WHERE yt.id_KH = ?
    ORDER BY yt.ngay_them DESC
  `;
  db.query(sql, [id_KH], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows || []);
  });
});

// ADD to wishlist
app.post("/wishlist", (req, res) => {
  const { id_KH, id_sanpham } = req.body;
  if (!id_KH || !id_sanpham) return res.status(400).json({ message: "Missing data" });

  db.query("INSERT IGNORE INTO yeu_thich (id_KH, id_sanpham) VALUES (?,?)", [id_KH, id_sanpham], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true, message: "Đã thêm vào yêu thích" });
  });
});

// REMOVE from wishlist
app.delete("/wishlist/:id_sanpham", (req, res) => {
  const { id_sanpham } = req.params;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  db.query("DELETE FROM yeu_thich WHERE id_KH = ? AND id_sanpham = ?", [id_KH, id_sanpham], (err) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ success: true, message: "Đã xóa khỏi yêu thích" });
  });
});

// CHECK if product is in wishlist
app.get("/wishlist/check/:id_sanpham", (req, res) => {
  const { id_sanpham } = req.params;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.json({ inWishlist: false });

  db.query("SELECT id FROM yeu_thich WHERE id_KH = ? AND id_sanpham = ?", [id_KH, id_sanpham], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ inWishlist: rows && rows.length > 0 });
  });
});

// ==================== ORDER DETAILS ====================
// GET order items for a specific order
app.get("/user/orders/:id/items", (req, res) => {
  const { id } = req.params;
  const id_KH = req.query.id_KH;
  if (!id_KH) return res.status(400).json({ message: "Missing id_KH" });

  // Verify order belongs to user
  db.query("SELECT id_donhang FROM don_hang WHERE id_donhang = ? AND id_KH = ?", [id, id_KH], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!rows || rows.length === 0) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const sql = `
      SELECT ct.id_sanpham, ct.ten_sanpham, ct.so_luong, ct.gia, ct.size_name, ct.color_name,
             sp.anh
      FROM chi_tiet_donhang ct
      LEFT JOIN sanpham sp ON ct.id_sanpham = sp.id_sanpham
      WHERE ct.id_donhang = ?
    `;
    db.query(sql, [id], (err2, items) => {
      if (err2) return res.status(500).json({ message: "DB error" });
      res.json(items || []);
    });
  });
});
// app.get("/", (req,res)=>{
//   res.send("API RUNNING OK");
// })
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log("Server running on port", PORT);
// });
