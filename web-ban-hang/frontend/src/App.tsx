import './App.css';
import Header from './components/header/header';
import Footer from './components/footer/Footer';
import BannerSlider from './components/slider/BannerSlider';
import Home from './pages/home/home';
import SaleBoSuuTap from './components/SaleBoSuuTap/SaleBoSuuTap';
import BoSuuTapMuaHe from './components/BoSuuTapMuaHe/BoSuuTapMuaHe';
import CategoryTabs from './components/CategoryTabs/CategoryTabs';
import CategorySection from './components/Category/CategorySection';
import { Routes, Route } from 'react-router-dom';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CartDrawer from './components/CartDrawer/CartDrawer';
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import NewProduct from './pages/NewProduct/newProduct';
import Login from "../src/components/Login/Login";
// import SignUp from "../src/components/SignUp/SignUp";
import Admin from "../src/pages/admin/admin";
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
  return (
    <div className="App">
      <Header />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/" element={<HomeLayout />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/new-products" element={<NewProduct />} /> {/* mới */}
          <Route path="/login" element={<Login />} />
  {/* <Route path="/register" element={<Register />} /> */}
 <Route path="/admin/*" element={<Admin />} />
          
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
