import { useEffect, useState } from "react";
import ProductCard from "../../components/Product/ProductCart";
import "./home.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number;
  gia_khuyen_mai?: number;
  anh: string;
  mau_sac?: number;
  kich_co?: number;
  trang_thai?: string;
}

function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        
      });
  }, []);

  return (
    <div className="home-section">
      <h2 className="section-title">SẢN PHẨM SALES TẾT </h2>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id_sanpham}
            product={{
              ...product,
              anh: `http://localhost:5000${product.anh}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;