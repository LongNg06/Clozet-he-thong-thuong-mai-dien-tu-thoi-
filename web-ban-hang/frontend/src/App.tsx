import './App.css';
import Header from './components/header/header';
import Footer from './components/footer/Footer';
import BannerSlider from './components/slider/BannerSlider';
import Home from './pages/home/home';
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
      <Footer />
    </>
    </div>
  );
}

export default App;
