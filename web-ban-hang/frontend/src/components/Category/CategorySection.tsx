import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css/bundle";

interface Category {
  id_danhmuc: number;
  ten_danhmuc: string;
  HinhAnh: string;
}


function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

 return (
  <section className="category-section-wrapper">
 <div className="category-header">
  <h3 className="category-title">DANH MỤC SẢN PHẨM</h3>

  <div className="category-arrows">
    <div className="custom-prev">←</div>
    <div className="custom-next">→</div>
  </div>
</div>

<Swiper
  className="category-swiper"
  modules={[Navigation]}
  spaceBetween={30}
  slidesPerView={4}
  navigation={{
    prevEl: ".custom-prev",
    nextEl: ".custom-next",
  }}
  breakpoints={{
    0: { slidesPerView: 1 },
    640: { slidesPerView: 2 },
    1024: { slidesPerView: 4 },
  }}
>
        {categories.map((cat) => (
          <SwiperSlide key={cat.id_danhmuc}>
            <div className="category-item">
              <img
                src={`http://localhost:5000/danhmuc_img/${cat.HinhAnh}`}
                alt={cat.ten_danhmuc}
              />
              <div className="category-overlay">
                <span>{cat.ten_danhmuc}</span>
                <div
                  className="arrow-btn"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/new-products?category=${cat.id_danhmuc}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") navigate(`/new-products?category=${cat.id_danhmuc}`);
                  }}
                >
                  →
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default CategorySection;