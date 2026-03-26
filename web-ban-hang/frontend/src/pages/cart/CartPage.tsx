import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./cart.css";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();

  function load() {
    fetch("http://localhost:5000/cart")
      .then((r) => r.json())
      .then((data) => setItems(data || []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    load();
  }, []);

  const total = items.reduce((s, it) => s + (it.quantity || 0) * (Number(it.gia_khuyen_mai || it.gia_goc || 0)), 0);

  return (
    <div className="cart-page container">
      <h2>Giỏ hàng</h2>
      {items.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <div className="cart-list">
          {items.map((it) => (
            <div key={it.id} className="cart-item">
              <img src={it.anh?.startsWith('http')? it.anh : `http://localhost:5000${it.anh}`} alt={it.ten_sanpham} />
              <div className="info">
                <div className="name">{it.ten_sanpham}</div>
                <div>Số lượng: {it.quantity}</div>
                <div className="price">{Number(it.gia_khuyen_mai || it.gia_goc).toLocaleString('vi-VN')}₫</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-footer">
        <div className="total">Tổng: {total.toLocaleString('vi-VN')}₫</div>
        <button className="checkout-btn" onClick={() => navigate('/checkout')}>Thanh toán</button>
      </div>
    </div>
  );
}
