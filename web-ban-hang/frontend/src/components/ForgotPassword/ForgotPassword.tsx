import { useState } from "react";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  // step: 1 = enter email, 2 = enter code + new password, 3 = success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Step 1: gửi mã xác nhận đến email
  const handleSendCode = async () => {
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
      setMessage(data.message || "Mã xác nhận đã được gửi");
      setStep(2);
    } catch {
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: xác nhận mã + đặt mật khẩu mới
  const handleVerifyCode = async () => {
    if (!code) { setError("Vui lòng nhập mã xác nhận"); return; }
    if (!newPassword) { setError("Vui lòng nhập mật khẩu mới"); return; }
    if (newPassword.length < 6) { setError("Mật khẩu phải có ít nhất 6 ký tự"); return; }
    if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp"); return; }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Có lỗi xảy ra");
        return;
      }
      setStep(3);
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

        {/* STEP 1: Nhập email */}
        {step === 1 && (
          <>
            <p className="forgot-desc">Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận về email</p>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
            />
            {error && <p className="forgot-error">{error}</p>}
            <button onClick={handleSendCode} disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </button>
            <p>
              Quay lại <a href="/login">Đăng nhập</a>
            </p>
          </>
        )}

        {/* STEP 2: Nhập mã + mật khẩu mới */}
        {step === 2 && (
          <>
            <p className="forgot-desc forgot-success-msg">{message}</p>
            <p className="forgot-desc">Kiểm tra hộp thư <strong>{email}</strong> và nhập mã xác nhận</p>
            <input
              type="text"
              placeholder="Nhập mã xác nhận (6 ký tự)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="code-input"
            />
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
            />
            {error && <p className="forgot-error">{error}</p>}
            <button onClick={handleVerifyCode} disabled={loading}>
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
            <p className="resend-link">
              Không nhận được mã? <a href="#" onClick={(e) => { e.preventDefault(); setError(""); handleSendCode(); }}>Gửi lại</a>
            </p>
            <p>
              Quay lại <a href="/login">Đăng nhập</a>
            </p>
          </>
        )}

        {/* STEP 3: Thành công */}
        {step === 3 && (
          <div className="forgot-success">
            <div className="success-icon">✅</div>
            <p>Đổi mật khẩu thành công!</p>
            <p className="forgot-note">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
            <a href="/login" className="back-login-btn">Đăng nhập ngay</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;