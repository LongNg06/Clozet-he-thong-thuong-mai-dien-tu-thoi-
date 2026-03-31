import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";

interface Product {
  id_sanpham: number;
  ten_sanpham: string;
  gia_goc: number;
  gia_khuyen_mai?: number;
  trang_thai: boolean;
  ten_thuonghieu: string;
  anh?: string;
  anh_bienthe?: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState<number>(1);

  const [mainImg, setMainImg] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`)
      .then(res => res.json())
      .then((data: Product[] | Product) => {
        if (Array.isArray(data) && data.length > 0) {
          const base = data[0];
          setProduct(base);

          const imgs: string[] = [];
          if (base.anh) {
            const url = base.anh.startsWith("http")
              ? base.anh
              : `http://localhost:5000${base.anh}`;
            imgs.push(url);
          }
          data.forEach((r: Product) => {
            if (r.anh_bienthe) {
              const url = r.anh_bienthe.startsWith("http")
                ? r.anh_bienthe
                : `http://localhost:5000${r.anh_bienthe}`;
              if (!imgs.includes(url)) imgs.push(url);
            }
          });

          setGallery(imgs);
          setMainImg(imgs[0] || "");
        } else {
          const p = data as Product;
          setProduct(p);
          const img = p?.anh
            ? (p.anh.startsWith("http") ? p.anh : `http://localhost:5000${p.anh}`)
            : "";
          setGallery(img ? [img] : []);
          setMainImg(img);
        }
      });
  }, [id]);

  if (!product) return <h2>Loading...</h2>;

  // ===== PRICE =====
  const giaGoc = Number(product.gia_goc);
  const giaKM = product.gia_khuyen_mai ? Number(product.gia_khuyen_mai) : null;
  const finalPrice = giaKM ?? giaGoc;
  const hasDiscount = !!giaKM && giaKM < giaGoc;
  const salePercent = hasDiscount ? Math.round(((giaGoc - giaKM) / giaGoc) * 100) : 0;

  return (
    <div className="product-detail">
      {/* LEFT IMAGE */}
      <div className="product-image">
        <img src={mainImg} alt={product.ten_sanpham} className="main-image" />

        <div className="thumb-list">
          {gallery.length > 0 ? (
            gallery.map((g, idx) => (
              <div
                key={idx}
                className={`thumb ${g === mainImg ? "active" : ""}`}
                onClick={() => setMainImg(g)}
              >
                <img
                  src={g}
                  alt={`thumb-${idx}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))
          ) : (
            <div className="thumb-empty">Không có ảnh biến thể</div>
          )}
        </div>
      </div>

      {/* RIGHT INFO */}
      <div className="product-info">
        <h1>{product.ten_sanpham}</h1>

        <div className="product-meta">
          Mã sản phẩm: <b>SP{id}</b> | Tình trạng:
          {product.trang_thai ? " Còn hàng" : " Hết hàng"} | Thương hiệu:
          <b> {product.ten_thuonghieu}</b>
        </div>

        {/* PRICE */}
        <div className="price-box">
          <span className="price-new">{finalPrice.toLocaleString("vi-VN")}đ</span>
          {hasDiscount && (
            <span className="price-old">{giaGoc.toLocaleString("vi-VN")}đ</span>
          )}
          {hasDiscount && <span className="sale">-{salePercent}%</span>}
        </div>

        {/* QUANTITY */}
        <div className="quantity">
          <p>Số lượng:</p>
          <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)}>-</button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)}>+</button>
        </div>

        {/* BUTTONS */}
        <div className="product-buttons">
          <button
            className="add-cart"
            onClick={async () => {
              try {
                await fetch("http://localhost:5000/cart/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id_sanpham: product.id_sanpham,
                    quantity: qty,
                  }),
                });
                alert("Đã thêm vào giỏ hàng");
              } catch (e) {
                console.error(e);
                alert("Lỗi thêm giỏ hàng");
              }
            }}
          >
            THÊM VÀO GIỎ
          </button>

          <button
            className="buy-now"
            onClick={async () => {
              try {
                await fetch("http://localhost:5000/cart/add", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id_sanpham: product.id_sanpham,
                    quantity: qty,
                  }),
                });
                navigate("/checkout");
                setTimeout(() => window.scrollTo(0, 0), 0);
              } catch (e) {
                console.error(e);
                alert("Lỗi mua ngay");
              }
            }}
          >
            MUA NGAY
          </button>
        </div>


        
{/* POLICY HIGHLIGHTS */}
<div className="product-policies">
  <div className="policy-item">
    <div className="icon">🚚</div>
    <div className="policy-text-short">
      <div className="policy-title">Miễn phí giao hàng</div>
      <div className="policy-sub">cho đơn hàng từ <b>500K</b></div>
    </div>
  </div>

  <div className="policy-item">
    <div className="icon">✅</div>
    <div className="policy-text-short">
      <div className="policy-title">Phân phối chính hãng</div>
      <div className="policy-sub">Hàng phân phối chính hãng 100%</div>
    </div>
  </div>

  <div className="policy-item">
    <div className="icon">📞</div>
    <div className="policy-text-short">
      <div className="policy-title">TỔNG ĐÀI 24/7</div>
      <div className="policy-sub">0964942121</div>
    </div>
  </div>

  <div className="policy-item">
    <div className="icon">🔄</div>
    <div className="policy-text-short">
      <div className="policy-title">Đổi sản phẩm dễ dàng</div>
      <div className="policy-sub">Trong 7 ngày khi còn nguyên tem mác</div>
    </div>
  </div>

  <div className="policy-item">
    <div className="icon">📦</div>
    <div className="policy-text-short">
      <div className="policy-title">Kiểm tra & COD</div>
      <div className="policy-sub">Kiểm tra, thanh toán khi nhận hàng (COD)</div>
    </div>
  </div>

  <div className="policy-item">
    <div className="icon">🛠️</div>
    <div className="policy-text-short">
      <div className="policy-title">Hỗ trợ bảo hành</div>
      <div className="policy-sub">Đổi sản phẩm tại tất cả store TORANO</div>
    </div>
  </div>

</div>

{/* FULL POLICY / TERMS (CHÍNH SÁCH) */}
<div className="policy-full">
  <h3>CHÍNH SÁCH ÁP DỤNG</h3>
  <div className="policy-text">
    <p>Áp dụng từ ngày 01/09/2018.</p>
    <p>Trong vòng 30 ngày kể từ ngày mua sản phẩm với các sản phẩm TORANO. Áp dụng đối với sản phẩm nguyên giá và sản phẩm giảm giá ít hơn 50%.</p>
    <p>Sản phẩm nguyên giá chỉ được đổi 01 lần duy nhất sang sản phẩm nguyên giá khác và không thấp hơn giá trị sản phẩm đã mua.</p>
    <p>Sản phẩm giảm giá/khuyến mại ít hơn 50% được đổi 01 lần sang màu khác hoặc size khác trên cùng 1 mã trong điều kiện còn sản phẩm hoặc theo quy chế chương trình (nếu có). Nếu sản phẩm đổi đã hết hàng khi đó KH sẽ được đổi sang sản phẩm khác có giá trị ngang bằng hoặc cao hơn. Khách hàng sẽ thanh toán phần tiền chênh lệch nếu sản phẩm đổi có giá trị cao hơn sản phẩm đã mua.</p>
    <p>Chính sách chỉ áp dụng khi sản phẩm còn hóa đơn mua hàng, còn nguyên nhãn mác, thẻ bài đính kèm sản phẩm và sản phẩm không bị dơ bẩn, hư hỏng bởi những tác nhân bên ngoài cửa hàng sau khi mua sản phẩm.</p>
    <p>Sản phẩm đồ lót và phụ kiện không được đổi trả.</p>

    <h4>2. ĐIỀU KIỆN ĐỔI SẢN PHẨM</h4>
    <p>Đổi hàng trong vòng 07 ngày kể từ ngày khách hàng nhận được sản phẩm. Sản phẩm còn nguyên tem, mác và chưa qua sử dụng.</p>

    <h4>3. THỰC HIỆN ĐỔI SẢN PHẨM</h4>
    <p>Quý khách có thể đổi hàng Online tại hệ thống cửa hàng và đại lý TORANO trên toàn quốc. Lưu ý: vui lòng mang theo sản phẩm và phiếu giao hàng.</p>
    <p>Nếu tại khu vực bạn không có cửa hàng TORANO hoặc sản phẩm bạn muốn đổi thì vui lòng gọi Tổng đài 0964942121 để được hướng dẫn các bước đổi sản phẩm.</p>

    <h4>BẢO MẬT THÔNG TIN KHÁCH HÀNG</h4>
    <p>TORANO chỉ thu thập các loại thông tin cơ bản liên quan đến đơn đặt hàng nhằm mục đích xử lý đơn hàng, nâng cao chất lượng dịch vụ và chăm sóc khách hàng. TORANO cam kết bảo mật thông tin khách hàng và sử dụng đúng mục đích.</p>
  </div>
</div>

</div>

</div>

  )
}