import { useState, useMemo } from "react";
const API_URL = import.meta.env.VITE_API_URL;
import { Link } from "react-router-dom";
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
  // const navigate = useNavigate(); // Unused

  // ===== IMAGE URL =====
  const initialImg = useMemo(() => {
    if (!product.anh) return "";
    return product.anh.startsWith("http")
      ? product.anh
      : `${API_URL}${product.anh}`;
  }, [product.anh]);

  const hoverImgUrl = useMemo(() => {
    const h = product.hover_img;
    if (!h) return undefined;
    return h.startsWith("http")
      ? h
      : `${API_URL}${h}`;
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
  // (removed unused handleView)

  // ===== ADD TO CART =====
  // (removed unused handleAddToCart)

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
         

            {/* <button
              className="view-btn"
              onClick={handleView}
            >
              Xem chi tiết
            </button> */}
          </div>
        </div>
      )}

      <div className="product-info">

        <div className="product-meta">
          {product.mau_sac && (Array.isArray(product.mau_sac) ? product.mau_sac.length > 0 : Number(product.mau_sac) > 0) && (
            <span>+{Array.isArray(product.mau_sac) ? product.mau_sac.length : product.mau_sac} Màu sắc</span>
          )}

          {product.kich_co && (Array.isArray(product.kich_co) ? product.kich_co.length > 0 : Number(product.kich_co) > 0) && (
            <span>+{Array.isArray(product.kich_co) ? product.kich_co.length : product.kich_co} Kích thước</span>
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