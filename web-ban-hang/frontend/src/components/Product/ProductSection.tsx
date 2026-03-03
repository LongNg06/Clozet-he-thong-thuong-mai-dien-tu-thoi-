import ProductCard from "../Product/ProductCart";
import "./style.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number | string;
  gia_khuyen_mai?: number | string | null;
  anh: string;
  mau_sac?: number;
  kich_co?: number;
  trang_thai?: number;
}

interface Props {
  products: Product[];
}

export default function ProductSection({ products }: Props) {
  return (
    <section className="product-section">
      <h2 className="section-title">
        <span className="dot"></span>
        SẢN PHẨM KHUYẾN MÃI
      </h2>

      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id_sanpham} product={p} />
        ))}
      </div>

      <div className="view-all-wrapper">
        <button className="view-all-btn">
          XEM TẤT CẢ SẢN PHẨM KHUYẾN MÃI
        </button>
      </div>
    </section>
  );
}