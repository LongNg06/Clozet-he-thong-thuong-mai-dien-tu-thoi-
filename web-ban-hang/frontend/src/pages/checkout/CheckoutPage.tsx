import { useEffect, useState } from "react";
import "./checkout.css";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  // const [paymentMethod, setPaymentMethod] = useState("vnpay"); // Unused
    // const [selectedShipping, setSelectedShipping] = useState('standard');
    // const [lockedShipping, setLockedShipping] = useState(false);
  const [showCodPopup, setShowCodPopup] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  // Coupon logic
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);

  // Check if user is logged in
  const getUser = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };
  const user = getUser();
  const isLoggedIn = !!user;

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      // Logged in: fetch from backend cart
      fetch(`http://localhost:5000/cart?id_KH=${user.id}`)
        .then((r) => r.json())
        .then((data) => setCartItems(Array.isArray(data) ? data : []))
        .catch(() => {
          // fallback to localStorage
          loadLocalCart();
        });
    } else {
      // Guest: load from localStorage
      loadLocalCart();
    }
  }, []);

  function loadLocalCart() {
    try {
      const raw = localStorage.getItem('checkoutItems') || localStorage.getItem('cartItems') || '[]';
      const parsed = JSON.parse(raw);
      setCartItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCartItems([]);
    }
  }

  // Helpers to support different cart item shapes from backend or localStorage
  const getItemName = (it: any) => it.name || it.ten_sanpham || it.title || ''
  const getItemQuantity = (it: any) => Number(it.quantity || it.so_luong || it.qty || 1)
  const getItemPrice = (it: any) => Number(it.price || it.gia_khuyen_mai || it.gia_goc || it.unit_price || 0)
  const getItemImage = (it: any) => {
    const src = it.variant_image || it.image || it.anh || it.img || it.thumbnail || ''
    if (!src) return '/assets/img/default.jpg'
    if (typeof src === 'string' && (src.startsWith('http') || src.startsWith('data:'))) return src
    if (typeof src === 'string' && src.startsWith('/')) return `http://localhost:5000${src}`
    return src
  }

  // Tổng số lượng sản phẩm trong giỏ (phải đặt sau getItemQuantity)
  const totalQuantity = cartItems.reduce((sum, it) => sum + getItemQuantity(it), 0);
  const getItemVariant = (it: any) => [it.size_name, it.color_name].filter(Boolean).join(' / ')

  const subtotal = cartItems.reduce((s, it) => s + getItemPrice(it) * getItemQuantity(it), 0);

  // prefill contact fields from logged user if present
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || user.ho_ten || user.fullname || '')
      if (!email) setEmail(user.email || '')
      if (!phone) setPhone(user.phone || user.sdt || '')
      // Load saved addresses
      fetch(`http://localhost:5000/user/addresses?id_KH=${user.id}`)
        .then(r => r.json())
        .then(d => setSavedAddresses(Array.isArray(d) ? d : []))
        .catch(() => {});
    }
  }, [])


  // Coupon logic
  const handleCouponChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Nếu chọn SALE20 mà số lượng < 3 thì không cho chọn
    if (value === "SALE20" && totalQuantity < 3) {
      alert("Mã SALE20 chỉ áp dụng khi mua từ 3 sản phẩm trở lên.");
      return;
    }
    setCoupon(value);
    if (value === "SALE10") setDiscount(0.1);
    else if (value === "SALE20") setDiscount(0.2);
    else if (value === "FREESHIP") setDiscount(30000); // 30k freeship
    else setDiscount(0);
  };

  let finalTotal = subtotal;
  if (coupon === "SALE10" || coupon === "SALE20") {
    finalTotal = subtotal - subtotal * discount;
  } else if (coupon === "FREESHIP") {
    finalTotal = subtotal - discount;
  }

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Vui lòng nhập họ và tên'
    if (!email.trim()) e.email = 'Vui lòng nhập email'
    else if (!email.includes('@')) e.email = "Email phải chứa ký tự '@'"
    if (!phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^\d{10}$/.test(phone.replace(/\s+/g, ''))) e.phone = 'Số điện thoại phải có đúng 10 chữ số'
    if (!selectedAddrId) e.address = 'Vui lòng chọn địa chỉ giao hàng'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // VNPay: call backend to create payment URL and redirect
  async function handleVnPay() {
    if (!validateForm()) return;
    if (subtotal <= 0) { alert("Giỏ hàng trống"); return; }

    // Re-check stock for all items before payment
    for (const item of cartItems) {
      const pid = item.id_sanpham;
      if (!pid) continue;
      try {
        const sRes = await fetch(`http://localhost:5000/products/stock/${pid}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          const qty = getItemQuantity(item);
          if (sData.so_luong_ton <= 0) { alert(`Sản phẩm \"${getItemName(item)}\" đã hết hàng!`); return; }
          if (qty > sData.so_luong_ton) { alert(`Sản phẩm \"${getItemName(item)}\" chỉ còn ${sData.so_luong_ton} trong kho!`); return; }
        }
      } catch {}
    }

    try {
      const orderPayload = {
        id_KH: user?.id || null,
        id_diachi: selectedAddrId,
        ten_nguoinhan: name,
        so_dien_thoai: phone,
        dia_chi_cu_the: address,
        phuong_xa: ward,
        quan_huyen: district,
        tinh_thanh: city,
        items: cartItems,
        tong_tien_hang: subtotal,
        phi_van_chuyen: 0,
        tong_thanh_toan: finalTotal,
        payment_method: "vnpay"
      };

      const res = await fetch("http://localhost:5000/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      // Xóa giỏ hàng local và backend (nếu đăng nhập) trước khi chuyển hướng sang VNPAY
      localStorage.removeItem("cartItems");
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("checkoutShipping");
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      if (user?.id) {
        try {
          await fetch(`http://localhost:5000/cart/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_KH: user.id })
          });
        } catch {}
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("VNPay error:", err);
      alert("Lỗi thanh toán VNPay");
    }
  }

  // COD: create order in DB and show popup
  async function handleCod() {
    if (!validateForm()) return
    if (subtotal <= 0) {
      alert("Giỏ hàng trống");
      return;
    }
    setLoading(true);
    try {
      // Re-check stock for all items before placing order
      for (const item of cartItems) {
        const pid = item.id_sanpham;
        if (!pid) continue;
        const sRes = await fetch(`http://localhost:5000/products/stock/${pid}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          const qty = getItemQuantity(item);
          if (sData.so_luong_ton <= 0) {
            alert(`Sản phẩm "${getItemName(item)}" đã hết hàng!`);
            setLoading(false);
            return;
          }
          if (qty > sData.so_luong_ton) {
            alert(`Sản phẩm "${getItemName(item)}" chỉ còn ${sData.so_luong_ton} trong kho!`);
            setLoading(false);
            return;
          }
        }
      }

      const orderPayload = {
        id_KH: user?.id || null,
        ten_nguoinhan: name,
        so_dien_thoai: phone,
        dia_chi_cu_the: address,
        phuong_xa: ward,
        quan_huyen: district,
        tinh_thanh: city,
        items: cartItems,
        tong_tien_hang: subtotal,
        phi_van_chuyen: 0,
        tong_thanh_toan: finalTotal,
        payment_method: "cod"
      };

      const res = await fetch("http://localhost:5000/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Lỗi tạo đơn");
      }

      // Clear cart local và backend (nếu đăng nhập)
      localStorage.removeItem("cartItems");
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("checkoutShipping");
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      if (user?.id) {
        try {
          await fetch(`http://localhost:5000/cart/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_KH: user.id })
          });
        } catch {}
      }
      // Show COD success popup
      setShowCodPopup(true);
    } catch (e: any) {
      alert(e.message || "Lỗi khi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-wrapper max-w-6xl mx-auto py-8 px-4">
      {/* COD Success Popup */}
      {showCodPopup && (
        <div className="cod-popup-overlay" onClick={() => { setShowCodPopup(false); window.location.href = "/"; }}>
          <div className="cod-popup" onClick={e => e.stopPropagation()}>
            <div className="cod-popup-icon">✅</div>
            <div className="cod-popup-main">Đơn hàng đang được xử lý</div>
            <div className="cod-popup-sub">Hãy chuẩn bị tiền khi đơn hàng tới</div>
            <button className="cod-popup-btn" onClick={() => { setShowCodPopup(false); window.location.href = "/"; }}>
              Về trang chủ
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <a href="/cart" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại giỏ hàng
        </a>
        <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>
        <div className="w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Chi tiết thanh toán</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Address fields */}
            <h3 className="checkout-section-title">Địa chỉ giao hàng</h3>

            {isLoggedIn && savedAddresses.length > 0 ? (
              <div className="saved-addr-list">
                {savedAddresses.map((a: any) => (
                  <label
                    key={a.id_diachi}
                    className={`saved-addr-card ${selectedAddrId === a.id_diachi ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedAddrId(a.id_diachi);
                      setName(a.ten_nguoinhan || name);
                      setPhone(a.so_dien_thoai || phone);
                      setAddress(a.dia_chi_cu_the || '');
                      setWard(a.phuong_xa || '');
                      setDistrict(a.quan_huyen || '');
                      setCity(a.tinh_thanh || '');
                    }}
                  >
                    <input type="radio" name="saved-addr" checked={selectedAddrId === a.id_diachi} readOnly />
                    <div className="saved-addr-info">
                      <div className="saved-addr-name">{a.ten_nguoinhan} — {a.so_dien_thoai}</div>
                      <div className="saved-addr-detail">
                        {[a.dia_chi_cu_the, a.phuong_xa, a.quan_huyen, a.tinh_thanh].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </label>
                ))}
                {!selectedAddrId && <p className="text-red-500 text-sm mt-1">Vui lòng chọn địa chỉ giao hàng</p>}
                <a href="/account" className="add-addr-link">+ Thêm địa chỉ mới tại trang tài khoản</a>
              </div>
            ) : (
              <div className="no-addr-msg">
                <p>Bạn chưa có địa chỉ nào được lưu.</p>
                <a href="/account" className="add-addr-link">Thêm địa chỉ tại trang tài khoản →</a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
          <div className="space-y-4 mb-6">
            {cartItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="thumb">
                  <img src={getItemImage(item)} alt={getItemName(item)} className="thumb-img" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{getItemName(item)}</div>
                  {getItemVariant(item) && <div style={{ fontSize: '0.8rem', color: '#888' }}>{getItemVariant(item)}</div>}
                  <div className="text-sm text-gray-500">Số lượng: {getItemQuantity(item)}</div>
                </div>
                <div className="text-right font-semibold">{(getItemPrice(item) * getItemQuantity(item)).toLocaleString('vi-VN')}₫</div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            {/* Coupon options */}
            <div className="shipping-options mt-3">
              <label className={`shipping-option ${coupon === "" ? 'selected' : ''}`}>
                <input type="radio" name="coupon" value="" checked={coupon === ""} onChange={handleCouponChange} />
                Không áp dụng mã giảm giá
              </label>
              <label className={`shipping-option ${coupon === "SALE10" ? 'selected' : ''}`}>
                <input type="radio" name="coupon" value="SALE10" checked={coupon === "SALE10"} onChange={handleCouponChange} />
                SALE10 - Giảm 10%
              </label>
              <label className={`shipping-option ${coupon === "SALE20" ? 'selected' : ''} ${totalQuantity < 3 ? 'disabled' : ''}`}>
                <input type="radio" name="coupon" value="SALE20" checked={coupon === "SALE20"} onChange={handleCouponChange} disabled={totalQuantity < 3} />
                SALE20 - Giảm 20% {totalQuantity < 3 && <span style={{color: 'red', fontSize: '0.9em'}}>(Chỉ áp dụng khi mua ≥ 3 sản phẩm)</span>}
              </label>
              <label className={`shipping-option ${coupon === "FREESHIP" ? 'selected' : ''}`}>
                <input type="radio" name="coupon" value="FREESHIP" checked={coupon === "FREESHIP"} onChange={handleCouponChange} />
                FREESHIP - Giảm 30.000₫
              </label>
            </div>
            <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              {coupon === "SALE10" && <div className="flex justify-between text-sm"><span>Mã giảm giá SALE10</span><span>-{(subtotal * 0.1).toLocaleString('vi-VN')}₫</span></div>}
              {coupon === "SALE20" && <div className="flex justify-between text-sm"><span>Mã giảm giá SALE20</span><span>-{(subtotal * 0.2).toLocaleString('vi-VN')}₫</span></div>}
              {coupon === "FREESHIP" && <div className="flex justify-between text-sm"><span>Mã giảm giá FREESHIP</span><span>-30.000₫</span></div>}
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {/* Payment buttons */}
            <div className="checkout-payment-buttons">
              <button
                type="button"
                onClick={handleCod}
                disabled={loading || cartItems.length === 0}
                className="checkout-btn checkout-btn-cod"
              >
                {loading ? 'Đang xử lý...' : '💵 Đặt hàng (COD)'}
              </button>
              <button
                type="button"
                onClick={handleVnPay}
                disabled={loading || cartItems.length === 0}
                className="checkout-btn checkout-btn-online"
              >
                {loading ? 'Đang xử lý...' : '💳 Thanh toán Online'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
