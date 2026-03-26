// src/pages/Admin.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./style.css";

type Product = { id: number; name: string; price: number; stock: number; image?: string };
const formatVND = (n: number) => n.toLocaleString("vi-VN") + " ₫";

/* SidePanel fixed left */
function SidePanel({ current }: { current: string }) {
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: 16,
    top: "calc(var(--topbar-h) + 20px)",
    width: 300,
    background: "#0b1220",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    zIndex: 1200,
    boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
  };
  const linkBase: React.CSSProperties = { color: "#fff", textDecoration: "none", padding: "6px 8px", borderRadius: 6, fontSize: 13, display: "inline-block" };
  const active = { ...linkBase, background: "rgba(255,255,255,0.06)", color: "#ffd54a" };

  return (
    <div className="side-panel" style={panelStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 700, color: "#ffd54a" }}>GLANCE Admin</div>
        <div style={{ color: "#9aa3b2", fontSize: 12, marginLeft: "auto" }}>Bảng quản trị</div>
      </div>

      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Link to="/admin" style={current === "overview" ? active : linkBase}>🏠 Tổng quan</Link>
        <Link to="/admin/products" style={current === "products" ? active : linkBase}>📦 Sản phẩm</Link>
        <Link to="/admin/categories" style={current === "categories" ? active : linkBase}>🗂️ Danh mục</Link>
        <Link to="/admin/orders" style={current === "orders" ? active : linkBase}>🧾 Đơn hàng</Link>
      </div>

      <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}>
        <div style={{ color: "#9aa3b2", fontSize: 12 }}>LABELS</div>
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          <span className="badge bg-danger">Important</span>
          <span className="badge bg-warning">Warning</span>
          <span className="badge bg-info">Info</span>
        </div>
      </div>
    </div>
  );
}

/* Topbar (header inside admin) */
function Topbar() {
  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        <span className="hotline">Hotline mua hàng: <strong>0964942121</strong></span>
        <span className="hotline-small"> (8:30 - 21:30)</span>
      </div>
      <div className="topbar-right">
        <Link to="/contact" className="top-link">Liên hệ</Link>
        <Link to="/login" className="top-link">Đăng nhập</Link>
        <Link to="/register" className="top-link">Đăng ký</Link>
      </div>
    </header>
  );
}

/* Footer inside admin */
function Footer() {
  return (
    <footer className="admin-footer">
      <div style={{ textAlign: "center", padding: "12px 8px", color: "#6b7280", fontSize: 13 }}>
        © {new Date().getFullYear()} GLANCE — Quản trị viên
      </div>
    </footer>
  );
}

export default function Admin() {
  const location = useLocation();
  const path = location.pathname || "/admin";
  const current = path.includes("/products")
    ? "products"
    : path.includes("/categories")
    ? "categories"
    : path.includes("/orders")
    ? "orders"
    : "overview";

  const API = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || "http://localhost:5000";

  const [overview] = useState({ totalProducts: 128, ordersToday: 12, revenue: 45000000 });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path.includes("/products")) return;
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${API}/products`);
        if (!res.ok) throw new Error(`Lỗi ${res.status}`);
        const data = await res.json();
        const list: Product[] = Array.isArray(data) ? data : data.rows || [];
        if (mounted) setProducts(list);
      } catch (err: any) {
        console.error(err);
        if (mounted) { setError("Không tải được sản phẩm"); setProducts([]); }
      } finally { if (mounted) setLoading(false); }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, [API, path]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="admin-root">
      <Topbar />
      <SidePanel current={current} />

      <div className="content">
        {/* greeting placed below topbar and aligned with content area (not inside topbar) */}
        <div className="admin-greeting">
          <div style={{ fontSize: 14, color: "#6b7280" }}>Xin chào, <strong>Admin</strong></div>
        </div>

        <main className="admin-content">
          <div style={{ marginBottom: 12 }}>
            <nav style={{ fontSize: 13, color: "#6b7280" }}>
              <span>Admin</span> <span style={{ margin: "0 6px" }}>›</span> <strong>{current === "products" ? "Sản phẩm" : "Tổng quan"}</strong>
            </nav>
          </div>

          <div className="row overview-row">
            <div className="col col-4">
              <div className="card">
                <div className="title">Tổng sản phẩm</div>
                <div className="value">{overview.totalProducts}</div>
              </div>
            </div>
            <div className="col col-4">
              <div className="card">
                <div className="title">Đơn hàng hôm nay</div>
                <div className="value">{overview.ordersToday}</div>
              </div>
            </div>
            <div className="col col-4">
              <div className="card">
                <div className="title">Doanh thu</div>
                <div className="value">{overview.revenue.toLocaleString("vi-VN")} ₫</div>
              </div>
            </div>
          </div>

          {current !== "products" ? (
            <div className="row">
              <div className="col col-12">
                <div className="card">
                  <h4 style={{ marginTop: 0 }}>Báo cáo nhanh</h4>
                  <p style={{ color: "var(--muted)" }}>Dữ liệu demo. Chuyển sang API thực tế khi cần.</p>
                </div>
              </div>
            </div>
          ) : (
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Sản phẩm</h3>
                <Link to="/admin/products/new" className="btn btn-primary">Thêm sản phẩm</Link>
              </div>

              {loading && <div className="card" style={{ marginBottom: 12 }}>Đang tải sản phẩm...</div>}
              {error && <div className="card" style={{ marginBottom: 12, color: "#dc3545" }}>{error}</div>}

              <div className="row">
                {products.map(p => (
                  <div key={p.id} className="col col-4">
                    <div className="card">
                      <img className="product-img" src={p.image || "/img/placeholder.png"} alt={p.name} />
                      <div className="card-body">
                        <h5 style={{ margin: 0 }}>{p.name}</h5>
                        <div style={{ color: "var(--muted)", marginTop: 6 }}>Giá: {formatVND(p.price)}</div>
                        <div style={{ color: "var(--muted)", marginTop: 6 }}>Tồn kho: {p.stock}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                          <Link to={`/admin/products/${p.id}/edit`} className="btn" style={{ borderColor: "#6c757d" }}>Sửa</Link>
                          <button className="btn btn-outline-danger" onClick={() => handleDelete(p.id)}>Xóa</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && products.length === 0 && (
                  <div className="col col-12">
                    <div className="card">Không có sản phẩm</div>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
