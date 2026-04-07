"use client";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
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
  tong_ton_kho?: number;
  created_at?: string;
}

interface Category {
  id_danhmuc: number;
  ten_danhmuc: string;
}

const SORT_OPTIONS = [

  { value: "price-asc", label: "Giá: Tăng dần" },
  { value: "price-desc", label: "Giá: Giảm dần" },
  { value: "name-asc", label: "Tên: A-Z" },
  { value: "name-desc", label: "Tên: Z-A" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "bestseller", label: "Bán chạy nhất" },
  { value: "stock-desc", label: "Tồn kho giảm dần" },
];

const NewProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // FILTER
  const [price, setPrice] = useState(3000000);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // track which category is active (null = all)
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const SIZES_LIST = ["S", "M", "L", "XL", "XXL", "36", "37", "38", "39"];

  const COLORS_LIST = [
    "Đen", "Xám đậm", "Nâu",
    "Xanh dương", "Xanh lá lạnh", "Tím lạnh",
    "Trắng", "Kem", "Be",
    "Đỏ", "Cam", "Vàng",
  ];

  const colorMap: Record<string, string> = {
    "Đen": "#000000", "Xám đậm": "#4a4a4a", "Nâu": "#5c4033",
    "Xanh dương": "#1e90ff", "Xanh lá lạnh": "#2e8b57", "Tím lạnh": "#6a5acd",
    "Trắng": "#ffffff", "Kem": "#f5f0e1", "Be": "#f0e0c8",
    "Đỏ": "#e53935", "Cam": "#ff8c00", "Vàng": "#ffd700",
  };

  const normalizeSize = (raw: string) => {
    if (!raw) return "";
    const s = String(raw).trim().toUpperCase();
    if (s === "X" || s === "XS" || s === "XS.") return "XS";
    if (s === "S" || s === "SMALL") return "S";
    if (s === "M" || s === "MEDIUM") return "M";
    if (s === "L" || s === "LG" || s === "LARGE") return "L";
    if (s === "XL" || s === "X-LARGE" || s === "X L") return "XL";
    if (s === "XXL" || s === "2XL" || s === "2X") return "XXL";
    if (s === "1") return "S";
    if (s === "2") return "M";
    if (s === "3") return "XL";
    if (/^[XSML]{1,3}$/.test(s)) return s;
    return s;
  };

  // ===== FETCH BY CATEGORY =====
  async function fetchByCategory(id: number | null) {
    setLoading(true);
    try {
      const url =
        id !== null
          ? `http://localhost:5000/products/category/${encodeURIComponent(Number(id))}`
          : `http://localhost:5000/products/all`;

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("HTTP error fetching products:", res.status, text);
        setProducts([]);
        setFiltered([]);
        return;
      }

      const data = await res.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = (data || []).map((p: any) => ({
        ...p,
        anh:
          typeof p.anh === "string" && /^(https?:)?\/\//.test(p.anh)
            ? p.anh
            : `http://localhost:5000/${String(p.anh || "").replace(/^\/+/, "")}`,
        tong_ton_kho: Number(p.tong_ton_kho ?? 0),
        kich_co: (() => {
          if (!p.kich_co) return [];
          if (typeof p.kich_co === "string") {
            try {
              const arr = JSON.parse(p.kich_co);
              if (Array.isArray(arr)) return arr.map((x: unknown) => normalizeSize(String(x))).filter(Boolean);
            } catch {
              return p.kich_co.split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => normalizeSize(s));
            }
          }
          if (Array.isArray(p.kich_co)) {
            return p.kich_co
              .map((item: unknown) => {
                if (typeof item === "string") return normalizeSize(item);
                if (item && typeof item === "object") return normalizeSize((item as Record<string, string>).ten_kichco ?? (item as Record<string, string>).ten ?? (item as Record<string, string>).name ?? "");
                return "";
              })
              .filter(Boolean);
          }
          if (typeof p.kich_co === "object") {
            const vals = Object.values(p.kich_co);
            return vals.map((v: unknown) => normalizeSize(String(v))).filter(Boolean);
          }
          return [];
        })(),
        mau_sac: (() => {
          if (!p.mau_sac) return [];
          if (typeof p.mau_sac === "string") {
            try {
              const arr = JSON.parse(p.mau_sac);
              if (Array.isArray(arr)) return arr.map((x: unknown) => String(x).trim()).filter(Boolean);
            } catch {
              return p.mau_sac.split(",").map((s: string) => s.trim()).filter(Boolean);
            }
          }
          if (Array.isArray(p.mau_sac)) {
            return p.mau_sac
              .map((item: unknown) => {
                if (typeof item === "string") return item.trim();
                if (item && typeof item === "object") return String((item as Record<string, string>).ten_mau ?? (item as Record<string, string>).ten ?? (item as Record<string, string>).name ?? "").trim();
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    if (category) {
      const id = Number(category);
      setActiveCategory(id);
      setCurrentPage(1);
      fetchByCategory(id);
    } else {
      setActiveCategory(null);
      setCurrentPage(1);
      fetchByCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const normalized = (data || []).map((c: any) => ({
            id_danhmuc: c.id_danhmuc ?? c.id ?? c._id,
            ten_danhmuc: c.ten_danhmuc ?? c.name ?? c.ten ?? "",
          }));
          if (mounted) setCategories(normalized);
        }
      } catch (err) {
        console.error("Lỗi load categories:", err);
      } finally {
        if (mounted) {
          const params = new URLSearchParams(location.search);
          const category = params.get("category");
          if (category) {
            const id = Number(category);
            setActiveCategory(id);
            await fetchByCategory(id);
          } else {
            await fetchByCategory(null);
            setActiveCategory(null);
          }
        }
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== SORT HELPER =====
  const sortProducts = useCallback((list: Product[]) => {
    const sorted = [...list];
    const getPrice = (p: Product) => Number(p.gia_khuyen_mai ?? p.gia_goc ?? 0);

    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.ten_sanpham.localeCompare(b.ten_sanpham, "vi"));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.ten_sanpham.localeCompare(a.ten_sanpham, "vi"));
        break;
      case "oldest":
        sorted.sort((a, b) => a.id_sanpham - b.id_sanpham);
        break;
      case "newest":
        sorted.sort((a, b) => b.id_sanpham - a.id_sanpham);
        break;
      case "bestseller":
        sorted.sort((a, b) => {
          const aHas = a.gia_khuyen_mai ? 1 : 0;
          const bHas = b.gia_khuyen_mai ? 1 : 0;
          if (bHas !== aHas) return bHas - aHas;
          return (a.tong_ton_kho ?? 0) - (b.tong_ton_kho ?? 0);
        });
        break;
      case "stock-desc":
        sorted.sort((a, b) => (b.tong_ton_kho ?? 0) - (a.tong_ton_kho ?? 0));
        break;
      default: // featured
        break;
    }
    return sorted;
  }, [sortBy]);

  // ===== FILTER (PRICE + SIZE + COLOR) + SORT =====
  useEffect(() => {
    let temp = [...products];

    temp = temp.filter((p) => {
      const priceValue = Number(p.gia_khuyen_mai ?? p.gia_goc ?? 0);
      return priceValue <= price;
    });

    if (selectedSize) {
      temp = temp.filter((p) => p.kich_co?.includes(selectedSize));
    }

    if (selectedColor) {
      temp = temp.filter((p) => p.mau_sac?.some((mc) => mc.trim().toLowerCase() === selectedColor.trim().toLowerCase()));
    }

    temp = sortProducts(temp);
    setFiltered(temp);
    setCurrentPage(1);
  }, [price, selectedSize, selectedColor, products, sortProducts]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryClick = (id: number | null) => {
    // Update URL so header links and sidebar stay in sync
    if (id !== null) {
      navigate(`/new-products?category=${id}`, { replace: true });
    } else {
      navigate('/new-products', { replace: true });
    }
  };

  const handleSizeClick = (s: string) => {
    setSelectedSize((prev) => (prev === s ? null : s));
  };

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
          <h4 className="filter-group-title">Danh mục sản phẩm</h4>

          <ul className="category-list">
            <li
              className={activeCategory === null ? "active" : ""}
              onClick={() => handleCategoryClick(null)}
            >
              Sản phẩm mới
            </li>
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
          <h4 className="filter-group-title">Khoảng giá</h4>

          <div className="price-inputs">
            <span>0đ</span>
            <span>{price.toLocaleString("vi-VN")}đ</span>
          </div>
          <input
            className="price-slider"
            type="range"
            min={0}
            max={3000000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <div className="price-label">
            <span>0đ</span>
            <span>3,000,000đ</span>
          </div>
        </div>

        {/* COLOR */}
        <div className="filter-group">
          <h4 className="filter-group-title">Màu sắc</h4>
          <div className="color-list">
            {COLORS_LIST.map((c) => (
              <div
                key={c}
                className={`color-dot ${selectedColor === c ? "active" : ""}`}
                style={{ background: colorMap[c] || "#ccc" }}
                title={c}
                onClick={() => handleColorClick(c)}
              />
            ))}
          </div>
        </div>

        {/* SIZE */}
        <div className="filter-group">
          <h4 className="filter-group-title">Size</h4>
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
        {/* HEADER BAR */}
        <div className="product-header">
          <h2>
            Sản phẩm mới{" "}
            <span className="product-count">{filtered.length} sản phẩm</span>
          </h2>
          <div className="sort-bar">
            <label>Sắp xếp theo</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <div className="product-grid">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => <ProductCard key={product.id_sanpham} product={product} />)
            ) : (
              <p>Không có sản phẩm phù hợp</p>
            )}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              »
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewProduct;
