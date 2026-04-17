import './App.css';
import Header from './components/header/header';
import Footer from './components/footer/Footer';
import BannerSlider from './components/slider/BannerSlider';
import Home from './pages/home/home';
import { HomeNewsSection } from './pages/home/home';
import SaleBoSuuTap from './components/SaleBoSuuTap/SaleBoSuuTap';
import BoSuuTapMuaHe from './components/BoSuuTapMuaHe/BoSuuTapMuaHe';
import CategoryTabs from './components/CategoryTabs/CategoryTabs';
import CategorySection from './components/Category/CategorySection';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CartDrawer from './components/CartDrawer/CartDrawer';
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import NewProduct from './pages//NewProduct copy/newProduct';
import Login from "../src/components/Login/Login";
import Register from "../src/components/Register/Register";
import ForgotPassword from "../src/components/ForgotPassword/ForgotPassword";
import Admin from "../src/pages/admin/admin";
import AccountPage from "./pages/account/AccountPage";
import CanhBaoLuaDao from "./pages/CanhBaoLuaDao/CanhBaoLuaDao";
import LienHe from "./pages/lienhe/lienhe";
import BlogList from "./pages/blogs/BlogList";
import BlogDetail from "./pages/blogs/BlogDetail";

// Admin route guard: only role=admin can access
function AdminGuard() {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (user && user.role === "admin") return <Admin />;
  } catch {}
  return <Navigate to="/login" replace />;
}
function HomeLayout() {
  return (
    <>
      <BannerSlider />
      <CategorySection />
      <Home />
      <SaleBoSuuTap />
      {/* Category tabs placed above footer */}
      <CategoryTabs
        items={["Áo Khoác", "Áo Polo", "Áo Sơ Mi"]}
        defaultActive="Áo Khoác"
        categoryMap={{ "Áo Khoác": 1, "Áo Polo": 5, "Áo Sơ Mi": 7 }}
      />
      {/* Bộ sưu tập Mùa Hè - xuất hiện giữa 2 CategoryTabs */}
      <BoSuuTapMuaHe categoryIds={[4]} image="/danhmuc_img/bosuutaphe.jpg" />
      {/* Second tab row (tab2) for Quần */}
      <CategoryTabs
        items={["Quần Kaki", "Quần Jean", "Quần Âu"]}
        defaultActive="Quần Kaki"
        categoryMap={{ "Quần Kaki": 3, "Quần Jean": 4, "Quần Âu": 6 }}
      />
      <HomeNewsSection />
      {/* YouTube video embed */}
      <div className="home-video-section">
        <h2 className="section-title">VIDEO NỔI BẬT</h2>
        <div className="home-video-grid">
          <div className="home-video-wrap">
            <iframe
              src="https://www.youtube.com/embed/XZqbCy9gic8"
              title="Clozet Video 1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="home-video-wrap">
            <iframe
              src="https://www.youtube.com/embed/eZdihh6LuLw"
              title="Clozet Video 2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="home-video-wrap">
            <iframe
              src="https://www.youtube.com/embed/dQYYhh1oR9s"
              title="Clozet Video 3"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  // Dynamic page title
  useEffect(() => {
    const titleMap: Record<string, string> = {
      '/': 'CLOZET - Trang chủ',
      '/cart': 'CLOZET - Giỏ hàng',
      '/checkout': 'CLOZET - Thanh toán',
      '/new-products': 'CLOZET - Sản phẩm mới',
      '/login': 'CLOZET - Đăng nhập',
      '/register': 'CLOZET - Đăng ký',
      '/forgot-password': 'CLOZET - Quên mật khẩu',
      '/account': 'CLOZET - Tài khoản',
      '/canh-bao-lua-dao': 'CLOZET - Cảnh báo lừa đảo',
      '/lienhe': 'CLOZET - Liên hệ',
      '/blogs': 'CLOZET - Tin tức',
    };
    const path = location.pathname;
    if (titleMap[path]) {
      document.title = titleMap[path];
    } else if (path.startsWith('/product/')) {
      document.title = 'CLOZET - Chi tiết sản phẩm';
    } else if (path.startsWith('/blogs/')) {
      document.title = 'CLOZET - Bài viết';
    } else if (path.startsWith('/admin')) {
      document.title = 'CLOZET - Quản trị';
    } else {
      document.title = 'CLOZET';
    }
  }, [location.pathname]);

  return (
    <div className="App">
      {!isAdmin && <Header />}
      {!isAdmin && <CartDrawer />}
      <main>
        <Routes>
          <Route path="/" element={<HomeLayout />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/new-products" element={<NewProduct />} /> {/* mới */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/*" element={<AdminGuard />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/canh-bao-lua-dao" element={<CanhBaoLuaDao />} />
          <Route path="/lienhe" element={<LienHe />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
        </Routes>
      </main>
                {!isAdmin && <Footer />}
    </div>
  );
}

export default App;
