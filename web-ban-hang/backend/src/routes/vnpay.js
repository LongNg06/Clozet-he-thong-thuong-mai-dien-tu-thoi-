const express = require("express");
const router = express.Router();

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require("vnpay");

// ✅ API TẠO LINK THANH TOÁN
router.post("/create-payment", async (req, res) => {
    try {
        const vnpay = new VNPay({
            tmnCode: "UQB228TA",

            // 🔥 FIX QUAN TRỌNG (KHÔNG PHẢI hashSecret)
            secureSecret: "PUI3QLNU5OHNEGHW0KXWY1IIAT1G6O7A",

            vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
            testMode: true,
            logger: ignoreLogger
        });

        const amount = req.body.amount || 100000;
        console.log("[VNPay] Số tiền nhận từ frontend:", amount);

        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const paymentUrl = await vnpay.buildPaymentUrl({
            vnp_Amount: amount * 10,
            vnp_IpAddr: req.ip || "127.0.0.1",
            vnp_TxnRef: Date.now().toString(),
            vnp_OrderInfo: "Thanh toán test",
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: "http://localhost:5000/api/check-payment-vnpay",
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date(), "yyyyMMddHHmmss"),
            vnp_ExpireDate: dateFormat(tomorrow, "yyyyMMddHHmmss")
        });

        return res.json({ url: paymentUrl });

    } catch (err) {
        console.error("VNPay ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
});


// ✅ API NHẬN KẾT QUẢ TỪ VNPAY
router.get("/check-payment-vnpay", (req, res) => {
    const data = req.query;

    console.log("VNPay return:", data);

    if (data.vnp_ResponseCode === "00") {
        return res.send("Thanh toán thành công ✅");
    } else {
        return res.send("Thanh toán thất bại ❌");
    }
});

module.exports = router;