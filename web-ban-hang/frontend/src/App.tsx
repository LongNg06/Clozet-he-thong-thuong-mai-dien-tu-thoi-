import './App.css';
import Header from './components/header/header';
import Footer from './components/footer/Footer';
import BannerSlider from './components/slider/BannerSlider';
import Home from './pages/home/home';
import SaleBoSuuTap from './components/SaleBoSuuTap/SaleBoSuuTap';
import BoSuuTapMuaHe from './components/BoSuuTapMuaHe/BoSuuTapMuaHe';
import CategoryTabs from './components/CategoryTabs/CategoryTabs';
import CategorySection from './components/Category/CategorySection';
import { Routes, Route, useLocation } from 'react-router-dom';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CartDrawer from './components/CartDrawer/CartDrawer';
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import NewProduct from './pages//NewProduct copy/newProduct';
import Login from "../src/components/Login/Login";
import Register from "../src/components/Register/Register";
import ForgotPassword from "../src/components/ForgotPassword/ForgotPassword";
import Admin from "../src/pages/admin/admin";
import CanhBaoLuaDao from "./pages/CanhBaoLuaDao/CanhBaoLuaDao";
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
      <BoSuuTapMuaHe categoryIds={[3, 5]} image="/danhmuc_img/bosuutaphe.jpg" />
      {/* Second tab row (tab2) for Quần */}
      <CategoryTabs
        items={["Quần Kaki", "Quần Jean", "Quần Âu"]}
        defaultActive="Quần Kaki"
        categoryMap={{ "Quần Kaki": 3, "Quần Jean": 4, "Quần Âu": 6 }}
      />
    </>
  );
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

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
 <Route path="/admin/*" element={<Admin />} />
          <Route path="/canh-bao-lua-dao" element={<CanhBaoLuaDao />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default App;
