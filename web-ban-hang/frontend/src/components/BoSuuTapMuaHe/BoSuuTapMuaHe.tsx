import { useEffect, useState } from "react";
import ProductCard from "../Product/ProductCart";
import "./BoSuuTapMuaHe.css";

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

export default function BoSuuTapMuaHe({
  categoryIds = [3, 5],
  image = "/danhmuc_img/bosuutap_he.png",
}: { categoryIds?: number[]; image?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // fetch products for each category and merge
    Promise.all(
      categoryIds.map((id) =>
        fetch(`http://localhost:5000/products/category/${id}`).then((r) => r.json()).catch(() => [])
      )
    )
      .then((arrays) => {
        const merged = ([] as any[]).concat(...arrays || []);
        // map image urls to absolute
        const mapped = merged.map((p: any) => ({
          ...p,
          anh: typeof p.anh === "string" && /^(https?:)?\/\//.test(p.anh) ? p.anh : `http://localhost:5000${p.anh}`,
        }));
        // dedupe by id
        const unique = Array.from(new Map(mapped.map((m) => [m.id_sanpham, m])).values());
        setProducts(unique.slice(0, 6));
      })
      .catch((err) => console.error("Lỗi load bộ sưu tập mùa hè:", err));
  }, [categoryIds]);

  return (
    <section className="bs-section">
      <div className="sale-banner-section">
        <img src={`http://localhost:5000${image}`} alt="Bộ sưu tập Mùa Hè" />
      </div>

      <div className="product-grid">
        {products.length === 0 ? (
          <p className="empty-text">Không có sản phẩm</p>
        ) : (
          products.map((p) => <ProductCard key={p.id_sanpham} product={p as any} />)
        )}
      </div>
    </section>
  );
}
