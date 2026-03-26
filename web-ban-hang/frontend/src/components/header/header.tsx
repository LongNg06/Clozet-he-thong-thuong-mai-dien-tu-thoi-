import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./header.css";

import logo from "../img2/logo.png";
import banner from "../img2/topbar_img.jpg";

const Header = () => {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    function load() {
      fetch("http://localhost:5000/cart")
        .then((r) => r.json())
        .then((data) => {
          const c = (data || []).reduce(
            (s: number, it: any) => s + (it.quantity || 0),
            0
          );
          setCount(c);
        })
        .catch(() => setCount(0));
    }

    load();
    window.addEventListener("cart:open", load as EventListener);

    return () =>
      window.removeEventListener("cart:open", load as EventListener);
  }, []);

  return (
    <>
      {/* TOP BANNER */}
      {showBanner && (
        <div className="top-banner">
          <img src={banner} alt="Banner Sale" />

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
            <Link to="#">Liên hệ</Link>
            
          </div>

        <div className="top-bar-right">
  <i className="fa-regular fa-bell"></i>
  <span>Thông báo của tôi</span>
  <span className="badge">0</span>

  <span style={{ marginLeft: 12 }}>
    <Link to="/login" style={{ textDecoration: "none", color: "inherit", marginRight: 8 }}>
      Đăng nhập
    </Link>
    <Link to="/register" style={{ textDecoration: "none", color: "inherit" }}>
      Đăng ký
    </Link>
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
              <img src={logo} alt="Torano" />
            </Link>
          </div>

          {/* MENU */}
          <nav className="menu">
            <ul>
              <li
                style={{ cursor: "pointer" }} // hiện con trỏ tay khi hover
                onClick={() => navigate("/new-products")}
              >
                Sản phẩm mới
              </li>
              {/* <li className="has-dropdown">
                <Link to="#">Danh mục sale</Link>
                <ul className="dropdown">
                  <li>
                    <Link to="#">Sale 70%</Link>
                  </li>
                  <li>
                    <Link to="#">Sale 60%</Link>
                  </li>
                  <li>
                    <Link to="#">Sale 50%</Link>
                  </li>
                </ul>
              </li> */}

              <li className="has-dropdown">
                <Link to="#">Áo nam</Link>
                <ul className="dropdown">
                  <li>
                    <Link to="#">Áo khoác</Link>
                  </li>
                  <li>
                    <Link to="#">Áo polo</Link>
                  </li>
                  <li>
                    <Link to="#">Áo sơ mi</Link>
                  </li>
                  <li>
                    <Link to="#">Áo thun</Link>
                  </li>
                  <li>
                    <Link to="#">Áo len</Link>
                  </li>
                </ul>
              </li>

              <li className="has-dropdown">
                <Link to="#">Quần nam</Link>
                <ul className="dropdown">
                  <li>
                    <Link to="#">Quần dài kaki</Link>
                  </li>
                  <li>
                    <Link to="#">Quần gió</Link>
                  </li>
                  <li>
                    <Link to="#">Quần jean</Link>
                  </li>
                  <li>
                    <Link to="#">Quần short</Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="#">Phụ kiện</Link>
              </li>

              <li>
                <Link to="#">Hệ thống cửa hàng</Link>
              </li>
            </ul>
          </nav>

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
      </header>
    </>
  );
};

export default Header;