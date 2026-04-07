import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./style.css";

const API = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || "http://localhost:5000";
const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";

/* ====== TYPES ====== */
type Product = {
  id_sanpham: number; ten_sanpham: string; gia_goc: number; gia_khuyen_mai?: number;
  anh: string; mo_ta?: string; trang_thai: number; id_danhmuc?: number;
  ten_danhmuc?: string; tong_ton_kho?: number;
};
type Category = {
  id_danhmuc: number; ten_danhmuc: string; mo_ta?: string; HinhAnh: string;
  trang_thai?: number; so_san_pham?: number;
};
type Order = {
  id_donhang: number; ho_ten?: string; email?: string; tong_thanh_toan: number;
  trang_thai_donhang: string; ngay_dat: string;
  ten_nguoinhan?: string; so_dien_thoai?: string; dia_chi_cu_the?: string;
  phuong_xa?: string; quan_huyen?: string; tinh_thanh?: string;
};
type Stats = { totalProducts: number; ordersToday: number; totalMembers: number };
type RecentOrder = { id_donhang: number; ho_ten: string; tong_thanh_toan: number; trang_thai_donhang: string; ngay_dat: string };
type LowStock = { id_sanpham: number; ten_sanpham: string; anh: string; tong_ton: number };

/* ====== SIDEBAR ====== */
function Sidebar({ current }: { current: string }) {
  const nav = useNavigate();
  const links = [
    { key: "overview", to: "/admin", icon: "📊", label: "Tổng quan" },
    { key: "products", to: "/admin/products", icon: "📦", label: "Sản phẩm" },
    { key: "categories", to: "/admin/categories", icon: "🗂️", label: "Danh mục" },
    { key: "orders", to: "/admin/orders", icon: "🧾", label: "Đơn hàng" },
  ];
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user:logout'));
    nav('/');
  };
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">CLOZET</div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <Link key={l.key} to={l.to} className={`sidebar-link ${current === l.key ? "active" : ""}`}>
            <span className="icon">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

