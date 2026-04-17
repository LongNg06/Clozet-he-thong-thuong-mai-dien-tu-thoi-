import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./account.css";

const API = import.meta.env.vite_api_url;

interface Order {
  id_donhang: number;
  tong_tien_hang: number;
  phi_van_chuyen: number;
  tong_thanh_toan: number;
  trang_thai_donhang: string;
  ngay_dat: string;
  phuong_thuc_thanh_toan?: string;
  ten_nguoinhan?: string;
  so_dien_thoai?: string;
  dia_chi_cu_the?: string;
  phuong_xa?: string;
  quan_huyen?: string;
  tinh_thanh?: string;
}

interface OrderItem {
  id_sanpham: number;
  ten_sanpham: string;
  so_luong: number;
  gia: number;
  size_name?: string;
  color_name?: string;
  anh?: string;
}

interface WishItem {
  id: number;
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number;
  gia_khuyen_mai?: number;
  anh?: string;
  ngay_them: string;
}

interface Address {
  id_diachi: number;
  ten_nguoinhan: string;
  so_dien_thoai: string;
  dia_chi_cu_the: string;
  phuong_xa?: string;
  quan_huyen?: string;
  tinh_thanh?: string;
}

function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function imgUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API}${path}`;
}

const STATUS_MAP: Record<string, string> = {
  cho_xac_nhan: "Chờ xác nhận",
  dang_giao: "Đang giao",
  da_giao: "Đã giao",
  da_huy: "Đã hủy",
};

const PAYMENT_STATUS_MAP: Record<string, string> = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
  hoan_tien: "Hoàn tiền",
};

export default function AccountPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [tab, setTab] = useState<"info" | "address" | "orders" | "wishlist" | "logout">("info");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ ten_nguoinhan: "", so_dien_thoai: "", dia_chi_cu_the: "", phuong_xa: "", quan_huyen: "", tinh_thanh: "" });
  const [addrSaving, setAddrSaving] = useState(false);
  const [orderTab, setOrderTab] = useState<"cod" | "online">("cod");

  // Order detail expansion
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<number | null>(null);

  // Inline review states
  const [reviewingProduct, setReviewingProduct] = useState<{ id_sanpham: number; id_donhang: number } | null>(null);
  const [reviewStar, setReviewStar] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());

  // Wishlist
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [selectedWish, setSelectedWish] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Load orders & addresses & wishlist
    fetch(`${API}/user/orders?id_KH=${user.id}`)
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]));

    fetch(`${API}/user/addresses?id_KH=${user.id}`)
      .then((r) => r.json())
      .then((d) => setAddresses(Array.isArray(d) ? d : []))
      .catch(() => setAddresses([]));

    fetch(`${API}/wishlist?id_KH=${user.id}`)
      .then((r) => r.json())
      .then((d) => setWishlist(Array.isArray(d) ? d : []))
      .catch(() => setWishlist([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user:logout"));
    navigate("/");
  };

  const loadAddresses = () => {
    fetch(`${API}/user/addresses?id_KH=${user.id}`)
      .then((r) => r.json())
      .then((d) => setAddresses(Array.isArray(d) ? d : []))
      .catch(() => setAddresses([]));
  };

  const loadOrders = () => {
    fetch(`${API}/user/orders?id_KH=${user.id}`)
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]));
  };

  const handleCancelOrder = async (id_donhang: number) => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn hàng #" + id_donhang + "?")) return;
    try {
      const res = await fetch(`${API}/user/orders/${id_donhang}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_KH: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đã hủy đơn hàng thành công!");
        loadOrders();
      } else {
        alert(data.message || "Không thể hủy đơn hàng");
      }
    } catch {
      alert("Lỗi kết nối server");
    }
  };

  const handleAddAddress = async () => {
    if (!addrForm.ten_nguoinhan.trim() || !addrForm.so_dien_thoai.trim() || !addrForm.dia_chi_cu_the.trim()) {
      alert("Vui lòng nhập đầy đủ: tên, SĐT, địa chỉ cụ thể");
      return;
    }
    setAddrSaving(true);
    try {
      const res = await fetch(`${API}/user/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_KH: user.id, ...addrForm }),
      });
      if (!res.ok) throw new Error("Lỗi thêm địa chỉ");
      setAddrForm({ ten_nguoinhan: "", so_dien_thoai: "", dia_chi_cu_the: "", phuong_xa: "", quan_huyen: "", tinh_thanh: "" });
      setShowAddrForm(false);
      loadAddresses();
    } catch {
      alert("Không thể thêm địa chỉ");
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id_diachi: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      const res = await fetch(`${API}/user/addresses/${id_diachi}?id_KH=${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      loadAddresses();
    } catch {
      alert("Không thể xóa địa chỉ");
    }
  };

  // ===== ORDER DETAIL TOGGLE =====
  const toggleOrderDetail = async (id_donhang: number) => {
    if (expandedOrder === id_donhang) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(id_donhang);
    if (orderItems[id_donhang]) return; // already loaded

    setLoadingItems(id_donhang);
    try {
      const res = await fetch(`${API}/user/orders/${id_donhang}/items?id_KH=${user.id}`);
      const data = await res.json();
      setOrderItems((prev) => ({ ...prev, [id_donhang]: Array.isArray(data) ? data : [] }));
    } catch {
      setOrderItems((prev) => ({ ...prev, [id_donhang]: [] }));
    } finally {
      setLoadingItems(null);
    }
  };

  // ===== INLINE REVIEW =====
  const handleInlineReview = async () => {
    if (!reviewingProduct || !user?.id) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sanpham: reviewingProduct.id_sanpham,
          id_KH: user.id,
          id_donhang: reviewingProduct.id_donhang,
          so_sao: reviewStar,
          noi_dung: reviewText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đánh giá thành công!");
        setReviewedItems((prev) => new Set(prev).add(`${reviewingProduct.id_donhang}-${reviewingProduct.id_sanpham}`));
        setReviewingProduct(null);
        setReviewText("");
        setReviewStar(5);
      } else {
        alert(data.message || "Lỗi khi đánh giá");
      }
    } catch {
      alert("Lỗi kết nối server");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ===== WISHLIST FUNCTIONS =====
  const loadWishlist = () => {
    fetch(`${API}/wishlist?id_KH=${user.id}`)
      .then((r) => r.json())
      .then((d) => setWishlist(Array.isArray(d) ? d : []))
      .catch(() => setWishlist([]));
  };

  const removeFromWishlist = async (id_sanpham: number) => {
    try {
      await fetch(`${API}/wishlist/${id_sanpham}?id_KH=${user.id}`, { method: "DELETE" });
      loadWishlist();
    } catch {
      alert("Lỗi xóa sản phẩm yêu thích");
    }
  };

  const toggleWishSelect = (id_sanpham: number) => {
    setSelectedWish((prev) => {
      const next = new Set(prev);
      if (next.has(id_sanpham)) next.delete(id_sanpham);
      else next.add(id_sanpham);
      return next;
    });
  };

  const buySelectedWish = async () => {
    if (selectedWish.size === 0) { alert("Vui lòng chọn sản phẩm"); return; }
    for (const id_sp of selectedWish) {
      try {
        await fetch(`${API}/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_KH: user.id, id_sanpham: id_sp, quantity: 1 }),
        });
      } catch {}
    }
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/checkout");
  };

  return (
    <div className="account-container">
      <h1 className="account-title">Tài khoản của bạn</h1>
      <div className="account-divider" />

      <div className="account-layout">
        {/* SIDEBAR */}
        <div className="account-sidebar">
          <h3>TÀI KHOẢN</h3>
          <ul>
            <li className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>
              <i className="fa-regular fa-user" /> Thông tin tài khoản
            </li>
            <li className={tab === "address" ? "active" : ""} onClick={() => setTab("address")}>
              <i className="fa-regular fa-map" /> Danh sách địa chỉ
            </li>
            <li className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
              <i className="fa-regular fa-file-lines" /> Đơn hàng của tôi
            </li>
            <li className={tab === "wishlist" ? "active" : ""} onClick={() => setTab("wishlist")}>
              <i className="fa-regular fa-heart" /> Sản phẩm yêu thích
            </li>
            <li onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
            </li>
          </ul>
        </div>

        {/* CONTENT */}
        <div className="account-content">
          {tab === "info" && (
            <div className="account-info">
              <h3>THÔNG TIN TÀI KHOẢN</h3>
              <p className="info-name">{user.name || user.ho_ten || "—"}</p>
              <p className="info-email">{user.email || "—"}</p>
              <p className="info-country">Vietnam</p>
            </div>
          )}

          {tab === "address" && (
            <div className="account-addresses">
              <div className="addr-header">
                <h3>ĐỊA CHỈ CỦA BẠN</h3>
                <button className="btn-add-addr" onClick={() => setShowAddrForm(!showAddrForm)}>
                  {showAddrForm ? "Hủy" : "+ Thêm địa chỉ mới"}
                </button>
              </div>

              {showAddrForm && (
                <div className="addr-form">
                  <div className="addr-form-row">
                    <input placeholder="Tên người nhận *" value={addrForm.ten_nguoinhan} onChange={(e) => setAddrForm({ ...addrForm, ten_nguoinhan: e.target.value })} />
                    <input placeholder="Số điện thoại *" value={addrForm.so_dien_thoai} onChange={(e) => setAddrForm({ ...addrForm, so_dien_thoai: e.target.value })} />
                  </div>
                  <input placeholder="Địa chỉ cụ thể (số nhà, đường) *" value={addrForm.dia_chi_cu_the} onChange={(e) => setAddrForm({ ...addrForm, dia_chi_cu_the: e.target.value })} />
                  <div className="addr-form-row">
                    <input placeholder="Phường/Xã" value={addrForm.phuong_xa} onChange={(e) => setAddrForm({ ...addrForm, phuong_xa: e.target.value })} />
                    <input placeholder="Quận/Huyện" value={addrForm.quan_huyen} onChange={(e) => setAddrForm({ ...addrForm, quan_huyen: e.target.value })} />
                    <input placeholder="Tỉnh/Thành phố" value={addrForm.tinh_thanh} onChange={(e) => setAddrForm({ ...addrForm, tinh_thanh: e.target.value })} />
                  </div>
                  <button className="btn-save-addr" onClick={handleAddAddress} disabled={addrSaving}>
                    {addrSaving ? "Đang lưu..." : "Lưu địa chỉ"}
                  </button>
                </div>
              )}

              {addresses.length === 0 && !showAddrForm ? (
                <p className="empty-msg">Bạn chưa có địa chỉ nào.</p>
              ) : (
                <div className="address-list">
                  {addresses.map((a) => (
                    <div key={a.id_diachi} className="address-card">
                      <p className="addr-name">{a.ten_nguoinhan}</p>
                      <p>{a.so_dien_thoai}</p>
                      <p>
                        {[a.dia_chi_cu_the, a.phuong_xa, a.quan_huyen, a.tinh_thanh]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <button className="btn-delete-addr" onClick={() => handleDeleteAddress(a.id_diachi)}>
                        <i className="fa-regular fa-trash-can" /> Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "orders" && (
            <div className="account-orders">
              <h3>ĐƠN HÀNG CỦA BẠN</h3>

              {/* Order sub-tabs */}
              <div className="order-sub-tabs">
                <button className={`order-sub-tab ${orderTab === "cod" ? "active" : ""}`} onClick={() => setOrderTab("cod")}>
                  💵 Thanh toán COD
                </button>
                <button className={`order-sub-tab ${orderTab === "online" ? "active" : ""}`} onClick={() => setOrderTab("online")}>
                  💳 Thanh toán Online
                </button>
              </div>

              {/* Render order list (shared logic) */}
              {(() => {
                const filtered = orderTab === "cod"
                  ? orders.filter(o => !o.phuong_thuc_thanh_toan || o.phuong_thuc_thanh_toan === "cod")
                  : orders.filter(o => o.phuong_thuc_thanh_toan && o.phuong_thuc_thanh_toan !== "cod");

                if (filtered.length === 0)
                  return <p className="empty-msg">Không có đơn hàng {orderTab === "cod" ? "COD" : "online"} nào.</p>;

                return (
                  <div className="order-cards-list">
                    {filtered.map((o) => {
                      const isExpanded = expandedOrder === o.id_donhang;
                      const items = orderItems[o.id_donhang] || [];
                      const isLoading = loadingItems === o.id_donhang;

                      let payStatus = "chua_thanh_toan";
                      if (orderTab === "online") {
                        payStatus = o.trang_thai_donhang === "da_huy" ? "hoan_tien" : "da_thanh_toan";
                      }

                      return (
                        <div key={o.id_donhang} className={`order-card-wrap ${isExpanded ? "expanded" : ""}`}>
                          <div className="order-card-header" onClick={() => toggleOrderDetail(o.id_donhang)}>
                            <div className="order-card-info">
                              <span className="order-card-id">#{o.id_donhang}</span>
                              <span className="order-card-date">{new Date(o.ngay_dat).toLocaleDateString("vi-VN")}</span>
                              <span className="order-card-receiver">{o.ten_nguoinhan || "—"}</span>
                            </div>
                            <div className="order-card-right">
                              <span className="order-card-total">{Number(o.tong_thanh_toan).toLocaleString("vi-VN")}₫</span>
                              <span className={`order-status ${o.trang_thai_donhang}`}>
                                {STATUS_MAP[o.trang_thai_donhang] || o.trang_thai_donhang}
                              </span>
                              {orderTab === "online" && (
                                <span className={`payment-status ${payStatus}`}>
                                  {PAYMENT_STATUS_MAP[payStatus] || payStatus}
                                </span>
                              )}
                              {o.trang_thai_donhang === "cho_xac_nhan" && (
                                <button className="btn-cancel-order" onClick={(e) => { e.stopPropagation(); handleCancelOrder(o.id_donhang); }}>
                                  Hủy đơn
                                </button>
                              )}
                              <span className={`order-expand-icon ${isExpanded ? "open" : ""}`}>▼</span>
                            </div>
                          </div>

                          {/* Expanded order detail */}
                          {isExpanded && (
                            <div className="order-detail-panel">
                              {/* Shipping info */}
                              <div className="order-detail-addr">
                                <strong>Giao đến:</strong> {[o.dia_chi_cu_the, o.phuong_xa, o.quan_huyen, o.tinh_thanh].filter(Boolean).join(", ") || "—"}
                                {o.so_dien_thoai && <> — SĐT: {o.so_dien_thoai}</>}
                              </div>

                              {isLoading ? (
                                <p className="loading-text">Đang tải chi tiết...</p>
                              ) : items.length === 0 ? (
                                <p className="empty-msg">Không có sản phẩm nào.</p>
                              ) : (
                                <div className="order-items-list">
                                  {items.map((item, idx) => {
                                    const key = `${o.id_donhang}-${item.id_sanpham}`;
                                    const alreadyReviewed = reviewedItems.has(key);
                                    const isReviewingThis = reviewingProduct?.id_sanpham === item.id_sanpham && reviewingProduct?.id_donhang === o.id_donhang;

                                    return (
                                      <div key={idx} className="order-item-row">
                                        <div className="order-item-img">
                                          {item.anh ? (
                                            <img src={imgUrl(item.anh)} alt={item.ten_sanpham} />
                                          ) : (
                                            <div className="no-img">📦</div>
                                          )}
                                        </div>
                                        <div className="order-item-info">
                                          <span className="order-item-name" onClick={() => navigate(`/product/${item.id_sanpham}`)} style={{ cursor: "pointer" }}>
                                            {item.ten_sanpham}
                                          </span>
                                          <span className="order-item-variant">
                                            {[item.color_name, item.size_name].filter(Boolean).join(" / ") || ""} × {item.so_luong}
                                          </span>
                                        </div>
                                        <div className="order-item-price">
                                          {Number(item.gia).toLocaleString("vi-VN")}₫
                                        </div>
                                        <div className="order-item-actions">
                                          {o.trang_thai_donhang === "da_giao" && !alreadyReviewed && !isReviewingThis && (
                                            <button
                                              className="btn-review-inline"
                                              onClick={() => {
                                                setReviewingProduct({ id_sanpham: item.id_sanpham, id_donhang: o.id_donhang });
                                                setReviewStar(5);
                                                setReviewText("");
                                              }}
                                            >
                                              ⭐ Đánh giá
                                            </button>
                                          )}
                                          {alreadyReviewed && (
                                            <span className="reviewed-badge">✓ Đã đánh giá</span>
                                          )}
                                        </div>

                                        {/* Inline review form */}
                                        {isReviewingThis && (
                                          <div className="inline-review-form">
                                            <div className="inline-review-stars">
                                              {[1, 2, 3, 4, 5].map((s) => (
                                                <span
                                                  key={s}
                                                  className={`star-input ${s <= (reviewHover || reviewStar) ? "filled" : ""}`}
                                                  onClick={() => setReviewStar(s)}
                                                  onMouseEnter={() => setReviewHover(s)}
                                                  onMouseLeave={() => setReviewHover(0)}
                                                >★</span>
                                              ))}
                                              <span className="star-label-sm">
                                                {reviewStar === 1 && "Rất tệ"}{reviewStar === 2 && "Tệ"}{reviewStar === 3 && "Bình thường"}{reviewStar === 4 && "Tốt"}{reviewStar === 5 && "Tuyệt vời"}
                                              </span>
                                            </div>
                                            <textarea
                                              placeholder="Chia sẻ cảm nhận của bạn..."
                                              value={reviewText}
                                              onChange={(e) => setReviewText(e.target.value)}
                                              rows={3}
                                            />
                                            <div className="inline-review-btns">
                                              <button className="btn-submit-review" onClick={handleInlineReview} disabled={submittingReview}>
                                                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                                              </button>
                                              <button className="btn-cancel-review" onClick={() => setReviewingProduct(null)}>Hủy</button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Order summary in detail */}
                              <div className="order-detail-summary">
                                <span>Tiền hàng: {Number(o.tong_tien_hang).toLocaleString("vi-VN")}₫</span>
                                <span>Phí vận chuyển: {Number(o.phi_van_chuyen).toLocaleString("vi-VN")}₫</span>
                                <strong>Tổng: {Number(o.tong_thanh_toan).toLocaleString("vi-VN")}₫</strong>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ===== WISHLIST TAB ===== */}
          {tab === "wishlist" && (
            <div className="account-wishlist">
              <div className="wishlist-header">
                <h3>SẢN PHẨM YÊU THÍCH</h3>
                {wishlist.length > 0 && selectedWish.size > 0 && (
                  <button className="btn-buy-wish" onClick={buySelectedWish}>
                    🛒 Mua {selectedWish.size} sản phẩm đã chọn
                  </button>
                )}
              </div>

              {wishlist.length === 0 ? (
                <p className="empty-msg">Bạn chưa có sản phẩm yêu thích nào. Hãy nhấn ❤️ ở trang chi tiết sản phẩm!</p>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map((w) => {
                    const price = w.gia_khuyen_mai ? Number(w.gia_khuyen_mai) : Number(w.gia_goc);
                    const isSelected = selectedWish.has(w.id_sanpham);
                    return (
                      <div key={w.id} className={`wish-card ${isSelected ? "selected" : ""}`}>
                        <label className="wish-checkbox">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleWishSelect(w.id_sanpham)} />
                        </label>
                        <button className="wish-remove" onClick={() => removeFromWishlist(w.id_sanpham)} title="Xóa">✕</button>
                        <div className="wish-img" onClick={() => navigate(`/product/${w.id_sanpham}`)}>
                          {w.anh ? <img src={imgUrl(w.anh)} alt={w.ten_sanpham} /> : <div className="no-img">📷</div>}
                        </div>
                        <div className="wish-info" onClick={() => navigate(`/product/${w.id_sanpham}`)}>
                          <p className="wish-name">{w.ten_sanpham}</p>
                          <p className="wish-price">{price.toLocaleString("vi-VN")}₫</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
