"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../components/Product/ProductCart";
import "./newProduct.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number | string | null;
  gia_khuyen_mai?: number | string | null;
  anh: string;
  mau_sac?: string[];
  kich_co?: string[];
  trang_thai?: number;
  hover_img?: string;
  id_danhmuc?: number | null;
}

interface Category {
  id_danhmuc: number;
  ten_danhmuc: string;
}

const NewProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // FILTER
  const [price, setPrice] = useState(3000000);
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // values like "S","M","XL"
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // track which category is active (null = all)
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // --- Fixed lists per your request ---
  const SIZES_LIST = ["S", "M", "XL"];

  // Colors grouped: dark / cool / light / warm (3 examples each)
  const COLORS_LIST = [
    // dark
    "Đen",
    "Xám đậm",
    "Nâu",
    // cool
    "Xanh dương",
    "Xanh lá lạnh",
    "Tím lạnh",
    // light
    "Trắng",
    "Kem",
    "Be",
    // warm
    "Đỏ",
    "Cam",
    "Vàng",
  ];

  const colorMap: Record<string, string> = {
    // Màu tối
    "Đen": "#000000",
    "Xám đậm": "#4a4a4a",
    "Nâu": "#5c4033",

    // Màu lạnh
    "Xanh dương": "#1e90ff",
    "Xanh lá lạnh": "#2e8b57",
    "Tím lạnh": "#6a5acd",

    // Màu sáng / neutral
    "Trắng": "#ffffff",
    "Kem": "#f5f0e1",
    "Be": "#f0e0c8",

    // Màu nóng
    "Đỏ": "#e53935",
    "Cam": "#ff8c00",
    "Vàng": "#ffd700",
  };

  // Normalize size values from API into canonical sizes like "S","M","L","XL","XXL"
  const normalizeSize = (raw: string) => {
    if (!raw) return "";
    const s = String(raw).trim().toUpperCase();

    // common textual forms
    if (s === "X" || s === "XS" || s === "XS.") return "XS";
    if (s === "S" || s === "SMALL") return "S";
    if (s === "M" || s === "MEDIUM") return "M";
    if (s === "L" || s === "LG" || s === "LARGE") return "L";
    if (s === "XL" || s === "X-LARGE" || s === "X L") return "XL";
    if (s === "XXL" || s === "2XL" || s === "2X") return "XXL";

    // numeric id mapping (based on your example: 1->X, 2->S, 3->XL)
    if (s === "1") return "S"; // adjust if your mapping differs
    if (s === "2") return "M"; // adjust if your mapping differs
    if (s === "3") return "XL"; // adjust if your mapping differs

    // if it's a single letter like "X" treat as XS (or keep as is)
    if (/^[XSML]{1,3}$/.test(s)) return s;

    // fallback: return uppercase trimmed
    return s;
  };

  // ===== FETCH BY CATEGORY =====
  async function fetchByCategory(id: number | null) {
    setLoading(true);
    try {
      const url =
        id !== null
          ? `http://localhost:5000/products/category/${encodeURIComponent(Number(id))}`
          : `http://localhost:5000/products`;

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("HTTP error fetching products:", res.status, text);
        setProducts([]);
        setFiltered([]);
        return;
      }

      const data = await res.json();
      console.log("FETCH CATEGORY:", url, data);

      const mapped = (data || []).map((p: any) => ({
        ...p,
        anh:
          typeof p.anh === "string" && /^(https?:)?\/\//.test(p.anh)
            ? p.anh
            : `http://localhost:5000/${String(p.anh || "").replace(/^\/+/, "")}`,

        // normalize sizes into canonical uppercase values
        kich_co: (() => {
          if (!p.kich_co) return [];
          if (typeof p.kich_co === "string") {
            try {
              const arr = JSON.parse(p.kich_co);
              if (Array.isArray(arr)) return arr.map((x: any) => normalizeSize(String(x))).filter(Boolean);
            } catch {
              return p.kich_co
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
                .map((s: string) => normalizeSize(s));
            }
          }

          if (Array.isArray(p.kich_co)) {
            return p.kich_co
              .map((item: any) => {
                if (typeof item === "string") return normalizeSize(item);
                if (item && typeof item === "object") return normalizeSize(item.ten_kichco ?? item.ten ?? item.name ?? "");
                return "";
              })
              .filter(Boolean);
          }

          // if object with id/ten fields
          if (typeof p.kich_co === "object") {
            const vals = Object.values(p.kich_co);
            return vals.map((v: any) => normalizeSize(String(v))).filter(Boolean);
          }

          return [];
        })(),

        // normalize colors to trimmed strings (keep original names where possible)
        mau_sac: (() => {
          if (!p.mau_sac) return [];
          if (typeof p.mau_sac === "string") {
            try {
              const arr = JSON.parse(p.mau_sac);
              if (Array.isArray(arr)) return arr.map((x: any) => String(x).trim()).filter(Boolean);
            } catch {
              return p.mau_sac
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
            }
          }

          if (Array.isArray(p.mau_sac)) {
            return p.mau_sac
              .map((item: any) => {
                if (typeof item === "string") return item.trim();
                if (item && typeof item === "object") return String(item.ten_mau ?? item.ten ?? item.name ?? "").trim();
                return "";
              })
              .filter(Boolean);
          }

          return [];
        })(),
      }));

      setProducts(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setProducts([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }

  // ===== LOAD CATEGORIES AND AUTO LOAD ALL PRODUCTS ON MOUNT =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/categories");
        if (!res.ok) {
          console.error("Failed to fetch categories", res.status);
        } else {
          const data = await res.json();
          console.log("CATEGORIES RAW:", data);

          const normalized = (data || []).map((c: any) => ({
            id_danhmuc: c.id_danhmuc ?? c.id ?? c._id,
            ten_danhmuc: c.ten_danhmuc ?? c.name ?? c.ten ?? "",
          }));

          if (mounted) setCategories(normalized);
        }
      } catch (err) {
        console.error("Lỗi load categories:", err);
      } finally {
        // Auto-load all products on mount
        if (mounted) {
          await fetchByCategory(null);
          setActiveCategory(null);
        }
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== FILTER (PRICE + SIZE + COLOR) =====
  useEffect(() => {
    let temp = [...products];

    temp = temp.filter((p) => {
      const priceValue = Number(p.gia_khuyen_mai ?? p.gia_goc ?? 0);
      return priceValue <= price;
    });

    if (selectedSize) {
      // selectedSize is canonical (S/M/XL) and p.kich_co is normalized
      temp = temp.filter((p) => p.kich_co?.includes(selectedSize));
    }

    if (selectedColor) {
      // color matching is simple string match; ensure casing/trim if needed
      temp = temp.filter((p) => p.mau_sac?.some((mc) => mc.trim().toLowerCase() === selectedColor.trim().toLowerCase()));
    }

    setFiltered(temp);
  }, [price, selectedSize, selectedColor, products]);

  // handle category click: set active and fetch
  const handleCategoryClick = (id: number) => {
    setActiveCategory(id);
    fetchByCategory(id);
  };

  // handle size click (toggle)
  const handleSizeClick = (s: string) => {
    const up = s.toUpperCase();
    setSelectedSize((prev) => (prev === up ? null : up));
  };

  // handle color click (toggle)
  const handleColorClick = (c: string) => {
    setSelectedColor((prev) => (prev === c ? null : c));
  };

  return (
    <div className="shop-page">
      {/* SIDEBAR */}
      <aside className="filter-sidebar">
        <div className="breadcrumb">
          Trang chủ / <span>Sản phẩm mới</span>
        </div>

        <h2 className="filter-title">Bộ lọc</h2>

        {/* CATEGORY */}
        <div className="filter-group">
          <h4>Danh mục</h4>

          <ul className="category-list">
            {categories.map((c) => (
              <li
                key={c.id_danhmuc}
                className={activeCategory === Number(c.id_danhmuc) ? "active" : ""}
                onClick={() => handleCategoryClick(Number(c.id_danhmuc))}
              >
                {c.ten_danhmuc}
              </li>
            ))}
          </ul>
        </div>

        {/* PRICE */}
        <div className="filter-group">
          <h4>Khoảng giá</h4>

          <input
            type="range"
            min={0}
            max={3000000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <div className="price-label">
            <span>0đ</span>
            <span>{price.toLocaleString()}đ</span>
          </div>
        </div>

        {/* COLOR */}
        <div className="filter-group">
          <h4>Màu sắc</h4>

          <div className="color-list">
            {COLORS_LIST.map((c) => (
              <span
                key={c}
                className={`color ${selectedColor === c ? "active" : ""}`}
                style={{ background: colorMap[c] || "#ccc" }}
                onClick={() => handleColorClick(c)}
                title={c}
              />
            ))}
          </div>

          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
            <div><strong>Màu tối:</strong> Đen, Xám đậm, Nâu</div>
            <div><strong>Màu lạnh:</strong> Xanh dương, Xanh lá lạnh, Tím lạnh</div>
            <div><strong>Màu sáng:</strong> Trắng, Kem, Be</div>
            <div><strong>Màu nóng:</strong> Đỏ, Cam, Vàng</div>
          </div>
        </div>

        {/* SIZE */}
        <div className="filter-group">
          <h4>Size</h4>

          <div className="size-grid">
            {SIZES_LIST.map((s) => (
              <button
                key={s}
                className={selectedSize === s ? "active" : ""}
                onClick={() => handleSizeClick(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* PRODUCTS */}
      <main className="product-container">
        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <div className="product-grid">
            {filtered.length > 0 ? (
              filtered.map((product) => <ProductCard key={product.id_sanpham} product={product} />)
            ) : (
              <p>Không có sản phẩm phù hợp</p>
            )}
          </div>
        )}

        <div className="pagination">
          <button>1</button>
          <button>2</button>
          <button>3</button>
        </div>
      </main>
    </div>
  );
};

export default NewProduct;
