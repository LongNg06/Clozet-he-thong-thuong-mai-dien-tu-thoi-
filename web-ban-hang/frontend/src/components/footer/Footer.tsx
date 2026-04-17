import "./Footer.css";

const Footer = () => {
  return (
    <>
      {/* ================= TOP POLICY ================= */}
            <div className="footer-policy">
        <div className="policy-item">
          <img src="/img2/shipping.png" alt="Miễn phí vận chuyển" />
          <div>
            <h4>Miễn phí vận chuyển</h4>
            <p>Áp dụng cho mọi đơn hàng từ 500k</p>
          </div>
        </div>

        <div className="policy-item">
          <img src="/img2/stroge.png" alt="Đổi hàng dễ dàng" />
          <div>
            <h4>Đổi hàng dễ dàng</h4>
            <p>7 ngày đổi hàng vì bất kì lý do gì</p>
          </div>
        </div>

        <div className="policy-item">
          <img src="/img2/cskh.png" alt="Hỗ trợ nhanh chóng" />
          <div>
            <h4>Hỗ trợ nhanh chóng</h4>
            <p>HOTLINE 24/7 : 0964942121</p>
          </div>
        </div>

        <div className="policy-item">
          <img src="/img2/payment.png" alt="Thanh toán đa dạng" />
          <div>
            <h4>Thanh toán đa dạng</h4>
            <p>COD, Napas, Visa, Chuyển khoản</p>
          </div>
        </div>
      </div>

      {/* ================= MAIN FOOTER ================= */}
              <footer className="footer">
        <div className="footer-main">
          {/* COL 1 */}
          <div className="footer-col">
            <h3 className="footer-title">Thời trang nam TORANO</h3>
            <p>
              Hệ thống thời trang cho phái mạnh hàng đầu Việt Nam,
              hướng tới phong cách nam tính, lịch lãm và trẻ trung.
            </p>

            <div className="social">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="Tiktok">
                <i className="fab fa-tiktok"></i>
              </a>
              <a href="#" aria-label="Youtube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>

            <h4>Phương thức thanh toán</h4>
            <div className="payment">
              <img src="src/components/img2/vnpay.png" alt="VNPay" />
              <img src="src/components/img2/zalo.png" alt="ZaloPay" />
              <img src="src/components/img2/moca.png" alt="Moca" />
              <img src="src/components/img2/napas.png" alt="Napas" />
              <img src="src/components/img2/visa.png" alt="Visa" />
            </div>
          </div>

          {/* COL 2 */}
          <div className="footer-col">
            <h3 className="footer-title">Thông tin liên hệ</h3>
            <p><b>Địa chỉ:</b> Tầng 8, Tòa nhà 311-313 Trường Chinh, Hà Nội</p>
            <p><b>Điện thoại:</b> 0964942121</p>
            <p><b>Fax:</b> 0904636356</p>
            <p><b>Email:</b> cskh@torano.vn</p>
          </div>

          {/* COL 3 */}
          <div className="footer-col">
            <h3 className="footer-title">Nhóm liên kết</h3>
            <ul>
              <li><a href="#">Tìm kiếm</a></li>
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Tuyển dụng</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </div>

          {/* COL 4 */}
          <div className="footer-col">
            <h3 className="footer-title">Đăng ký nhận tin</h3>
            <p>
              Để cập nhật những sản phẩm mới,
              nhận thông tin ưu đãi đặc biệt.
            </p>

            <form className="newsletter">
              <input type="email" placeholder="Nhập email của bạn" />
              <button type="submit">ĐĂNG KÝ</button>
            </form>

            <img
              className="bo-cong-thuong"
              src="src/components/img2/dathongbao.png"
              alt="Đã thông báo Bộ Công Thương"
            />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
