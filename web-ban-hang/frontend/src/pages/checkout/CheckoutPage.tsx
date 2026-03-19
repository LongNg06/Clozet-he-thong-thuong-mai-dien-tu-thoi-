import { useState } from "react";
import "./checkout.css";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  function handleCheckout() {
    setLoading(true);
    fetch("http://localhost:5000/cart/checkout", { method: "POST" })
      .then((r) => r.json())
      .then(() => {
        setLoading(false);
        alert("Thanh toán thành công (mô phỏng)");
        window.location.href = "/";
      })
      .catch(() => {
        setLoading(false);
        alert("Lỗi thanh toán");
      });
  }

  return (
    <div className="checkout-page container">
      <h2>Checkout / Thanh toán</h2>
      <div className="checkout-box">
        <p>Form thanh toán mẫu (mô phỏng)</p>
        <button className="pay-btn" onClick={handleCheckout} disabled={loading}>
          {loading ? "Đang xử lý..." : "Tiến hành thanh toán"}
        </button>
      </div>
    </div>
  );
}
