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
    </Routes>
  );
}

export default App;