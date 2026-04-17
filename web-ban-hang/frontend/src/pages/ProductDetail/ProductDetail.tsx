import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number;
  gia_khuyen_mai?: number;
  trang_thai: boolean;
  ten_thuonghieu: string;
  anh?: string;
  anh_bienthe?: string;
  id_mau?: number;
  ten_mau?: string;
  id_kichco?: number;
  ten_kichco?: string;
  so_luong_ton?: number;
}

interface Review {
  id_danhgia: number;
  id_sanpham: number;
  id_KH: number;
  id_donhang: number;
  so_sao: number;
  noi_dung: string;
  ngay_tao: string;
  ho_ten: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [stock, setStock] = useState<number | null>(null);

  const [mainImg, setMainImg] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);

  // Variant states
  const [sizes, setSizes] = useState<{ id: number; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; name: string; image?: string }[]>([]);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("mota");

  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewOrders, setReviewOrders] = useState<{ id_donhang: number }[]>([]);
  const [reviewStar, setReviewStar] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Wishlist state
  const [inWishlist, setInWishlist] = useState(false);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.so_sao, 0) / reviews.length;
  }, [reviews]);

  useEffect(() => {
    // Fetch fresh stock data
    fetch(`http://localhost:5000/products/stock/${id}`)
      .then(r => r.json())
      .then(data => { if (data.so_luong_ton !== undefined) setStock(data.so_luong_ton); })
      .catch(() => {});

    fetch(`http://localhost:5000/products/${id}`)
      .then(res => res.json())
      .then((data: Product[] | Product) => {
        if (Array.isArray(data) && data.length > 0) {
          const base = data[0];
          setProduct(base);

          // Build gallery
          const imgs: string[] = [];
          if (base.anh) {
            const url = base.anh.startsWith("http")
              ? base.anh
              : `http://localhost:5000${base.anh}`;
            imgs.push(url);
          }
          data.forEach((r: Product) => {
            if (r.anh_bienthe) {
              const url = r.anh_bienthe.startsWith("http")
                ? r.anh_bienthe
                : `http://localhost:5000${r.anh_bienthe}`;
              if (!imgs.includes(url)) imgs.push(url);
            }
          });
          setGallery(imgs);
          setMainImg(imgs[0] || "");

          // Extract unique sizes
          const sizeMap = new Map<number, string>();
          data.forEach((r: Product) => {
            if (r.id_kichco && r.ten_kichco) {
              sizeMap.set(r.id_kichco, r.ten_kichco);
            }
          });
          const sizeArr = Array.from(sizeMap, ([id, name]) => ({ id, name }));
          setSizes(sizeArr);
          // Auto-select first size
          if (sizeArr.length > 0) setSelectedSize(sizeArr[0].id);

          // Extract unique colors with their variant images
          const colorMap = new Map<number, { name: string; image?: string }>();
          data.forEach((r: Product) => {
            if (r.id_mau && r.ten_mau) {
              if (!colorMap.has(r.id_mau)) {
                const img = r.anh_bienthe
                  ? (r.anh_bienthe.startsWith("http") ? r.anh_bienthe : `http://localhost:5000${r.anh_bienthe}`)
                  : undefined;
                colorMap.set(r.id_mau, { name: r.ten_mau, image: img });
              }
            }
          });
          setColors(Array.from(colorMap, ([id, val]) => ({ id, name: val.name, image: val.image })));
          // Auto-select first color
          const colorArr = Array.from(colorMap);
          if (colorArr.length > 0) {
            setSelectedColor(colorArr[0][0]);
            if (colorArr[0][1].image) setMainImg(colorArr[0][1].image);
          }
        } else {
          const p = data as Product;
          setProduct(p);
          const img = p?.anh
            ? (p.anh.startsWith("http") ? p.anh : `http://localhost:5000${p.anh}`)
            : "";
          setGallery(img ? [img] : []);
          setMainImg(img);
        }
      });
  }, [id]);

  // Fetch reviews + check review eligibility
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/reviews/${id}`)
      .then(r => r.json())
      .then(data => setReviews(data || []))
      .catch(() => {});

    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (user?.id) {
      fetch(`http://localhost:5000/reviews/can-review/${id}?id_KH=${user.id}`)
        .then(r => r.json())
        .then(data => {
          setCanReview(data.canReview);
          setReviewOrders(data.orders || []);
          if (data.orders?.length > 0) setReviewOrderId(data.orders[0].id_donhang);
        })
        .catch(() => {});

      // Check wishlist
      fetch(`http://localhost:5000/wishlist/check/${id}?id_KH=${user.id}`)
        .then(r => r.json())
        .then(data => setInWishlist(data.inWishlist))
        .catch(() => {});
    }
  }, [id]);

  const handleSubmitReview = async () => {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (!user?.id || !reviewOrderId) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("http://localhost:5000/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_sanpham: Number(id),
          id_KH: user.id,
          id_donhang: reviewOrderId,
          so_sao: reviewStar,
          noi_dung: reviewText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đánh giá thành công!");
        setReviewText("");
        setReviewStar(5);
        // Refresh reviews + eligibility
        const rRes = await fetch(`http://localhost:5000/reviews/${id}`);
        setReviews(await rRes.json());
        const cRes = await fetch(`http://localhost:5000/reviews/can-review/${id}?id_KH=${user.id}`);
        const cData = await cRes.json();
        setCanReview(cData.canReview);
        setReviewOrders(cData.orders || []);
      } else {
        alert(data.message || "Lỗi khi đánh giá");
      }
    } catch {
      alert("Lỗi kết nối server");
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleWishlist = async () => {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (!user?.id) { alert("Vui lòng đăng nhập để thêm yêu thích"); navigate("/login"); return; }

    try {
      if (inWishlist) {
        await fetch(`http://localhost:5000/wishlist/${id}?id_KH=${user.id}`, { method: "DELETE" });
        setInWishlist(false);
      } else {
        await fetch("http://localhost:5000/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_KH: user.id, id_sanpham: Number(id) }),
        });
        setInWishlist(true);
      }
    } catch {
      alert("Lỗi kết nối server");
    }
  };

  if (!product) return <h2>Loading...</h2>;

  // ===== PRICE =====
  const giaGoc = Number(product.gia_goc);
  const giaKM = product.gia_khuyen_mai ? Number(product.gia_khuyen_mai) : null;
  const finalPrice = giaKM ?? giaGoc;
  const hasDiscount = !!giaKM && giaKM < giaGoc;
  const salePercent = hasDiscount ? Math.round(((giaGoc - giaKM) / giaGoc) * 100) : 0;

  return (
    <>
    <div className="product-detail">
      {/* LEFT IMAGE */}
      <div className="product-image">
        <img src={mainImg} alt={product.ten_sanpham} className="main-image" />

        <div className="thumb-list">
          {gallery.length > 0 ? (
            gallery.map((g, idx) => (
              <div
                key={idx}
                className={`thumb ${g === mainImg ? "active" : ""}`}
                onClick={() => setMainImg(g)}
              >
                <img
                  src={g}
                  alt={`thumb-${idx}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))
          ) : (
            <div className="thumb-empty">Không có ảnh biến thể</div>
          )}
        </div>
      </div>

      {/* RIGHT INFO */}
      <div className="product-info">
        <h1>{product.ten_sanpham}</h1>

        <div className="product-meta">
          Mã sản phẩm: <b>SP{id}</b>
          <span className="meta-sep">|</span>
          Tình trạng: <b>{stock !== null ? (stock > 0 ? `Còn hàng (${stock})` : "Hết hàng") : (product.trang_thai ? "Còn hàng" : "Hết hàng")}</b>
          <span className="meta-sep">|</span>
          Thương hiệu: <b>{product.ten_thuonghieu}</b>
        </div>

        {/* PRICE */}
        <div className="price-row">
          <span className="label">Giá:</span>
          <span className="price-new">{finalPrice.toLocaleString("vi-VN")}đ</span>
          {hasDiscount && (
            <span className="price-old">{giaGoc.toLocaleString("vi-VN")}đ</span>
          )}
          {hasDiscount && <span className="sale-badge">-{salePercent}%</span>}
        </div>

        {/* COLOR SELECTOR */}
        {colors.length > 0 && (
          <div className="variant-row">
            <span className="label">Màu sắc:</span>
            <div className="variant-options">
              {colors.map((c) => (
                <button
                  key={c.id}
                  className={`variant-btn ${selectedColor === c.id ? "active" : ""}`}
                  onClick={() => {
                    if (selectedColor === c.id) {
                      setSelectedColor(null);
                    } else {
                      setSelectedColor(c.id);
                      if (c.image) setMainImg(c.image);
                    }
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SIZE SELECTOR */}
        {sizes.length > 0 && (
          <div className="variant-row">
            <span className="label">Kích thước:</span>
            <div className="variant-options">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  className={`variant-btn ${selectedSize === s.id ? "active" : ""}`}
                  onClick={() => setSelectedSize(selectedSize === s.id ? null : s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* QUANTITY + WISHLIST */}
        <div className="variant-row">
          <span className="label">Số lượng:</span>
          <div className="qty-wish-row">
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>−</button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => { const max = stock !== null ? stock : 999; setQty(qty < max ? qty + 1 : qty); }}>+</button>
            </div>
            <button className={`btn-wishlist-heart ${inWishlist ? "active" : ""}`} onClick={toggleWishlist} title={inWishlist ? "Bỏ yêu thích" : "Thêm yêu thích"}>
              <svg className="heart-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="wish-label">{inWishlist ? "Đã thích" : "Yêu thích"}</span>
            </button>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="product-buttons">
          <button
            className="add-cart"
            disabled={stock !== null && stock <= 0}
            onClick={async () => {
              // Re-check stock before adding
              try {
                const sRes = await fetch(`http://localhost:5000/products/stock/${product.id_sanpham}`);
                const sData = await sRes.json();
                if (sData.so_luong_ton !== undefined) setStock(sData.so_luong_ton);
                if (sData.so_luong_ton <= 0) { alert("Sản phẩm đã hết hàng!"); return; }
                if (qty > sData.so_luong_ton) { alert(`Chỉ còn ${sData.so_luong_ton} sản phẩm trong kho!`); return; }
              } catch {}

              const sizeName = sizes.find(s => s.id === selectedSize)?.name || null;
              const colorName = colors.find(c => c.id === selectedColor)?.name || null;
              const variantImage = mainImg || null;

              const raw = localStorage.getItem('user');
              const isLoggedIn = !!raw;
              const user = raw ? JSON.parse(raw) : null;
              if (isLoggedIn && user?.id) {
                const r = await fetch("http://localhost:5000/cart/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id_KH: user.id, id_sanpham: product.id_sanpham, quantity: qty, size_name: sizeName, color_name: colorName, variant_image: variantImage }),
                });
                if (!r.ok) {
                  const err = await r.json();
                  alert(err.message || "Lỗi thêm giỏ hàng");
                  return;
                }
                alert("Đã thêm vào giỏ hàng");
                window.dispatchEvent(new Event("cartUpdated"));
              } else {
                const cartRaw = localStorage.getItem('cartItems');
                const cart = cartRaw ? JSON.parse(cartRaw) : [];
                const existing = cart.find((it: any) => it.id_sanpham === product.id_sanpham && it.size_name === sizeName && it.color_name === colorName);
                if (existing) { existing.quantity += qty; } else {
                  cart.push({ id: Date.now(), id_sanpham: product.id_sanpham, quantity: qty,
                    ten_sanpham: product.ten_sanpham, anh: product.anh,
                    gia_goc: product.gia_goc, gia_khuyen_mai: product.gia_khuyen_mai,
                    size_name: sizeName, color_name: colorName, variant_image: variantImage });
                }
                localStorage.setItem('cartItems', JSON.stringify(cart));
                alert("Đã thêm vào giỏ hàng");
                window.dispatchEvent(new Event("cartUpdated"));
              }
            }}
          >
            {stock !== null && stock <= 0 ? "HẾT HÀNG" : "THÊM VÀO GIỎ"}
          </button>

          <button
            className="buy-now"
            disabled={stock !== null && stock <= 0}
            onClick={async () => {
              // Re-check stock before buying
              try {
                const sRes = await fetch(`http://localhost:5000/products/stock/${product.id_sanpham}`);
                const sData = await sRes.json();
                if (sData.so_luong_ton !== undefined) setStock(sData.so_luong_ton);
                if (sData.so_luong_ton <= 0) { alert("Sản phẩm đã hết hàng!"); return; }
                if (qty > sData.so_luong_ton) { alert(`Chỉ còn ${sData.so_luong_ton} sản phẩm trong kho!`); return; }
              } catch {}

              const sizeName = sizes.find(s => s.id === selectedSize)?.name || null;
              const colorName = colors.find(c => c.id === selectedColor)?.name || null;
              const variantImage = mainImg || null;

              const raw = localStorage.getItem('user');
              const isLoggedIn = !!raw;
              const user = raw ? JSON.parse(raw) : null;
              if (isLoggedIn && user?.id) {
                const r = await fetch("http://localhost:5000/cart/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id_KH: user.id, id_sanpham: product.id_sanpham, quantity: qty, size_name: sizeName, color_name: colorName, variant_image: variantImage }),
                });
                if (!r.ok) {
                  const err = await r.json();
                  alert(err.message || "Lỗi mua ngay");
                  return;
                }
                window.dispatchEvent(new Event("cartUpdated"));
                navigate("/checkout");
                setTimeout(() => window.scrollTo(0, 0), 0);
              } else {
                const cartRaw = localStorage.getItem('cartItems');
                const cart = cartRaw ? JSON.parse(cartRaw) : [];
                const existing = cart.find((it: any) => it.id_sanpham === product.id_sanpham && it.size_name === sizeName && it.color_name === colorName);
                if (existing) { existing.quantity += qty; } else {
                  cart.push({ id: Date.now(), id_sanpham: product.id_sanpham, quantity: qty,
                    ten_sanpham: product.ten_sanpham, anh: product.anh,
                    gia_goc: product.gia_goc, gia_khuyen_mai: product.gia_khuyen_mai,
                    size_name: sizeName, color_name: colorName, variant_image: variantImage });
                }
                localStorage.setItem('cartItems', JSON.stringify(cart));
                window.dispatchEvent(new Event("cartUpdated"));
                navigate("/checkout");
                setTimeout(() => window.scrollTo(0, 0), 0);
              }
            }}
          >
            MUA NGAY
          </button>
        </div>

        {/* CTA */}
        <button className="cta-offer">CLICK VÀO ĐÂY ĐỂ NHẬN ƯU ĐÃI</button>

        {/* SHARE */}
        <div className="share-row">
          <span>Chia sẻ:</span>
          <div className="share-icons">
            <span className="share-icon fb">f</span>
            <span className="share-icon zalo">Z</span>
            <span className="share-icon tw">𝕏</span>
            <span className="share-icon pin">P</span>
            <span className="share-icon link">🔗</span>
          </div>
        </div>

        {/* POLICY GRID */}
        <div className="policy-grid">
          <div className="policy-cell">
            <span className="policy-icon">🚚</span>
            <span>Miễn phí giao hàng cho đơn hàng từ <b>500K</b></span>
          </div>
          <div className="policy-cell">
            <span className="policy-icon">✅</span>
            <span>Hàng phân phối chính hãng 100%</span>
          </div>
          <div className="policy-cell">
            <span className="policy-icon">📞</span>
            <span>TỔNG ĐÀI 24/7: <b>0964942121</b></span>
          </div>
          <div className="policy-cell">
            <span className="policy-icon">🔄</span>
            <span>ĐỔI SẢN PHẨM DỄ DÀNG (Trong vòng 7 ngày khi còn nguyên tem mác)</span>
          </div>
          <div className="policy-cell">
            <span className="policy-icon">📦</span>
            <span>Kiểm tra, thanh toán khi nhận hàng COD</span>
          </div>
          <div className="policy-cell">
            <span className="policy-icon">🛠️</span>
            <span>Hỗ trợ bảo hành, đổi sản phẩm tại tất cả store TORANO</span>
          </div>
        </div>

      </div>
    </div>

    {/* === TABS: Mô tả / Chính sách / Câu hỏi === */}
    <div className="detail-tabs">
      <div className="tab-headers">
        <button className={`tab-btn ${activeTab === "mota" ? "active" : ""}`} onClick={() => setActiveTab("mota")}>Mô tả sản phẩm</button>
        <button className={`tab-btn ${activeTab === "doitra" ? "active" : ""}`} onClick={() => setActiveTab("doitra")}>Chính sách đổi trả</button>
        <button className={`tab-btn ${activeTab === "faq" ? "active" : ""}`} onClick={() => setActiveTab("faq")}>Câu hỏi thường gặp</button>
      </div>

      <div className="tab-content">
        {activeTab === "mota" && (
          <div className="tab-panel">
            <h3>Giới thiệu sản phẩm</h3>
            <p>Sản phẩm <b>{product.ten_sanpham}</b> được thiết kế với phong cách hiện đại, trẻ trung, phù hợp cho nhiều dịp khác nhau từ đi làm, đi chơi đến các buổi hẹn hò. Chất liệu cao cấp mang đến cảm giác thoải mái, dễ chịu khi mặc suốt cả ngày.</p>
            <h4>Đặc điểm nổi bật</h4>
            <ul>
              <li>Chất liệu vải cao cấp, thoáng mát, thấm hút mồ hôi tốt</li>
              <li>Form dáng chuẩn, tôn dáng người mặc</li>
              <li>Đường may tỉ mỉ, chắc chắn, bền đẹp theo thời gian</li>
              <li>Màu sắc bền, không phai sau nhiều lần giặt</li>
              <li>Dễ phối đồ với nhiều phong cách khác nhau</li>
            </ul>
            <h4>Hướng dẫn bảo quản</h4>
            <ul>
              <li>Giặt máy ở chế độ nhẹ, nhiệt độ dưới 40°C</li>
              <li>Không sử dụng chất tẩy mạnh</li>
              <li>Phơi trong bóng râm, tránh ánh nắng trực tiếp</li>
              <li>Ủi ở nhiệt độ thấp nếu cần</li>
            </ul>
          </div>
        )}

        {activeTab === "doitra" && (
          <div className="tab-panel">
            <h3>Chính sách đổi trả sản phẩm</h3>
            <h4>1. Điều kiện đổi trả</h4>
            <ul>
              <li>Sản phẩm được đổi trong vòng <b>7 ngày</b> kể từ ngày nhận hàng</li>
              <li>Sản phẩm còn nguyên tem, mác, chưa qua sử dụng hoặc giặt là</li>
              <li>Còn đầy đủ hóa đơn mua hàng hoặc phiếu giao hàng</li>
              <li>Sản phẩm không bị dơ bẩn, hư hỏng do tác nhân bên ngoài</li>
            </ul>
            <h4>2. Các trường hợp được đổi</h4>
            <ul>
              <li>Sản phẩm bị lỗi từ nhà sản xuất (đường may, vải bị lỗi...)</li>
              <li>Giao sai sản phẩm, sai size, sai màu so với đơn hàng</li>
              <li>Sản phẩm nguyên giá: được đổi 1 lần sang sản phẩm có giá trị tương đương hoặc cao hơn</li>
              <li>Sản phẩm khuyến mại (giảm dưới 50%): được đổi size/màu cùng mã</li>
            </ul>
            <h4>3. Cách thực hiện đổi trả</h4>
            <ul>
              <li>Đổi trực tiếp tại hệ thống cửa hàng TORANO trên toàn quốc</li>
              <li>Đổi qua đường bưu điện: liên hệ Tổng đài <b>0964942121</b> để được hướng dẫn</li>
              <li>Phí ship đổi trả do khách hàng chi trả (trừ trường hợp lỗi từ TORANO)</li>
            </ul>
            <p><i>Lưu ý: Sản phẩm đồ lót và phụ kiện không áp dụng chính sách đổi trả.</i></p>
          </div>
        )}

        {activeTab === "faq" && (
          <div className="tab-panel">
            <h3>Câu hỏi thường gặp</h3>
            <div className="faq-item">
              <h4>Tôi có thể đặt hàng online và nhận tại cửa hàng không?</h4>
              <p>Hiện tại TORANO hỗ trợ giao hàng tận nơi trên toàn quốc. Bạn cũng có thể đến trực tiếp cửa hàng gần nhất để mua sắm.</p>
            </div>
            <div className="faq-item">
              <h4>Thời gian giao hàng mất bao lâu?</h4>
              <p>Nội thành TP.HCM & Hà Nội: 1-2 ngày. Các tỉnh thành khác: 3-5 ngày làm việc. Miễn phí ship cho đơn từ 500K.</p>
            </div>
            <div className="faq-item">
              <h4>Làm sao để chọn đúng size?</h4>
              <p>Bạn có thể tham khảo bảng size trên từng sản phẩm hoặc liên hệ Tổng đài 0964942121 để được tư vấn size phù hợp với số đo của bạn.</p>
            </div>
            <div className="faq-item">
              <h4>TORANO có chương trình khách hàng thân thiết không?</h4>
              <p>Có! Khách hàng tích lũy điểm qua mỗi đơn hàng để nhận ưu đãi giảm giá, quà tặng và quyền truy cập sớm các bộ sưu tập mới.</p>
            </div>
            <div className="faq-item">
              <h4>Tôi muốn mua số lượng lớn (đồng phục, quà tặng) thì liên hệ ở đâu?</h4>
              <p>Vui lòng liên hệ Hotline <b>0964942121</b> hoặc email để được báo giá riêng cho đơn hàng số lượng lớn.</p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ====== REVIEW / ĐÁNH GIÁ SECTION ====== */}
    <div className="review-section">
      <h2 className="review-title">
        Đánh giá sản phẩm
        {reviews.length > 0 && (
          <span className="review-summary">
            <span className="review-avg-stars">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`star ${s <= Math.round(avgRating) ? "filled" : ""}`}>★</span>
              ))}
            </span>
            <span className="review-avg-num">{avgRating.toFixed(1)}/5</span>
            <span className="review-count">({reviews.length} đánh giá)</span>
          </span>
        )}
      </h2>

      {/* FORM ĐÁNH GIÁ */}
      {canReview ? (
        <div className="review-form">
          <h4>Viết đánh giá của bạn</h4>
          {reviewOrders.length > 1 && (
            <div className="review-order-select">
              <label>Đơn hàng:</label>
              <select value={reviewOrderId ?? ""} onChange={e => setReviewOrderId(Number(e.target.value))}>
                {reviewOrders.map(o => (
                  <option key={o.id_donhang} value={o.id_donhang}>Đơn #{o.id_donhang}</option>
                ))}
              </select>
            </div>
          )}
          <div className="review-stars-input">
            <label>Đánh giá:</label>
            <div className="stars-select">
              {[1, 2, 3, 4, 5].map(s => (
                <span
                  key={s}
                  className={`star-input ${s <= (reviewHover || reviewStar) ? "filled" : ""}`}
                  onClick={() => setReviewStar(s)}
                  onMouseEnter={() => setReviewHover(s)}
                  onMouseLeave={() => setReviewHover(0)}
                >★</span>
              ))}
              <span className="star-label">
                {reviewStar === 1 && "Rất tệ"}
                {reviewStar === 2 && "Tệ"}
                {reviewStar === 3 && "Bình thường"}
                {reviewStar === 4 && "Tốt"}
                {reviewStar === 5 && "Tuyệt vời"}
              </span>
            </div>
          </div>
          <textarea
            className="review-textarea"
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            rows={4}
          />
          <button
            className="review-submit-btn"
            onClick={handleSubmitReview}
            disabled={submittingReview}
          >
            {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      ) : (
        <div className="review-login-notice">
          <p>💡 Chỉ khách hàng đã mua và nhận sản phẩm này mới có thể đánh giá.</p>
        </div>
      )}

      {/* DANH SÁCH ĐÁNH GIÁ */}
      {reviews.length > 0 ? (
        <div className="review-list">
          {reviews.map(r => (
            <div key={r.id_danhgia} className="review-item">
              <div className="review-header">
                <div className="review-avatar">{(r.ho_ten || "K")[0].toUpperCase()}</div>
                <div className="review-meta">
                  <span className="review-author">{r.ho_ten || "Khách hàng"}</span>
                  <span className="review-date">{new Date(r.ngay_tao).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`star ${s <= r.so_sao ? "filled" : ""}`}>★</span>
                  ))}
                </div>
              </div>
              {r.noi_dung && <p className="review-content">{r.noi_dung}</p>}
              <div className="review-badge">✓ Đã mua hàng</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="review-empty">
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
        </div>
      )}
    </div>
    </>
  )
}