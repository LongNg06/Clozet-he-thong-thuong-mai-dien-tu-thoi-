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

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  function load() {
    fetch("http://localhost:5000/cart")
      .then((r) => r.json())
      .then((d: CartItem[]) => setItems(d || []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    function show() {
      setOpen(true);
      load();
    }
    window.addEventListener("cart:open", show as EventListener);
    return () => window.removeEventListener("cart:open", show as EventListener);
  }, []);

  function updateQuantity(id: number, newQty: number) {
    if (newQty < 1) return; // do not allow less than 1
    fetch("http://localhost:5000/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity: newQty }),
    })
      .then((r) => r.json())
      .then(() => {
        load();
        // notify other components (header) to refresh count
        window.dispatchEvent(new Event('cart:open'));
      })
      .catch(() => {
        // still reload for safety
        load();
      });
  }

  function removeItem(id: number) {
    fetch(`http://localhost:5000/cart/remove/${id}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then(() => {
        load();
        window.dispatchEvent(new Event('cart:open'));
      })
      .catch(() => load());
  }

  const grandTotal = items.reduce((s, it) => {
    const price = Number(it.gia_khuyen_mai || it.gia_goc || 0);
    return s + (it.quantity || 0) * price;
  }, 0);

  const FREE_SHIP_THRESHOLD = 1000000; // 1,000,000 VND
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
          items.map(it => (
            <div key={it.id} className="drawer-item">
              <img src={it.anh?.startsWith('http')? it.anh : `http://localhost:5000${it.anh}`} alt={it.ten_sanpham} />
              <div className="meta">
                <div className="name">{it.ten_sanpham}</div>
                <div className="price">{Number(it.gia_khuyen_mai || it.gia_goc).toLocaleString('vi-VN')}₫</div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(it.id, (it.quantity || 0) - 1)}>-</button>
                  <span className="qty">{it.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(it.id, (it.quantity || 0) + 1)}>+</button>
                </div>
                <div className="item-total">Tổng: {(Number(it.gia_khuyen_mai || it.gia_goc) * (it.quantity || 0)).toLocaleString('vi-VN')}₫</div>
              </div>
              <button className="remove-btn" onClick={() => removeItem(it.id)}>×</button>
            </div>
          ))
        )}
      </div>

      <div className="drawer-footer">
        <div className="footer-total">Tổng cộng: <strong>{grandTotal.toLocaleString('vi-VN')}₫</strong></div>
        <a href="/checkout" className="view-cart">Thanh toán</a>
      </div>
      </div>
    </>
  );
}
