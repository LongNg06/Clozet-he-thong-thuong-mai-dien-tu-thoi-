import { useState } from "react";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Có lỗi xảy ra");
        return;
      }
      setNewPassword(data.newPassword);
      setUserName(data.ho_ten || "");
    } catch {
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="bg-fashion"></div>

      <div className="forgot-form">
        <h2>Quên mật khẩu</h2>

        {!newPassword ? (
          <>
            <p className="forgot-desc">Nhập email đã đăng ký để lấy lại mật khẩu</p>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {error && <p className="forgot-error">{error}</p>}
            <button onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang xử lý..." : "Lấy lại mật khẩu"}
            </button>
          </>
        ) : (
          <div className="forgot-success">
            <div className="success-icon">✅</div>
            <p>Xin chào <strong>{userName}</strong>, mật khẩu mới của bạn là:</p>
            <div className="new-password-box">{newPassword}</div>
            <p className="forgot-note">Vui lòng đăng nhập và đổi mật khẩu ngay sau khi vào tài khoản.</p>
            <a href="/login" className="back-login-btn">Đăng nhập ngay</a>
          </div>
        )}

        {!newPassword && (
          <p>
            Quay lại <a href="/login">Đăng nhập</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;