import logo from "../../assets/img2/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./header.css";



interface SearchResult {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number;
  gia_khuyen_mai?: number | null;
  anh: string;
}

interface Notification {
  id: number;
  id_KH: number;
  nguoi_gui: "admin" | "user";
  tieu_de: string;
  noi_dung: string;
  parent_id: number | null;
  da_doc: number;
  ngay_tao: string;
}

const Header = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notification state
  const [notiOpen, setNotiOpen] = useState(false);
  const [notiCount, setNotiCount] = useState(0);
  const [notiList, setNotiList] = useState<Notification[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function load() {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      if (u && u.id) {
        fetch(`http://localhost:5000/cart?id_KH=${u.id}`)
          .then((r) => r.json())
          .then((data) => {
            const c = (data || []).reduce(
              (s: number, it: any) => s + (it.quantity || 0),
              0
            );
            setCount(c);
          })
          .catch(() => setCount(0));
      } else {
        try {
          const cartRaw = localStorage.getItem("cartItems");
          const cart = cartRaw ? JSON.parse(cartRaw) : [];
          const c = cart.reduce((s: number, it: any) => s + (it.quantity || 0), 0);
          setCount(c);
        } catch { setCount(0); }
      }
    }

    load();
    window.addEventListener("cart:open", load as EventListener);
    window.addEventListener("cartUpdated", load as EventListener);
    // load auth
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { setUser(null); }
    }

    const onUserLogin = (e: any) => {
      const detail = e?.detail || null;
      if (detail) setUser(detail);
      else {
        const r = localStorage.getItem('user');
        if (r) try { setUser(JSON.parse(r)); } catch { setUser(null); }
      }
    };

    const onUserLogout = () => setUser(null);

    window.addEventListener('user:login', onUserLogin as EventListener);
    window.addEventListener('user:logout', onUserLogout as EventListener);

    return () => {
      window.removeEventListener("cart:open", load as EventListener);
      window.removeEventListener("cartUpdated", load as EventListener);
      window.removeEventListener('user:login', onUserLogin as EventListener);
      window.removeEventListener('user:logout', onUserLogout as EventListener);
    };
  }, []);

  // Notification: fetch unread count periodically
  useEffect(() => {
    function fetchNotiCount() {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      if (u?.id) {
        fetch(`http://localhost:5000/notifications/unread-count?id_KH=${u.id}`)
          .then(r => r.json())
          .then(d => setNotiCount(d.count || 0))
          .catch(() => {});
      }
    }
    fetchNotiCount();
    const timer = setInterval(fetchNotiCount, 15000);
    return () => clearInterval(timer);
  }, [user]);

  // Notification: fetch list when dropdown opens
  useEffect(() => {
    if (!notiOpen) return;
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    if (u?.id) {
      fetch(`http://localhost:5000/notifications?id_KH=${u.id}`)
        .then(r => r.json())
        .then(d => setNotiList(d || []))
        .catch(() => {});
      // Mark all as read
      fetch("http://localhost:5000/notifications/read-all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_KH: u.id }),
      }).then(() => setNotiCount(0)).catch(() => {});
    }
  }, [notiOpen]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setNotiOpen(false);
        setReplyingTo(null);
        setReplyText("");
      }
    }
    if (notiOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notiOpen]);

  const handleReplySubmit = async (parentId: number) => {
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    if (!u?.id || !replyText.trim()) return;
    await fetch("http://localhost:5000/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_KH: u.id, nguoi_gui: "user", tieu_de: "Phản hồi", noi_dung: replyText.trim(), parent_id: parentId }),
    });
    setReplyText("");
    setReplyingTo(null);
    // Refresh list
    const res = await fetch(`http://localhost:5000/notifications?id_KH=${u.id}`);
    setNotiList(await res.json());
  };

  // Focus search input when overlay opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }
    searchTimerRef.current = setTimeout(() => {
      fetch(`http://localhost:5000/products/search?q=${encodeURIComponent(searchQuery.trim())}&limit=4`)
        .then((r) => r.json())
        .then((data) => {
          setSearchResults(data || []);
          // Also get total count
          fetch(`http://localhost:5000/products/search?q=${encodeURIComponent(searchQuery.trim())}&limit=9999`)
            .then((r) => r.json())
            .then((all) => setTotalResults((all || []).length))
            .catch(() => setTotalResults(0));
        })
        .catch(() => {
          setSearchResults([]);
          setTotalResults(0);
        });
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    setTotalResults(0);
  };

  return (
    <>
      {/* TOP BANNER */}
      {showBanner && (
        <div className="top-banner">
          <img src="https://clozet.io.vn/img2/topbar_img.jpg" alt="Banner Sale" />
          <button
            className="close-banner"
            onClick={() => setShowBanner(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* TOP BAR */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-left">
            Hotline mua hàng: <strong>0964942121</strong> (8:30 - 21:30, Tất cả
            các ngày trong tuần)
            <span className="divider">|</span>
            <Link to="/lienhe">Liên hệ</Link>
            
          </div>

        <div className="top-bar-right">
  {/* NOTIFICATION BELL */}
  {user && (
    <div className="noti-bell-wrap" ref={notiRef}>
      <button className="noti-bell-btn" onClick={() => { if (!user) { navigate("/login"); return; } setNotiOpen(!notiOpen); }}>
        <i className="fa-regular fa-bell"></i>
        {notiCount > 0 && <span className="noti-badge">{notiCount}</span>}
      </button>
      {notiOpen && (
        <div className="noti-dropdown">
          <div className="noti-dropdown-header">
            <strong>Thông báo</strong>
          </div>
          <div className="noti-dropdown-list">
            {notiList.length === 0 ? (
              <div className="noti-empty">Chưa có thông báo nào</div>
            ) : (
              notiList.map(n => (
                <div key={n.id} className={`noti-item ${n.nguoi_gui === "user" ? "noti-item-reply" : ""} ${n.da_doc ? "" : "noti-unread"}`}>
                  <div className="noti-item-sender">{n.nguoi_gui === "admin" ? "🛒 Admin" : "📤 Bạn"}</div>
                  <div className="noti-item-title">{n.tieu_de}</div>
                  {n.noi_dung && <div className="noti-item-body">{n.noi_dung}</div>}
                  <div className="noti-item-time">{new Date(n.ngay_tao).toLocaleString("vi-VN")}</div>
                  {n.nguoi_gui === "admin" && (
                    <button className="noti-reply-btn" onClick={() => { setReplyingTo(replyingTo === n.id ? null : n.id); setReplyText(""); }}>
                      Trả lời
                    </button>
                  )}
                  {replyingTo === n.id && (
                    <div className="noti-reply-form">
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Nhập phản hồi..." rows={2} />
                      <button className="noti-reply-send" onClick={() => handleReplySubmit(n.id)}>Gửi</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )}

        <span style={{ marginLeft: 12 }}>
          {user ? (
            <>
              <span style={{ marginRight: 12 }}>Xin chào, <strong>{user.name || user.ho_ten || user.fullname || user.email}</strong></span>
              <button onClick={() => {
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('user:logout'));
                // navigate to home
                (window as any).location = '/';
              }} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none", color: "inherit", marginRight: 8 }}>
                Đăng nhập
              </Link>
              <Link to="/register" style={{ textDecoration: "none", color: "inherit" }}>
                Đăng ký
              </Link>
            </>
          )}
        </span>
</div>

        </div>
      </div>

      {/* HEADER MAIN */}
      <header className="header">
        <div className="container header-content">
          {/* LOGO */}
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="Clozet" style={{height:40}} />
            </Link>
          </div>

          {/* MENU */}
          <nav className="menu">
            <ul>
             {/* <li
  className="highlight"
  style={{ cursor: "pointer" }}
  onClick={() => navigate("/new-products")}
>
  Sản phẩm mới
</li>
          */}
           <li>
                <Link to="/">Trang Chủ</Link>
              </li>
               <li>
                <Link to="/new-products">Sản Phẩm</Link>
              </li>
               <li>
                <Link to="/lienhe">Liên Hệ</Link>
              </li>
               <li>
                <Link to="/blogs">Bài Viết</Link>
              </li>
         
              <li>
                <Link to="/canh-bao-lua-dao">Cảnh Báo Lừa Đảo</Link>
              </li>
            </ul>
          </nav>

          {/* HEADER ICONS */}
          <div className="header-icons">
            {/* SEARCH ICON */}
            <button className="header-icon-btn" onClick={() => setShowSearch(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* USER ICON */}
            <button className="header-icon-btn" onClick={() => {
              if (!user) { navigate("/login"); return; }
              navigate(user.role === "admin" ? "/admin" : "/account");
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {/* CART ICON */}
            <button
              className="cart"
              onClick={() =>
                window.dispatchEvent(new Event("cart:open"))
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
              >
                <path d="M15.95 6H19.7V17.875C19.7 18.7344 19.3875 19.4635 18.7625 20.0625C18.1635 20.6875 17.4344 21 16.575 21H5.325C4.46563 21 3.72344 20.6875 3.09844 20.0625C2.49948 19.4635 2.2 18.7344 2.2 17.875V6H5.95C5.95 4.61979 6.43177 3.44792 7.39531 2.48438C8.3849 1.49479 9.56979 1 10.95 1C12.3302 1 13.5021 1.49479 14.4656 2.48438C15.4552 3.44792 15.95 4.61979 15.95 6ZM13.1375 3.8125C12.5385 3.1875 11.8094 2.875 10.95 2.875C10.0906 2.875 9.34844 3.1875 8.72344 3.8125C8.12448 4.41146 7.825 5.14062 7.825 6H14.075C14.075 5.14062 13.7625 4.41146 13.1375 3.8125ZM17.825 17.875V7.875H15.95V9.4375C15.95 9.69792 15.8589 9.91927 15.6766 10.1016C15.4943 10.2839 15.2729 10.375 15.0125 10.375C14.7521 10.375 14.5307 10.2839 14.3484 10.1016C14.1661 9.91927 14.075 9.69792 14.075 9.4375V7.875H7.825V9.4375C7.825 9.69792 7.73385 9.91927 7.55156 10.1016C7.36927 10.2839 7.14792 10.375 6.8875 10.375C6.62708 10.375 6.40573 10.2839 6.22344 10.1016C6.04115 9.91927 5.95 9.69792 5.95 9.4375V7.875H4.075V17.875C4.075 18.2135 4.19219 18.5 4.42656 18.7344C4.68698 18.9948 4.98646 19.125 5.325 19.125H16.575C16.9135 19.125 17.2 18.9948 17.4344 18.7344C17.6948 18.5 17.825 18.2135 17.825 17.875Z" />
              </svg>

              <span className="badge">{count}</span>
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      {showSearch && (
        <div className="search-overlay" onClick={closeSearch}>
          <div className="search-overlay-content" onClick={(e) => e.stopPropagation()}>
            <div className="search-overlay-header">
              <Link to="/" onClick={closeSearch}>
                <img src={logo} alt="Clozet" className="search-logo" />
              </Link>
              <div className="search-input-wrap">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeSearch();
                  }}
                />
                <button className="search-submit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
              <button className="search-close" onClick={closeSearch}>✕</button>
            </div>

            {/* SEARCH RESULTS */}
            {searchQuery.trim() && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((item) => {
                      const imgUrl = item.anh?.startsWith("http")
                        ? item.anh
                        : `http://localhost:5000/${(item.anh || "").replace(/^\/+/, "")}`;
                      return (
                        <div
                          key={item.id_sanpham}
                          className="search-result-item"
                          onClick={() => {
                            closeSearch();
                            navigate(`/product/${item.id_sanpham}`);
                          }}
                        >
                          <div className="search-result-info">
                            <div className="search-result-name">{item.ten_sanpham}</div>
                            <div className="search-result-price">
                              {Number(item.gia_khuyen_mai ?? item.gia_goc).toLocaleString("vi-VN")}đ
                            </div>
                          </div>
                          <img src={imgUrl} alt={item.ten_sanpham} className="search-result-img" />
                        </div>
                      );
                    })}
                    {totalResults > 4 && (
                      <div className="search-view-all">
                        Xem thêm {totalResults} sản phẩm
                      </div>
                    )}
                  </>
                ) : (
                  <div className="search-no-result">Không tìm thấy sản phẩm nào</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;