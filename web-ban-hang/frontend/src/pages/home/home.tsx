import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProductCard from "../../components/Product/ProductCart";
import "./home.css";

const imgUrl = (src: string) => src && src.startsWith("/") ? `http://localhost:5000${src}` : src;

interface BlogPost {
  id_baiviet: number;
  tieu_de: string;
  anh_dai_dien: string;
  ngay_tao: string;
  tom_tat?: string;
  tac_gia?: string;
}

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


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
      });

  }, []);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  useEffect(() => {
    requestAnimationFrame(updateArrows);
  }, [products]);

  function scroll(dir: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth + 20), behavior: "smooth" });
  }

  return (
  <div className="home-section">
    
    <h2 className="section-title">SẢN PHẨM SALES TẾT</h2>
 
    <div className="product-grid-wrap">
      {canScrollLeft && (
        <button className="grid-arrow grid-arrow-left" onClick={() => scroll(-1)}>‹</button>
      )}
      <div className="product-grid" ref={trackRef} onScroll={updateArrows}>
        {products.map((product) => (
          <ProductCard
            key={product.id_sanpham}
            product={{
              ...product,
              anh: `http://localhost:5000${product.anh}`
            }}
          />
        ))}
      </div>
      {canScrollRight && (
        <button className="grid-arrow grid-arrow-right" onClick={() => scroll(1)}>›</button>
      )}
    </div>

    <div className="see-more-product">
      <button
        className="view-all-btn"
        onClick={() => navigate("/sale")}
      >
        XEM TẤT CẢ SẢN PHẨM MỚI 
      </button>
      
    </div>

  </div>  
  
);

}

// ===== NEWS SECTION (separate component, placed above footer) =====
export function HomeNewsSection() {
  const [newsItems, setNewsItems] = useState<BlogPost[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/blogs")
      .then((res) => res.json())
      .then((data: BlogPost[]) => setNewsItems(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setNewsItems([]));
  }, []);

  if (newsItems.length === 0) return null;

  return (
    <div className="home-news-section">
      <h2 className="section-title">TIN TỨC & BÀI VIẾT</h2>
      <div className="home-news-list">
        {newsItems.map((item) => (
          <div className="home-news-row" key={item.id_baiviet}>
            <h3 className="home-news-row-title">
              <Link to={`/blogs/${item.id_baiviet}`}>{item.tieu_de}</Link>
            </h3>
            <div className="home-news-row-meta">
              {item.ngay_tao && <span>{new Date(item.ngay_tao).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>}
              {item.tac_gia && <>, Posted By <Link to={`/blogs/${item.id_baiviet}`} className="news-author">{item.tac_gia}</Link></>}
            </div>
            <div className="home-news-row-body">
              <Link to={`/blogs/${item.id_baiviet}`} className="home-news-row-img">
                <img src={imgUrl(item.anh_dai_dien)} alt={item.tieu_de} />
              </Link>
              <div className="home-news-row-content">
                <p>{item.tom_tat || ""}</p>
                <Link to={`/blogs/${item.id_baiviet}`} className="news-read-more">READ MORE</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="see-more-product">
        <button className="view-all-btn" onClick={() => navigate("/blogs")}>
          XEM TẤT CẢ BÀI VIẾT
        </button>
      </div>
    </div>
  );
}

export { Home };