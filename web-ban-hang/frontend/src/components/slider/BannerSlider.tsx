import { useState, useEffect } from "react"
import "./slider.css"

import slide2 from "../../assets/img2/test.jpg"

import slide3 from "../../assets/img2/slide_3_img.jpg"
import slide4 from "../../assets/img2/slide_4_img.jpg"
import banner from "../../assets/img2/bannerswap1.jpg"

const images: string[] = [
  slide2,
  slide3,
  slide4,
  banner
]

const BannerSlider = () => {

  const [index, setIndex] = useState<number>(0)
  const total = images.length

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % total)
    }, 5000)

    return () => clearInterval(timer)
  }, [total])

  const prevSlide = () => {
    setIndex(prev => (prev - 1 + total) % total)
  }

  const nextSlide = () => {
    setIndex(prev => (prev + 1) % total)
  }

  return (
    <>
      <div className="warning">
        Cảnh Báo Lừa đảo
      </div>

      <section className="swiper">

        <div
          className="swiper-wrapper"
          style={{
            transform: `translateX(-${index * 100}%)`,
            display: "flex",
            transition: "0.5s"
          }}
        >

          {images.map((img, i) => (
            <div className="swiper-slide" key={i}>

              <img
                src={img}
                alt={`slide-${i}`}
                style={{ width: "100%" }}
              />

            </div>
          ))}

        </div>

        <button className="nav prev" onClick={prevSlide}>
          &#10094;
        </button>

        <button className="nav next" onClick={nextSlide}>
          &#10095;
        </button>

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
  )
}

export default BannerSlider