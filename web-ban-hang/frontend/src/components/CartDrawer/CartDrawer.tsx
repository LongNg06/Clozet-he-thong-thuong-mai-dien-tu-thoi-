import { useEffect, useState } from "react";
import "./CartDrawer.css";

interface CartItem {
  id: number;
  id_sanpham: number;
  quantity: number;
  ten_sanpham?: string;
  anh?: string;
  gia_goc?: number | string;
  gia_khuyen_mai?: number | string | null;
  trang_thai?: number;
}

function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ===== localStorage cart helpers (guest) =====
function getLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('cartItems');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveLocalCart(items: CartItem[]) {
  localStorage.setItem('cartItems', JSON.stringify(items));
}

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  function load() {
    const loggedIn = !!getUser();
    if (loggedIn) {
      // Logged in: fetch from backend DB
      fetch("http://localhost:5000/cart")
        .then((r) => r.json())
        .then((d: CartItem[]) => setItems(d || []))
        .catch(() => setItems([]));
    } else {
      // Guest: load from localStorage
      setItems(getLocalCart());
    }
  }

  useEffect(() => {
    function show() {
      setOpen(true);
      load();
    }
    window.addEventListener("cart:open", show as EventListener);
    window.addEventListener("cartUpdated", () => load());
    return () => {
      window.removeEventListener("cart:open", show as EventListener);
      window.removeEventListener("cartUpdated", () => load());
    };
  }, []);

  function updateQuantity(id: number, newQty: number) {
    if (newQty < 1) return;
    if (!!getUser()) {
      fetch("http://localhost:5000/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: newQty }),
      })
        .then(() => load())
        .catch(() => load());
    } else {
      // Guest: update localStorage
      const cart = getLocalCart();
      const item = cart.find(it => it.id === id || it.id_sanpham === id);
      if (item) item.quantity = newQty;
      saveLocalCart(cart);
      setItems([...cart]);
    }
  }

  function removeItem(id: number) {
    if (!!getUser()) {
      fetch(`http://localhost:5000/cart/remove/${id}`, { method: 'DELETE' })
        .then(() => load())
        .catch(() => load());
    } else {
      // Guest: remove from localStorage
      const cart = getLocalCart().filter(it => it.id !== id && it.id_sanpham !== id);
      saveLocalCart(cart);
      setItems([...cart]);
    }
  }

  const grandTotal = items.reduce((s, it) => {
    const price = Number(it.gia_khuyen_mai || it.gia_goc || 0);
    return s + (it.quantity || 0) * price;
  }, 0);

  const FREE_SHIP_THRESHOLD = 500000;
  const remainingForFree = Math.max(0, FREE_SHIP_THRESHOLD - grandTotal);
  const progress = Math.min(1, grandTotal / FREE_SHIP_THRESHOLD);

  return (
    <>
      {open && <div className="cart-backdrop" onClick={() => setOpen(false)} />}
      <div className={`cart-drawer ${open ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Giỏ hàng</h3>
      </div>

      {/* free shipping progress */}
      <div className="free-ship">
        <div className="free-ship-text">
          {grandTotal >= FREE_SHIP_THRESHOLD ? (
            <strong>Bạn đã được MIỄN PHÍ VẬN CHUYỂN</strong>
          ) : (
            <span> Mua Thêm <strong>{remainingForFree.toLocaleString('vi-VN')}₫</strong>  để được miễn phí vận chuyển</span>
          )}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          <div className="progress-icon">🚚</div>
        </div>
      </div>

      <div className="drawer-body">
        {items.length === 0 ? <p>Không có sản phẩm</p> : (
          items.map(it => {
            const itemKey = it.id || it.id_sanpham;
            const imgSrc = it.anh?.startsWith('http') ? it.anh : `http://localhost:5000${it.anh}`;
            return (
            <div key={itemKey} className="drawer-item">
              <img src={imgSrc} alt={it.ten_sanpham} />
              <div className="meta">
                <div className="name">{it.ten_sanpham}</div>
                <div className="price">{Number(it.gia_khuyen_mai || it.gia_goc).toLocaleString('vi-VN')}₫</div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(it.id || it.id_sanpham, (it.quantity || 0) - 1)}>-</button>
                  <span className="qty">{it.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(it.id || it.id_sanpham, (it.quantity || 0) + 1)}>+</button>
                </div>
                <div className="item-total">Tổng: {(Number(it.gia_khuyen_mai || it.gia_goc) * (it.quantity || 0)).toLocaleString('vi-VN')}₫</div>
              </div>
              <button className="remove-btn" onClick={() => removeItem(it.id || it.id_sanpham)}>×</button>
            </div>
            );
          })
        )}
      </div>

      <div className="drawer-footer">
        <div className="footer-total">Tổng cộng: <strong>{grandTotal.toLocaleString('vi-VN')}₫</strong></div>
        <button className="view-cart" onClick={() => {
          if (grandTotal >= FREE_SHIP_THRESHOLD) {
            try { localStorage.setItem('checkoutShipping','free'); } catch {};
          } else {
            try { localStorage.removeItem('checkoutShipping'); } catch {};
          }
          // Save items for checkout if guest
          if (!getUser()) {
            localStorage.setItem('checkoutItems', JSON.stringify(items));
          }
          window.location.href = '/checkout';
        }}>Thanh toán</button>
      </div>
      </div>
    </>
  );
}
