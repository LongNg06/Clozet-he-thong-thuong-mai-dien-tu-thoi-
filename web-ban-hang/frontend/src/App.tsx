import './App.css';
import Header from './components/header/header';
import Footer from './components/footer/Footer';
import BannerSlider from './components/slider/BannerSlider';
import Home from './pages/home/home';
import SaleBoSuuTap from './components/SaleBoSuuTap/SaleBoSuuTap';
import CategoryTabs from './components/CategoryTabs/CategoryTabs';
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
      {/* Category tabs placed above footer */}
      <CategoryTabs
        items={["Áo Khoác", "Áo Polo", "Áo Sơ Mi"]}
        defaultActive="Áo Khoác"
        categoryMap={{ "Áo Khoác": 1, "Áo Polo": 5, "Áo Sơ Mi": 7 }}
      />
      {/* Second tab row (tab2) for Quần */}
      <CategoryTabs
        items={["Quần Kaki", "Quần Jean", "Quần Âu"]}
        defaultActive="Quần Kaki"
        categoryMap={{ "Quần Kaki": 3, "Quần Jean": 4, "Quần Âu": 6 }}
      />
      <Footer />
    </>
    </div>
  );
}

export default App;
