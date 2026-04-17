const API = import.meta.env.vite_api_url;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./cart.css";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();

  function getUser() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function load() {
    const user = getUser();
    if (user && user.id) {
      fetch(`${API}/cart?id_KH=${user.id}`)
        .then((r) => r.json())
        .then((data) => setItems(data || []))
        .catch(() => setItems([]));
    } else {
      try {
        const raw = localStorage.getItem('cartItems') || '[]';
        setItems(JSON.parse(raw));
      } catch { setItems([]); }
    }
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
          {items.map((it) => {
            const rawImg = it.variant_image || it.anh || '';
            const imgSrc = rawImg.startsWith('http') ? rawImg : `http://localhost:5000${rawImg}`;
            const variantInfo = [it.size_name, it.color_name].filter(Boolean).join(' / ');
            return (
            <div key={it.id} className="cart-item">
              <img src={imgSrc} alt={it.ten_sanpham} />
              <div className="info">
                <div className="name">{it.ten_sanpham}</div>
                {variantInfo && <div className="variant-info" style={{ fontSize: '0.85rem', color: '#888' }}>{variantInfo}</div>}
                <div>Số lượng: {it.quantity}</div>
                <div className="price">{Number(it.gia_khuyen_mai || it.gia_goc).toLocaleString('vi-VN')}₫</div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <div className="cart-footer">
        <div className="total">Tổng: {total.toLocaleString('vi-VN')}₫</div>
        <button className="checkout-btn" onClick={() => navigate('/checkout')}>Thanh toán</button>
      </div>
    </div>
  );
}
