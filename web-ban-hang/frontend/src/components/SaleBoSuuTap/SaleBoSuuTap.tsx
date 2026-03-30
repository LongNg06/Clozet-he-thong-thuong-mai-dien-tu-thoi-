import { useEffect, useState } from "react";
import ProductCard from "../../components/Product/ProductCart";
import "./SaleBoSuuTap.css";

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

function SaleBanner() {
  const [products, setProducts] = useState<Product[]>([]);
      
  useEffect(() => {
    fetch("http://localhost:5000/products/bosuutap/1")
      .then((res) => res.json())
      .then((data) => {
        // Ensure image URLs are absolute so <img> loads correctly
        const mapped = (data || []).map((p: Product) => ({
          ...p,
          anh:
            typeof p.anh === "string" && /^(https?:)?\/\//.test(p.anh)
              ? p.anh
              : `http://localhost:5000${p.anh}`,
        }));

        setProducts(mapped);
      })
      .catch((err) => console.error("Lỗi load bộ sưu tập:", err));
  }, []);

  return (
    <section className="sale-section">
      
      {/* Banner */}
      <div className="sale-banner-section">
        <img
          src="http://localhost:5000/danhmuc_img/bosuutap.png"
          alt="Fall Winter 2025"
        />
      </div>

      {/* Danh sách sản phẩm */}
      <div className="product-grid">
        {products.length === 0 ? (
          <p className="empty-text">Không có sản phẩm</p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id_sanpham}
              product={product}
            />
          ))
        )}
      </div>

    </section>
  );
}

export default SaleBanner;