import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/Product/ProductCart";
import "./home.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number;
  gia_khuyen_mai?: number;
  anh: string;
  mau_sac?: number | string;
  kich_co?: number | string;
  trang_thai?: number;
}


function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate(); // 👈 thêm dòng này

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        
        setProducts(data);
      });
  }, []);

  return (
  <div className="home-section">
    <h2 className="section-title">SẢN PHẨM SALES TẾT</h2>

    <div className="product-grid">
    {products.slice(0, 6).map((product) => (
  <ProductCard
    key={product.id_sanpham}
    product={{
      ...product,
      
    
      anh: `http://localhost:5000${product.anh}`
    }}
    
  />
      ))}
    </div>

    <div className="see-more-product">
      <button
        className="view-all-btn"
        onClick={() => navigate("/sale")}
      >
        XEM TẤT CẢ SẢN PHẨM KHUYẾN MÃI
      </button>
      
    </div>

  </div>  
  
);

}

export default Home;