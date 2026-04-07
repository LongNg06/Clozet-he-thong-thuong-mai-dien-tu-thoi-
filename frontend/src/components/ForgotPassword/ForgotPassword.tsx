import { useState } from "react";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) {
      alert("Vui lòng nhập email");
      return;
    }

    alert("Chức năng đang phát triển 🚧");
  };

  return (
    <div className="forgot-container">
      <div className="bg-fashion"></div>

      <div className="forgot-form">
        <h2>Quên mật khẩu</h2>

        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSubmit}>Gửi</button>

        <p>
          Quay lại <a href="/login">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;