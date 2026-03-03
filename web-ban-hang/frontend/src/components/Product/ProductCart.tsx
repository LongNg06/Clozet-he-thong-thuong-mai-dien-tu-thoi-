import { useNavigate } from "react-router-dom";
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
}

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();

  // ===== Ép kiểu về number =====
  const giaGoc = Number(product.gia_goc);
  const giaKM =
    product.gia_khuyen_mai !== null &&
    product.gia_khuyen_mai !== undefined
      ? Number(product.gia_khuyen_mai)
      : undefined;

  // ===== Logic xử lý =====
  const hasDiscount =
    giaKM !== undefined && giaKM < giaGoc;

  const discountPercent = hasDiscount
    ? Math.round(((giaGoc - giaKM!) / giaGoc) * 100)
    : 0;

  const isOutOfStock = product.trang_thai === 0;

  const finalPrice = hasDiscount ? giaKM! : giaGoc;

  const handleView = () => {
    navigate(`/product/${product.id_sanpham}`);
  };

  const handleAddToCart = () => {
    console.log("Thêm vào giỏ:", product);
  };

  return (
    <div className="product-card">
      <div className="product-img">
      {/* SALE hoặc Hết hàng */}
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
       

        <img src={product.anh} alt={product.ten_sanpham} />

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
          {product.ten_sanpham}
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
<button className="view-all-btn">
  XEM TẤT CẢ SẢN PHẨM KHUYẾN MÃI
</button>

export default ProductCard;