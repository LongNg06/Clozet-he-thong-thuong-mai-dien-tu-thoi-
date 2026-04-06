import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server");
    }
  };

  return (
    <div>
      <h2>Quên mật khẩu</h2>
      <input
        type="email"
        placeholder="Nhập email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit}>Gửi</button>
    </div>
  );
};

export default ForgotPassword;