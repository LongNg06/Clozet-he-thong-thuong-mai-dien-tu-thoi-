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
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [lockedShipping, setLockedShipping] = useState(false)

  useEffect(() => {
    // Prefer fetching cart from backend (server-side cart used elsewhere)
    fetch('http://localhost:5000/cart')
      .then((r) => r.json())
      .then((data) => {
        console.log('CheckoutPage fetched cart from backend:', data)
        setCartItems(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.warn('Failed to fetch cart from backend, falling back to localStorage', err)
        try {
              const raw = localStorage.getItem('checkoutItems') || localStorage.getItem('cartItems') || '[]'
              const parsed = JSON.parse(raw)
              console.log('CheckoutPage fallback loaded from localStorage:', parsed)
              setCartItems(Array.isArray(parsed) ? parsed : [])
            } catch (e) {
              console.error('Error reading cart from localStorage', e)
              setCartItems([])
            }
      })
  }, []);

  // Apply checkout shipping preference from cart drawer (if any)
  useEffect(() => {
    try {
      const pref = localStorage.getItem('checkoutShipping')
      if (pref) {
        setSelectedShipping(pref)
        setLockedShipping(true)
      }
    } catch {}
  }, [])

  // Helpers to support different cart item shapes from backend or localStorage
  const getItemName = (it: any) => it.name || it.ten_sanpham || it.title || ''
  const getItemQuantity = (it: any) => Number(it.quantity || it.so_luong || it.qty || 1)
  const getItemPrice = (it: any) => Number(it.price || it.gia_khuyen_mai || it.gia_goc || it.unit_price || 0)
  const getItemImage = (it: any) => {
    const src = it.image || it.anh || it.img || it.thumbnail || ''
    if (!src) return '/assets/img/default.jpg'
    if (typeof src === 'string' && (src.startsWith('http') || src.startsWith('data:'))) return src
    // prefix backend host if it's a relative path
    if (typeof src === 'string' && src.startsWith('/')) return `http://localhost:5000${src}`
    return src
  }

  const subtotal = cartItems.reduce((s, it) => s + getItemPrice(it) * getItemQuantity(it), 0);

  // When subtotal changes, enforce free shipping if threshold reached
  useEffect(() => {
    if (subtotal >= 500000) {
      setSelectedShipping('free')
      setLockedShipping(true)
      try { localStorage.setItem('checkoutShipping', 'free') } catch {}
    } else {
      // if previously locked due to free shipping but now below threshold, unlock
      try {
        const pref = localStorage.getItem('checkoutShipping')
        if (pref === 'free' && subtotal < 500000) {
          setLockedShipping(false)
          // remove stored pref so user can choose
          localStorage.removeItem('checkoutShipping')
        }
      } catch {}
    }
  }, [subtotal])

      // prefill contact fields from logged user if present
      useEffect(() => {
        try {
          const raw = localStorage.getItem('user')
          if (raw) {
            const u = JSON.parse(raw)
            if (u) {
              if (!name) setName(u.name || u.ho_ten || u.fullname || '')
              if (!email) setEmail(u.email || '')
              if (!phone) setPhone(u.phone || u.sdt || '')
            }
          }
        } catch (e) {
          // ignore
        }
      }, [])


  const shippingOptions = [
    { id: 'standard', name: 'Giao hàng tiêu chuẩn', description: '3-5 ngày làm việc', price: 15000 },
    { id: 'express', name: 'Giao hàng nhanh', description: '1-2 ngày làm việc', price: 35000 },
    { id: 'same-day', name: 'Giao hàng trong ngày', description: 'Trong vòng 24h (chỉ HCM, HN)', price: 50000 },
    { id: 'free', name: 'Miễn phí vận chuyển', description: 'Đơn hàng trên 500.000₫', price: 0, condition: subtotal >= 500000 }
  ]

  const selectedShippingOption = shippingOptions.find(o => o.id === selectedShipping)
  const shippingFee = selectedShippingOption?.price || 0
  const total = subtotal + shippingFee

  const validateForm = () => {
    const e: any = {}
    if (!name.trim()) e.name = 'Vui lòng nhập họ và tên'
    if (!email.trim()) e.email = 'Vui lòng nhập email'
    else if (!email.includes('@')) e.email = "Email phải chứa ký tự '@'"
    if (!phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^\d{10}$/.test(phone.replace(/\s+/g, ''))) e.phone = 'Số điện thoại phải có đúng 10 chữ số'
    if (!address.trim()) e.address = 'Vui lòng nhập địa chỉ giao hàng'
    if (!city.trim()) e.city = 'Vui lòng nhập thành phố'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // VNPay: call backend to create payment URL and redirect
  async function handleVnPay() {
    if (!validateForm()) return
    if (subtotal <= 0) {
      alert("Giỏ hàng trống");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: subtotal, customer: { name, email, phone, address, city, ward } })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Không tạo được phiên VNPay");
      }
      const data = await res.json();
      const url = data?.url;
      if (!url) throw new Error("Không nhận được url thanh toán từ server");
      // redirect to VNPay sandbox
      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Lỗi khi tạo phiên VNPay");
    } finally {
      setLoading(false);
    }
  }

  // COD: simulate order creation and clear cart
  async function handleCod() {
    if (!validateForm()) return
    if (subtotal <= 0) {
      alert("Giỏ hàng trống");
      return;
    }
    setLoading(true);
    try {
      // In real app call backend to create order. Here simulate and include guest info
      const orderPayload = { items: cartItems, payment: 'cod', customer: { name, email, phone, address, city, ward }, total: total };
      console.log('Simulated COD order payload:', orderPayload);
      // Remove purchased items from localStorage
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      alert("Đặt hàng thành công (COD mô phỏng). Cảm ơn " + (name || 'khách hàng') + "!");
      window.location.href = "/";
    } catch (e) {
      alert("Lỗi khi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-wrapper max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <a href="/cart" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại giỏ hàng
        </a>
        <h1 className="text-2xl font-bold">Xác nhận thanh toán</h1>
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

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="radio" name="payment" value="vnpay" onChange={() => {}} />
                  <span>VNPay (mô phỏng)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="payment" value="cod" onChange={() => {}} />
                  <span>COD - Thanh toán khi nhận hàng</span>
                </label>
              </div>
            </div>

            <div>
              <button onClick={handleVnPay} disabled={loading || cartItems.length === 0} className="w-full py-3 rounded-lg bg-blue-600 text-white">
                {loading ? 'Đang xử lý...' : 'Thanh toán VNPay'}
              </button>
            </div>
            <div>
              <button onClick={handleCod} disabled={loading || cartItems.length === 0} className="w-full py-3 rounded-lg bg-gray-200">
                Đặt hàng (COD)
              </button>
            </div>
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
            {/* Shipping options */}
            <div className="shipping-options mt-3">
              {shippingOptions.map(option => (
                <label
                  key={option.id}
                  className={`shipping-option ${selectedShipping === option.id ? 'selected' : ''} ${lockedShipping && option.id !== selectedShipping ? 'disabled' : ''}`}
                  onClick={() => { if (!lockedShipping) setSelectedShipping(option.id) }}
                  aria-disabled={lockedShipping && option.id !== selectedShipping}
                >
                  <div className="ship-row">
                    <div className="ship-name">{option.name}</div>
                    <div className="ship-price">{option.price === 0 ? 'Miễn phí' : `${option.price.toLocaleString('vi-VN')}₫`}</div>
                  </div>
                  <div className="ship-desc">{option.description}</div>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
