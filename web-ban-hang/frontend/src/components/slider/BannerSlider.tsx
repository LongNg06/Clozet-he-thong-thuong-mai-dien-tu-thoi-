
import { useEffect, useState } from "react";
import "./slider.css";

const images = [
  "https://clozet.io.vn/img2/slide_2_img.jpg",
  "https://clozet.io.vn/img2/slide_3_img.jpg",
  "https://clozet.io.vn/img2/slide_4_img.jpg",
  "https://clozet.io.vn/img2/bannerswap1.jpg"
];

const BannerSlider = () => {
  const [index, setIndex] = useState(1);
  const total = images.length;

  // auto slide 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + total) % total);
  };

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % total);
  };

  return (
    <>
      {/* WARNING */}
      <div className="warning"> Cảnh Báo Lừa đảo </div>

      {/* SLIDER */}
      <section className="swiper">
        <div
          className="swiper-wrapper"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, i) => (
            <div className="swiper-slide" key={i}>
              <img src={img} alt={`slide-${i}`} />
            </div>
            
          ))}
          
        </div>

        {/* ARROWS */}
        <button className="nav prev" onClick={prevSlide}>
          &#10094;
        </button>
        <button className="nav next" onClick={nextSlide}>
          &#10095;
        </button>

        {/* DOTS */}
        <div className="dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default BannerSlider;
