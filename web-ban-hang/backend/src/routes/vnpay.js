
const express = require("express");
const router = express.Router();
const db = require("./database");
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require("vnpay");


// ✅ API TẠO ĐƠN HÀNG + LINK THANH TOÁN VNPAY
router.post("/create-payment", async (req, res) => {
    try {
        const { id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan, items } = req.body;
        // 1. Tạo đơn hàng trước
        const sql = `INSERT INTO don_hang (id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan, trang_thai_donhang, phuong_thuc_thanh_toan) VALUES (?, ?, ?, ?, ?, 'chờ thanh toán', 'vnpay')`;
        db.query(sql, [id_KH, id_diachi, tong_tien_hang, phi_van_chuyen, tong_thanh_toan], async (err, result) => {
            if (err) {
                console.error("Lỗi tạo đơn hàng:", err);
                return res.status(500).json({ error: "Lỗi tạo đơn hàng" });
            }
            const id_donhang = result.insertId;

            // 2. Lưu chi tiết sản phẩm vào bảng chi_tiet_donhang
            if (Array.isArray(items) && items.length > 0) {
                const insertDetail = `INSERT INTO chi_tiet_donhang (id_donhang, id_sanpham, ten_sanpham, so_luong, gia, size_name, color_name) VALUES ?`;
                const values = items.map(it => [
                    id_donhang,
                    it.id_sanpham || null,
                    it.ten_sanpham || it.name || it.title || '',
                    it.quantity || it.so_luong || it.qty || 1,
                    it.gia_khuyen_mai || it.gia_goc || it.price || it.unit_price || 0,
                    it.size_name || null,
                    it.color_name || null
                ]);
                db.query(insertDetail, [values], (err2) => {
                    if (err2) console.error("Lỗi lưu chi tiết đơn hàng:", err2);
                });
            }

            // 3. Tạo link thanh toán VNPAY
            const vnpay = new VNPay({
                tmnCode: "UQB228TA",
                secureSecret: "PUI3QLNU5OHNEGHW0KXWY1IIAT1G6O7A",
                vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
                testMode: true,
                logger: ignoreLogger
            });

            const amount = tong_thanh_toan || 100000;
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const paymentUrl = await vnpay.buildPaymentUrl({
                vnp_Amount: amount * 1,
                vnp_IpAddr: req.ip || "127.0.0.1",
                vnp_TxnRef: id_donhang.toString(), // truyền id đơn hàng
                vnp_OrderInfo: `Thanh toán đơn hàng #${id_donhang}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: "http://localhost:5000/api/check-payment-vnpay",
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: dateFormat(new Date(), "yyyyMMddHHmmss"),
                vnp_ExpireDate: dateFormat(tomorrow, "yyyyMMddHHmmss")
            });

            return res.json({ url: paymentUrl, id_donhang });
        });
    } catch (err) {
        console.error("VNPay ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});



// ✅ API NHẬN KẾT QUẢ TỪ VNPAY VÀ UPDATE ĐƠN HÀNG
router.get("/check-payment-vnpay", (req, res) => {
    const data = req.query;
    console.log("VNPay return:", data);
    const id_donhang = data.vnp_TxnRef;
    if (!id_donhang) return res.send("Không xác định được đơn hàng");

    let newStatus = "thất bại";
    if (data.vnp_ResponseCode === "00") {
        newStatus = "đã thanh toán";
    }

        db.query(
                "UPDATE don_hang SET trang_thai_donhang = ? WHERE id_donhang = ?",
                [newStatus, id_donhang],
                (err) => {
                        if (err) {
                                console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
                                return res.send("<div style='font-family:sans-serif;text-align:center;padding:40px'><h2 style='color:#e74c3c'>Có lỗi khi cập nhật trạng thái đơn hàng</h2><a href='http://localhost:5173/' style='display:inline-block;margin-top:24px;padding:10px 24px;background:#333;color:#fff;text-decoration:none;border-radius:6px'>Quay về trang chủ</a></div>");
                        }
                        if (newStatus === "đã thanh toán") {
                                return res.send(`
                                <html><head><title>Thanh toán thành công</title>
                                <style>
                                .popup-success {
                                    max-width: 400px;
                                    margin: 80px auto;
                                    background: #fff;
                                    border-radius: 16px;
                                    box-shadow: 0 4px 32px rgba(0,0,0,0.12);
                                    padding: 40px 32px 32px 32px;
                                    text-align: center;
                                    font-family: 'Segoe UI',sans-serif;
                                }
                                .popup-success .icon {
                                    width: 72px;
                                    height: 72px;
                                    margin: 0 auto 16px auto;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    background: #eafaf1;
                                    border-radius: 50%;
                                }
                                .popup-success .icon svg {
                                    width: 40px;
                                    height: 40px;
                                    color: #2ecc71;
                                }
                                .popup-success h2 {
                                    color: #2ecc71;
                                    margin-bottom: 12px;
                                    font-size: 2rem;
                                }
                                .popup-success p { color: #333; }
                                .popup-success a {
                                    display: inline-block;
                                    margin-top: 24px;
                                    padding: 10px 24px;
                                    background: #2ecc71;
                                    color: #fff;
                                    text-decoration: none;
                                    border-radius: 6px;
                                    font-weight: 500;
                                    transition: background 0.2s;
                                }
                                .popup-success a:hover { background: #27ae60; }
                                </style></head><body>
                                <div class="popup-success">
                                    <div class="icon">
                                        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#eafaf1"/><path d="M7 13l3 3 7-7" stroke="#2ecc71" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                    </div>
                                    <h2>Thanh toán thành công!</h2>
                                    <p>Đơn hàng của bạn đã được thanh toán thành công.</p>
                                      <a href="http://localhost:5173/">Quay về trang chủ</a>
                                </div>
                                </body></html>
                                `);
                        } else {
                                return res.send(`
                                <html><head><title>Thanh toán thất bại</title>
                                <style>
                                .popup-fail {
                                    max-width: 400px;
                                    margin: 80px auto;
                                    background: #fff;
                                    border-radius: 16px;
                                    box-shadow: 0 4px 32px rgba(0,0,0,0.12);
                                    padding: 40px 32px 32px 32px;
                                    text-align: center;
                                    font-family: 'Segoe UI',sans-serif;
                                }
                                .popup-fail .icon {
                                    width: 72px;
                                    height: 72px;
                                    margin: 0 auto 16px auto;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    background: #faeaea;
                                    border-radius: 50%;
                                }
                                .popup-fail .icon svg {
                                    width: 40px;
                                    height: 40px;
                                    color: #e74c3c;
                                }
                                .popup-fail h2 {
                                    color: #e74c3c;
                                    margin-bottom: 12px;
                                    font-size: 2rem;
                                }
                                .popup-fail p { color: #333; }
                                .popup-fail a {
                                    display: inline-block;
                                    margin-top: 24px;
                                    padding: 10px 24px;
                                    background: #e74c3c;
                                    color: #fff;
                                    text-decoration: none;
                                    border-radius: 6px;
                                    font-weight: 500;
                                    transition: background 0.2s;
                                }
                                .popup-fail a:hover { background: #c0392b; }
                                </style></head><body>
                                <div class="popup-fail">
                                    <div class="icon">
                                        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#faeaea"/><path d="M8 8l8 8M16 8l-8 8" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round"/></svg>
                                    </div>
                                    <h2>Thanh toán thất bại!</h2>
                                    <p>Đơn hàng chưa được thanh toán. Vui lòng thử lại.</p>
                                      <a href="http://localhost:5173/">Quay về trang chủ</a>
                                </div>
                                </body></html>
                                `);
                        }
                }
        );
});

module.exports = router;