// import './App.css';
// import Header from './components/header/header';
// import Footer from './components/footer/Footer';
// import BannerSlider from './components/slider/BannerSlider';
// import Home from './pages/home/home';
// import CategorySection from './components/Category/CategorySection';
// function App() {
//   return (
//     <div className="App">
//      <>
//       <Header />
//         {/* Danh mục */}
//       <BannerSlider />
//       <CategorySection />
//       <Home />
//       <Footer />
//     </>
//     </div>
//   );
// }

// export default App;
import { Routes, Route } from "react-router-dom";
import Header from "./components/header/header";
import Footer from "./components/footer/Footer";
import BannerSlider from "./components/slider/BannerSlider";
import CategorySection from "./components/Category/CategorySection";
import Home from "./pages/home/home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";

function App() {
  return (
    <Routes>
      {/* Trang chính */}
      <Route
        path="/"
        element={
          <>
            <Header />
            <BannerSlider />
            <CategorySection />
            <Home />
            <Footer />
          </>
        }
      />

      {/* Login riêng */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} /> 
    </Routes>
  );
}

export default App;