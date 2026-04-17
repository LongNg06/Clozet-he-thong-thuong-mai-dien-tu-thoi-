const API = import.meta.env.VITE_API_URL;
import { useEffect, useState, useRef } from "react";
import ProductCard from "../Product/ProductCart";
import "./CategoryTabs.css";

type Props = {
  items: string[];
  defaultActive?: string;
  onSelect?: (item: string) => void;
  className?: string;
  // map label -> category id
  categoryMap?: Record<string, number>;
};

export default function CategoryTabs({
  items,
  defaultActive,
  onSelect,
  className,
  categoryMap,
}: Props) {
  const [active, setActive] = useState<string>(defaultActive || items[0] || "");
  const [products, setProducts] = useState<any[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    // fetch products for default active if map provided
    const id = categoryMap?.[active as string];
    if (id) fetchForCategory(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fetchForCategory(id: number) {
    fetch(`${API}/products/category/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data || []).map((p: any) => ({
          ...p,
          anh: typeof p.anh === "string" && /^(https?:)?\/\//.test(p.anh) ? p.anh : `${API}${p.anh}`,
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error("Lỗi load theo danh mục:", err));
  }

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

  const handleClick = (t: string) => {
    setActive(t);
    onSelect && onSelect(t);
    const id = categoryMap?.[t];
    if (id) fetchForCategory(id);
    else setProducts([]);
    if (trackRef.current) trackRef.current.scrollLeft = 0;
  };

  return (
    <div className={`category-tabs-wrapper ${className || ""}`}>
      <div className={`category-tabs ${className || ""}`}>
        {items.map((t) => (
          <div key={t} className={`tab ${active === t ? "active" : ""}`} onClick={() => handleClick(t)} translate="no">
            {t}
          </div>
        ))}
      </div>

      {/* product grid for selected category */}
      <div className="ct-grid-wrap">
        {canScrollLeft && (
          <button className="grid-arrow grid-arrow-left" onClick={() => scrollTrack(-1)}>‹</button>
        )}
        <div className="ct-product-grid" ref={trackRef} onScroll={updateArrows}>
          {products.length === 0 ? null : (
            products.map((p) => <ProductCard key={p.id_sanpham} product={p} />)
          )}
        </div>
        {canScrollRight && (
          <button className="grid-arrow grid-arrow-right" onClick={() => scrollTrack(1)}>›</button>
        )}
      </div>
    </div>
  );
}
