import { useEffect, useState } from "react";
import "./newProduct.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number;
  gia_khuyen_mai: number;
  anh: string;
}

const NewProduct = () => {

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {

    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => {

        const formatted = data.map((p: Product) => ({
          ...p,
          anh: `http://localhost:5000${p.anh}`
        }));

        setProducts(formatted);

      })
      .catch((err) => console.log(err));

  }, []);

  return (
    <div className="shop-page">

      {/* SIDEBAR */}

      <aside className="filter-sidebar">

        <div className="breadcrumb">
          Trang chủ / <span>Sản phẩm mới</span>
        </div>

        <h2 className="filter-title">Bộ lọc</h2>

        <div className="filter-group">
          <h4>Danh mục sản phẩm</h4>

          <ul className="category-list">
            <li>Sản phẩm mới</li>
            <li>Danh mục sale</li>
            <li>Áo nam</li>
            <li>Quần nam</li>
            <li>Phụ kiện</li>
            <li>Hệ thống cửa hàng</li>
          </ul>
        </div>

        <div className="filter-group">
          <h4>Khoảng giá</h4>

          <input type="range" className="price-slider" />

          <div className="price-label">
            <span>0đ</span>
            <span>3,000,000đ</span>
          </div>
        </div>

        <div className="filter-group">
          <h4>Màu sắc</h4>

          <div className="color-list">
            <span className="color black"></span>
            <span className="color white"></span>
            <span className="color gray"></span>
            <span className="color brown"></span>
          </div>
        </div>

        <div className="filter-group">
          <h4>Size</h4>

          <div className="size-grid">
            <button>S</button>
            <button>M</button>
            <button>L</button>
            <button>XL</button>
            <button>XXL</button>

            <button>36</button>
            <button>37</button>
            <button>38</button>
            <button>39</button>
          </div>
        </div>

      </aside>

      {/* PRODUCTS */}

      <main className="product-container">

        <h2>Sản phẩm mới</h2>

        <div className="product-grid">

          {products.map((product) => {

            const hasSale =
              product.gia_khuyen_mai &&
              product.gia_khuyen_mai < product.gia_goc;

            const percent = hasSale
              ? Math.round(
                  ((product.gia_goc - product.gia_khuyen_mai) /
                    product.gia_goc) *
                    100
                )
              : 0;

            const finalPrice = hasSale
              ? product.gia_khuyen_mai
              : product.gia_goc;

            return (

              <div
                className="product-card"
                key={product.id_sanpham}
              >

                <div className="product-img">

                  {hasSale && (
                    <span className="sale-badge">
                      -{percent}%
                    </span>
                  )}

                  <img src={product.anh} />

                </div>

                <h4>{product.ten_sanpham}</h4>

                <div className="price">

                  <span className="new-price">
                    {finalPrice.toLocaleString()}đ
                  </span>

                  {hasSale && (
                    <span className="old-price">
                      {product.gia_goc.toLocaleString()}đ
                    </span>
                  )}

                </div>

              </div>

            );
          })}

        </div>

        <div className="pagination">
          <button>1</button>
          <button>2</button>
          <button>3</button>
        </div>

      </main>

    </div>
  );
};

export default NewProduct;