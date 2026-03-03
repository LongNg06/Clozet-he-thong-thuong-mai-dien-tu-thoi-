import './App.css';
import Header from './components/header/header';
import Footer from './components/footer/Footer';
import BannerSlider from './components/slider/BannerSlider';
import Home from './pages/home/home';
import SaleBoSuuTap from './components/SaleBoSuuTap/SaleBoSuuTap';
import CategorySection from './components/Category/CategorySection';
function App() {
  return (
    <div className="App">
     <>
      <Header />
        {/* Danh mục */}
    
      <BannerSlider />
      <CategorySection />
      <Home />
       <SaleBoSuuTap />
      <Footer />
    </>
    </div>
  );
}

export default App;
