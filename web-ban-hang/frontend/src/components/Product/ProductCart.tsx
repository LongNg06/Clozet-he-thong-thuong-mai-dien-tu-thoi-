import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./style.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number | string | null;
  gia_khuyen_mai?: number | string | null;
  anh: string;
  mau_sac?: string[] | number | string;
  kich_co?: string[] | number | string;
  trang_thai?: number;
  hover_img?: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();

  // ===== IMAGE URL =====
  const initialImg = useMemo(() => {
    if (!product.anh) return "";
    return product.anh.startsWith("http")
      ? product.anh
      : `http://localhost:5000${product.anh}`;
  }, [product.anh]);

  const hoverImgUrl = useMemo(() => {
    const h = product.hover_img;
    if (!h) return undefined;
    return h.startsWith("http")
      ? h
      : `http://localhost:5000${h}`;
  }, [product.hover_img]);

  const [currentImg, setCurrentImg] = useState<string>(initialImg);

  // ===== PRICE =====
  const giaGoc = Number(product.gia_goc);

  const giaKM =
    product.gia_khuyen_mai !== null &&
    product.gia_khuyen_mai !== undefined
      ? Number(product.gia_khuyen_mai)
      : undefined;

  const hasDiscount =
    giaKM !== undefined && giaKM < giaGoc;

  const discountPercent = hasDiscount
    ? Math.round(((giaGoc - giaKM!) / giaGoc) * 100)
    : 0;

  const finalPrice = hasDiscount ? giaKM! : giaGoc;

  const isOutOfStock = product.trang_thai === 0;

  // ===== VIEW PRODUCT =====
  const handleView = () => {
    navigate(`/product/${product.id_sanpham}`);
  };

  // ===== ADD TO CART =====
  const handleAddToCart = async () => {
    // Re-check stock before adding
    try {
      const sRes = await fetch(`http://localhost:5000/products/stock/${product.id_sanpham}`);
      const sData = await sRes.json();
      if (sData.so_luong_ton <= 0) { alert("Sản phẩm đã hết hàng!"); return; }
    } catch { /* stock check failed, proceed */ }

    const raw = localStorage.getItem('user');
    const isLoggedIn = !!raw;

    if (isLoggedIn) {
      // Logged-in: save to backend DB (backend also checks stock)
      try {
        const r = await fetch("http://localhost:5000/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_sanpham: product.id_sanpham, quantity: 1 }),
        });
        if (!r.ok) {
          const err = await r.json();
          alert(err.message || "Lỗi thêm giỏ hàng");
          return;
        }
        window.dispatchEvent(new Event("cart:open"));
        window.dispatchEvent(new Event("cartUpdated"));
      } catch {
        window.dispatchEvent(new Event("cart:open"));
      }
    } else {
      // Guest: save to localStorage
      const cartRaw = localStorage.getItem('cartItems');
      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      const existing = cart.find((it: { id_sanpham: number }) => it.id_sanpham === product.id_sanpham);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: product.id_sanpham,
          id_sanpham: product.id_sanpham,
          quantity: 1,
          ten_sanpham: product.ten_sanpham,
          anh: product.anh,
          gia_goc: product.gia_goc,
          gia_khuyen_mai: product.gia_khuyen_mai,
        });
      }
      localStorage.setItem('cartItems', JSON.stringify(cart));
      window.dispatchEvent(new Event("cart:open"));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  // ===== BUY NOW (quick purchase) =====
  

  return (
    <div className="product-card">

      <div className="product-img">

        {/* SALE / HẾT HÀNG */}
        {isOutOfStock ? (
          <div className="sale-pill out-stock-pill">
            Hết hàng
          </div>
        ) : (
          hasDiscount && (
            <div className="sale-pill">
              -{discountPercent}%
            </div>
          )
        )}

        {/* IMAGE */}
        <Link to={`/product/${product.id_sanpham}`}>
          <img
            src={currentImg}
            alt={product.ten_sanpham}
            onMouseEnter={() => {
              if (hoverImgUrl) setCurrentImg(hoverImgUrl);
            }}
            onMouseLeave={() => {
              setCurrentImg(initialImg);
            }}
          />
        </Link>

      </div>

      {/* HOVER BUTTON — outside product-img to avoid overflow:hidden clipping */}
      {!isOutOfStock && (
        <div className="hover-overlay">
          <div className="hover-row">
            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
            >
              🛒Thêm vào giỏ
            </button>

            <button
              className="view-btn"
              onClick={handleView}
            >
              👁
            </button>
          </div>
        </div>
      )}

      <div className="product-info">

        <div className="product-meta">
          {product.mau_sac && (
            <span>+{product.mau_sac} Màu sắc</span>
          )}

          {product.kich_co && (
            <span>+{product.kich_co} Kích thước</span>
          )}
        </div>

        <h4 className="product-name">
          <Link to={`/product/${product.id_sanpham}`}>
            {product.ten_sanpham}
          </Link>
        </h4>

        <div className="price">

          <span className="new-price">
            {finalPrice.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>

          {hasDiscount && (
            <span className="old-price">
              {giaGoc.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProductCard;