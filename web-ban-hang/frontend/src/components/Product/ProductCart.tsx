import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./style.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number | string;
  gia_khuyen_mai?: number | string | null;
  anh: string;
  mau_sac?: number | string;
  kich_co?: number | string;
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
  const handleAddToCart = () => {
    fetch("http://localhost:5000/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_sanpham: product.id_sanpham,
        quantity: 1,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        window.dispatchEvent(new Event("cart:open"));
      })
      .catch(() => {
        window.dispatchEvent(new Event("cart:open"));
      });
  };

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

        {/* HOVER BUTTON */}
        {!isOutOfStock && (
          <div className="hover-overlay">

            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
            >
              🛒 Thêm vào giỏ
            </button>

            <button
              className="view-btn"
              onClick={handleView}
            >
              👁
            </button>

          </div>
        )}
      </div>

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