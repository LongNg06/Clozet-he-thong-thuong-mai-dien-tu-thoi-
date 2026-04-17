import "./CanhBaoLuaDao.css";

export default function CanhBaoLuaDao() {
  return (
    <div className="luadao-page">
      {/* MAIN CONTENT */}
      <div className="luadao-main">
        <h1>CẢNH BÁO LỪA ĐẢO, GIẢ DANH SHIPPER CHIẾM ĐOẠT TÀI SẢN</h1>

        <div className="luadao-banner">
          <img src="http://localhost:5000/static/canh_bao_lua_dao_.png" alt="Cảnh báo lừa đảo" />
        </div>

        <p className="luadao-intro">
          Sau khi lấy lời khai của các đối tượng lợi dụng không gian mạng, lừa đảo chiếm đoạt tài sản xảy ra tại tỉnh Kampot – Campuchia, Ban Chuyên án nhận thấy nhiều vụ việc lừa đảo chiếm đoạt tài sản đã xảy ra với phương thức, thủ đoạn ngày càng tinh vi, đặc biệt là hình thức giả danh "Nhân viên giao hàng".
        </p>
        <p className="luadao-intro">
          Các đối tượng thường lợi dụng tâm lý nhẹ dạ tin tưởng, thói quen giao dịch trực tuyến của người dân để tiếp cận và chiếm đoạt tài sản. Dưới đây là hai kịch bản phổ biến mà người dân cần cảnh giác.
        </p>

        <h2 className="luadao-section-title">KỊCH BẢN: GIẢ DANH NHÂN VIÊN GIAO HÀNG</h2>

        <div className="luadao-banner">
          <img src="http://localhost:5000/static/luadao%202.webp" alt="Kịch bản lừa đảo 5 bước" />
        </div>

        <div className="luadao-steps">
          <div className="step">
            <h3>Bước 1: Tạo tình huống</h3>
            <p>
              Đối tượng gọi điện/ nhắn tin tự xưng là "Nhân viên giao hàng" thông báo có đơn hàng đang giao tới, đồng thời thăm dò phản ứng của khách hàng, khi bị hỏi lại, đối tượng gửi ảnh đơn hàng có tên, địa chỉ, số tiền thật để tạo niềm tin với khách hàng.
            </p>
          </div>

          <div className="step">
            <h3>Bước 2: Yêu cầu chuyển khoản thanh toán đơn hàng</h3>
            <ul>
              <li><b>Trường hợp 1:</b> Nếu đối tượng gọi điện muốn giao hàng mà nạn nhân có nhà thì đối tượng tắt máy và 1 tiếng sau gọi lại;</li>
              <li><b>Trường hợp 2:</b> Nếu nạn nhân không có nhà thì đối tượng yêu cầu nạn nhân thanh toán toàn bộ đơn hàng.</li>
            </ul>
          </div>

          <div className="step">
            <h3>Bước 3: Giả vờ thông báo bạn đã đăng ký gói hội viên</h3>
            <p>
              Ngay sau khi đã nhận tiền, đối tượng gọi lại hoặc nhắn tin và nói với nạn nhân rằng đã vô tình đăng ký gói hội viên giao hàng, nếu không hủy sẽ bị trừ tiền định kỳ hằng tháng, nhằm tạo hoảng loạn, tin rằng mình "đã bấm nhầm" để nạn nhân vội muốn hủy.
            </p>
          </div>

          <div className="step">
            <h3>Bước 4: Gửi link giả mạo để "hủy gói"</h3>
            <p>
              Đối tượng gửi đường link giả mạo giống trang web của đơn vị vận chuyển, bắt nạn nhân đăng nhập, nhập OTP hoặc liên kết tài khoản "xác minh tài chính". Mục đích là chiếm đoạt thông tin đăng nhập/OTP hoặc lôi kéo nạn nhân tự chuyển tiền vào tài khoản của chúng…
            </p>
          </div>

          <div className="step">
            <h3>Bước 5: Chiếm đoạt tiền và cắt liên lạc</h3>
            <p>
              Fanpage giả hướng dẫn chia sẻ màn hình hoặc chuyển tiền để được hoàn lại, mục đích là biết được số dư trong tài khoản ngân hàng của khách.
            </p>
            <p>Khi nạn nhân thao tác, nhóm lừa đảo đọc được thông tin ngân hàng:</p>
            <ul>
              <li><b>Trường hợp 1:</b> Trong tài khoản của nạn nhân từ một triệu đồng trở lên, đối tượng sẽ dẫn dụ chuyển tiền, rồi xóa tài khoản, chặn liên hệ, kết quả là nạn nhân mất toàn bộ tiền trong tài khoản;</li>
              <li><b>Trường hợp 2:</b> Trong tài khoản của nạn nhân có số dư dưới một triệu đồng thì đối tượng báo với khách hàng là hủy thẻ thành công nhưng thực chất không có hoạt động nào là hủy hoặc đăng ký thẻ hội viên mà đều là kịch bản được dàn dựng sẵn.</li>
            </ul>
          </div>
        </div>

        {/* CẢNH BÁO */}
        <div className="luadao-warning-box">
          <h2>⚠️ CẢNH BÁO</h2>
          <ul>
            <li><b>TUYỆT ĐỐI KHÔNG</b> chuyển khoản cho người lạ, xác minh kỹ thông tin trước khi giao dịch.</li>
            <li><b>KHÔNG</b> làm theo hướng dẫn qua điện thoại, Zalo, Facebook, fanpage giả danh đơn vị vận chuyển hay cơ quan nhà nước.</li>
            <li><b>KHÔNG</b> nhấp vào đường link lạ, <b>KHÔNG</b> cung cấp CCCD, tài khoản ngân hàng, mã OTP, mật khẩu Internet Banking, thông tin thẻ… cho bất kỳ ai hoặc website không chính chủ.</li>
            <li><b>KHÔNG</b> làm theo bất kỳ hướng dẫn bất thường nào từ người lạ và cần thông báo ngay cho lực lượng chức năng nếu phát hiện vấn đề bất thường từ nhân viên giao hàng.</li>
          </ul>
        </div>

        <p className="luadao-source">
          (Nguồn: kenh14.vn)
        </p>

        {/* LƯU Ý TORANO */}
        <div className="luadao-torano-note">
          <h3>🛡️ Quý khách hàng khi mua hàng online từ TORANO hết sức lưu ý:</h3>
          <p>
            Shipper thật sẽ chỉ liên hệ khi giao hàng đến nơi, sẽ không gọi để xin chuyển khoản trước. <b>TUYỆT ĐỐI</b> chỉ thanh toán khi đã nhận hàng hoặc đã xác nhận hàng đã giao tới nơi (để ở nơi quen thuộc, có hình ảnh hoặc xác nhận người thân đã nhận giúp).
          </p>
          <p>
            Để an toàn hơn, quý khách có thể thanh toán luôn khi đặt hàng, các chính sách đổi trả vẫn được đảm bảo bình thường.
          </p>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="luadao-sidebar">
        <h3>Danh mục page</h3>
        <ul>
          <li><a href="/new-products">Sản phẩm mới</a></li>
          <li><a href="/new-products?category=1">Áo nam</a></li>
          <li><a href="/new-products?category=6">Quần nam</a></li>
          <li><a href="/new-products?category=10">Phụ kiện</a></li>
          <li><a href="/canh-bao-lua-dao" className="active">Cảnh báo lừa đảo</a></li>
        </ul>
      </aside>
    </div>
  );
}