/* ====== OVERVIEW PAGE ====== */
function OverviewPage() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, ordersToday: 0, totalMembers: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);

  useEffect(() => {
    fetch(`${API}/admin/stats`).then(r => r.json()).then(setStats).catch(console.error);
    fetch(`${API}/admin/orders/recent`).then(r => r.json()).then(setRecentOrders).catch(console.error);
    fetch(`${API}/admin/low-stock`).then(r => r.json()).then(setLowStock).catch(console.error);
  }, []);

  return (
    <>
      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-label">Tổng sản phẩm</div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-icon">📦</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Đơn hôm nay</div>
          <div className="stat-value">{stats.ordersToday}</div>
          <div className="stat-icon">🛒</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Thành viên</div>
          <div className="stat-value">{stats.totalMembers}</div>
          <div className="stat-icon">👤</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-title">
            🛍️ Đơn hàng mới
            {recentOrders.length > 0 && <span className="badge-count">{recentOrders.length}</span>}
          </div>
          {recentOrders.length === 0 && <div style={{ color: "var(--muted)" }}>Chưa có đơn hàng</div>}
          {recentOrders.map(o => (
            <div key={o.id_donhang} className="order-item">
              <div>
                <div className="order-id">#{o.id_donhang}</div>
                <div className="order-name">{o.ho_ten || "Khách vãng lai"}</div>
              </div>
              <div className="order-price">{formatVND(o.tong_thanh_toan || 0)}</div>
            </div>
          ))}
        </div>

        {/* Low Stock */}
        <div className="card">
          <div className="card-title">
            ⚠️ Sắp hết hàng
            {lowStock.length > 0 && <span className="badge-count">{lowStock.length}</span>}
          </div>
          {lowStock.length === 0 && <div style={{ color: "var(--muted)" }}>Tất cả đều đủ hàng</div>}
          {lowStock.map(p => (
            <div key={p.id_sanpham} className="lowstock-item">
              <div>
                <div className="lowstock-name">{p.ten_sanpham}</div>
                <div className="lowstock-id">ID: #{p.id_sanpham}</div>
              </div>
              <div className="lowstock-count" style={{ color: p.tong_ton === 0 ? "#ef4444" : p.tong_ton < 5 ? "#f59e0b" : "#fb923c" }}>
                {p.tong_ton === 0 ? "Hết hàng" : `${p.tong_ton} còn`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ====== PRODUCT FORM MODAL ====== */
function ProductModal({ product, categories, onClose, onSave }: {
  product: Partial<Product> | null; categories: Category[];
  onClose: () => void; onSave: (p: Partial<Product>) => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(product || {});
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{product?.id_sanpham ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
        <div className="admin-form">
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input value={form.ten_sanpham || ""} onChange={e => set("ten_sanpham", e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Giá gốc</label>
              <input type="number" value={form.gia_goc || ""} onChange={e => set("gia_goc", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Giá khuyến mãi</label>
              <input type="number" value={form.gia_khuyen_mai || ""} onChange={e => set("gia_khuyen_mai", +e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Danh mục</label>
            <select value={form.id_danhmuc || ""} onChange={e => set("id_danhmuc", +e.target.value || null)}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map(c => (
                <option key={c.id_danhmuc} value={c.id_danhmuc}>{c.ten_danhmuc}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Ảnh (URL)</label>
            <input value={form.anh || ""} onChange={e => set("anh", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea value={form.mo_ta || ""} onChange={e => set("mo_ta", e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary" onClick={() => onSave(form)}>Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== PRODUCTS PAGE ====== */
function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Product> | null | false>(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/admin/products`).then(r => r.json()),
      fetch(`${API}/admin/categories`).then(r => r.json()),
    ]).then(([prods, cats]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (form: Partial<Product>) => {
    const isEdit = !!form.id_sanpham;
    const url = isEdit ? `${API}/admin/products/${form.id_sanpham}` : `${API}/admin/products`;
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setModal(false);
      load();
    } catch { alert("Lưu thất bại"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await fetch(`${API}/admin/products/${id}`, { method: "DELETE" });
      load();
    } catch { alert("Xóa thất bại"); }
  };

  const filtered = products.filter(p => p.ten_sanpham?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#fff", margin: 0 }}>Quản lý sản phẩm</h2>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ Thêm sản phẩm</button>
      </div>

      <div className="admin-search">
        <input placeholder="Tìm kiếm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? <div>Đang tải...</div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id_sanpham}>
                  <td><img className="product-thumb" src={p.anh || "/img/placeholder.png"} alt="" /></td>
                  <td style={{ fontWeight: 600, color: "#fff" }}>{p.ten_sanpham}</td>
                  <td>{p.ten_danhmuc || "—"}</td>
                  <td>
                    {p.gia_khuyen_mai ? (
                      <>
                        <span style={{ color: "#4ade80", fontWeight: 600 }}>{formatVND(p.gia_khuyen_mai)}</span>
                        <br /><span style={{ textDecoration: "line-through", color: "var(--muted)", fontSize: "0.8rem" }}>{formatVND(p.gia_goc)}</span>
                      </>
                    ) : <span style={{ fontWeight: 600 }}>{formatVND(p.gia_goc)}</span>}
                  </td>
                  <td>
                    {(() => {
                      const stock = p.tong_ton_kho ?? 0;
                      if (stock === 0) return <span style={{ color: "#ef4444", fontWeight: 700 }}>0 ⛔</span>;
                      if (stock < 10) return <span style={{ color: "#f59e0b", fontWeight: 700 }}>{stock} ⚠️</span>;
                      return <span style={{ color: "#4ade80" }}>{stock}</span>;
                    })()}
                  </td>
                  <td>
                    <span className={`status-badge ${p.trang_thai ? "delivered" : "cancelled"}`}>
                      {p.trang_thai ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(p)}>Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id_sanpham)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>Không tìm thấy sản phẩm</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal !== false && (
        <ProductModal product={modal} categories={categories} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </>
  );
}

/* ====== CATEGORY MODAL ====== */
function CategoryModal({ category, onClose, onSave }: {
  category: Partial<Category> | null; onClose: () => void; onSave: (c: Partial<Category>) => void;
}) {
  const [form, setForm] = useState<Partial<Category>>(category || {});
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{category?.id_danhmuc ? "Sửa danh mục" : "Thêm danh mục"}</h2>
        <div className="admin-form">
          <div className="form-group">
            <label>Tên danh mục</label>
            <input value={form.ten_danhmuc || ""} onChange={e => set("ten_danhmuc", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea value={form.mo_ta || ""} onChange={e => set("mo_ta", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Hình ảnh (tên file)</label>
            <input value={form.HinhAnh || ""} onChange={e => set("HinhAnh", e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary" onClick={() => onSave(form)}>Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== CATEGORIES PAGE ====== */
function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Category> | null | false>(false);

  const load = () => {
    setLoading(true);
    fetch(`${API}/admin/categories`).then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (form: Partial<Category>) => {
    const isEdit = !!form.id_danhmuc;
    const url = isEdit ? `${API}/admin/categories/${form.id_danhmuc}` : `${API}/admin/categories`;
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setModal(false);
      load();
    } catch { alert("Lưu thất bại"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await fetch(`${API}/admin/categories/${id}`, { method: "DELETE" });
      load();
    } catch { alert("Xóa thất bại"); }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#fff", margin: 0 }}>Quản lý danh mục</h2>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ Thêm danh mục</button>
      </div>

      <div className="card">
        {loading ? <div>Đang tải...</div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Hình</th><th>Tên danh mục</th><th>Mô tả</th><th>Số SP</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id_danhmuc}>
                  <td>{c.id_danhmuc}</td>
                  <td><img className="product-thumb" src={`/danhmuc_img/${c.HinhAnh}`} alt="" /></td>
                  <td style={{ fontWeight: 600, color: "#fff" }}>{c.ten_danhmuc}</td>
                  <td style={{ color: "var(--muted)" }}>{c.mo_ta || "—"}</td>
                  <td>{c.so_san_pham || 0}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(c)}>Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id_danhmuc)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>Chưa có danh mục</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal !== false && (
        <CategoryModal category={modal} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </>
  );
}

/* ====== ORDERS PAGE ====== */
function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    fetch(`${API}/admin/orders`).then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API}/admin/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trang_thai_donhang: status }),
      });
      load();
    } catch { alert("Cập nhật thất bại"); }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "cho_xac_nhan": return { text: "Chờ xác nhận", cls: "pending" };
      case "dang_giao": return { text: "Đang giao", cls: "shipping" };
      case "da_giao": return { text: "Đã giao", cls: "delivered" };
      case "da_huy": return { text: "Đã hủy", cls: "cancelled" };
      default: return { text: s || "Mới", cls: "pending" };
    }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.trang_thai_donhang === filter);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#fff", margin: 0 }}>Quản lý đơn hàng</h2>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { key: "all", label: "Tất cả" },
          { key: "cho_xac_nhan", label: "Chờ xác nhận" },
          { key: "dang_giao", label: "Đang giao" },
          { key: "da_giao", label: "Đã giao" },
          { key: "da_huy", label: "Đã hủy" },
        ].map(f => (
          <button key={f.key} className={`btn btn-sm ${filter === f.key ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      <div className="card">
        {loading ? <div>Đang tải...</div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã ĐH</th><th>Khách hàng</th><th>Địa chỉ</th><th>Tổng tiền</th><th>Ngày đặt</th><th>Trạng thái</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const st = statusLabel(o.trang_thai_donhang);
                const addr = [o.dia_chi_cu_the, o.phuong_xa, o.quan_huyen, o.tinh_thanh].filter(Boolean).join(", ");
                return (
                  <tr key={o.id_donhang}>
                    <td style={{ fontWeight: 700, color: "#fff" }}>#{o.id_donhang}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{o.ho_ten || o.ten_nguoinhan || "Khách"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{o.email || o.so_dien_thoai || ""}</div>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--muted)", maxWidth: 200 }}>{addr || "—"}</td>
                    <td style={{ fontWeight: 700, color: "#4ade80" }}>{formatVND(o.tong_thanh_toan || 0)}</td>
                    <td style={{ fontSize: "0.85rem" }}>{o.ngay_dat ? new Date(o.ngay_dat).toLocaleDateString("vi-VN") : "—"}</td>
                    <td><span className={`status-badge ${st.cls}`}>{st.text}</span></td>
                    <td>
                      <select
                        className="btn btn-outline btn-sm"
                        style={{ background: "transparent", color: "var(--text)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "4px 8px", fontSize: "0.8rem" }}
                        value={o.trang_thai_donhang || ""}
                        onChange={e => updateStatus(o.id_donhang, e.target.value)}
                      >
                        <option value="cho_xac_nhan">Chờ xác nhận</option>
                        <option value="dang_giao">Đang giao</option>
                        <option value="da_giao">Đã giao</option>
                        <option value="da_huy">Đã hủy</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>Không có đơn hàng</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ====== MAIN ADMIN COMPONENT ====== */
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

  const pageTitle = {
    overview: "Admin Dashboard",
    products: "Sản phẩm",
    categories: "Danh mục",
    orders: "Đơn hàng",
  }[current];

  return (
    <div className="admin-root">
      <Sidebar current={current} />

      <div className="admin-main">
        <div className="admin-header">
          <h1>{pageTitle}</h1>
          <div className="header-right">
            <div className="greeting">Xin chào, <strong>Admin</strong></div>
            <button className="header-logout-btn" onClick={() => { localStorage.removeItem('user'); window.dispatchEvent(new Event('user:logout')); window.location.href = '/'; }}>
              Đăng xuất
            </button>
          </div>
        </div>

        {current === "overview" && <OverviewPage />}
        {current === "products" && <ProductsPage />}
        {current === "categories" && <CategoriesPage />}
        {current === "orders" && <OrdersPage />}

        <footer className="admin-footer">
          © {new Date().getFullYear()} CLOZET SIÊU VIP HEHE — Admin
        </footer>
      </div>
    </div>
  );
}
