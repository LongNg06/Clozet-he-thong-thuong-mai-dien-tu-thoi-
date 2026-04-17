const API = import.meta.env.VITE_API_URL;
import { useEffect, useState, useRef } from "react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    // fetch products for each category and merge
    Promise.all(
      categoryIds.map((id) =>
        fetch(`${API}/products/category/${id}`).then((r) => r.json()).catch(() => [])
      )
    )
      .then((arrays) => {
        const merged = ([] as any[]).concat(...arrays || []);
        // map image urls to absolute
        const mapped = merged.map((p: any) => ({
          ...p,
          anh: typeof p.anh === "string" && /^(https?:)?\/\//.test(p.anh) ? p.anh : `${API}${p.anh}`,
        }));
        // dedupe by id
        const unique = Array.from(new Map(mapped.map((m) => [m.id_sanpham, m])).values());
        setProducts(unique);
      })
      .catch((err) => console.error("Lỗi load bộ sưu tập mùa hè:", err));
  }, [categoryIds]);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  useEffect(() => {
    requestAnimationFrame(updateArrows);
  }, [products]);

  function scrollTrack(dir: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth + 20), behavior: "smooth" });
  }

  return (
    <section className="bs-section">
      <div className="sale-banner-section">
        <img src={`${API}${image}`} alt="Bộ sưu tập Mùa Hè" />
      </div>

      <div className="product-grid-wrap">
        {canScrollLeft && (
          <button className="grid-arrow grid-arrow-left" onClick={() => scrollTrack(-1)}>‹</button>
        )}
        <div className="product-grid" ref={trackRef} onScroll={updateArrows}>
          {products.length === 0 ? (
            <p className="empty-text">Không có sản phẩm</p>
          ) : (
            products.map((p) => <ProductCard key={p.id_sanpham} product={p as any} />)
          )}
        </div>
        {canScrollRight && (
          <button className="grid-arrow grid-arrow-right" onClick={() => scrollTrack(1)}>›</button>
        )}
      </div>
    </section>
  );
}
