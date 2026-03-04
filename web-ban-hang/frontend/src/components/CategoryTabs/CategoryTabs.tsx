import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    // fetch products for default active if map provided
    const id = categoryMap?.[active as string];
    if (id) fetchForCategory(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fetchForCategory(id: number) {
    fetch(`http://localhost:5000/products/category/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data || []).map((p: any) => ({
          ...p,
          anh: typeof p.anh === "string" && /^(https?:)?\/\//.test(p.anh) ? p.anh : `http://localhost:5000${p.anh}`,
        }));
        // limit to 6 products to display on a single row
        setProducts(mapped.slice(0, 6));
      })
      .catch((err) => console.error("Lỗi load theo danh mục:", err));
  }

  const handleClick = (t: string) => {
    setActive(t);
    onSelect && onSelect(t);
    const id = categoryMap?.[t];
    if (id) fetchForCategory(id);
    else setProducts([]);
  };

  return (
    <div className={`category-tabs-wrapper ${className || ""}`}>
      <div className={`category-tabs ${className || ""}`}>
        {items.map((t) => (
          <div key={t} className={`tab ${active === t ? "active" : ""}`} onClick={() => handleClick(t)}>
            {t}
          </div>
        ))}
      </div>

      {/* product grid for selected category */}
      <div className="ct-product-grid">
        {products.length === 0 ? null : (
          products.map((p) => <ProductCard key={p.id_sanpham} product={p} />)
        )}
      </div>
    </div>
  );
}
