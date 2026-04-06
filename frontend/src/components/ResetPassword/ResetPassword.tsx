import { useState } from "react";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Lỗi server");
    }
  };

  return (
    <div>
      <h2>Đổi mật khẩu</h2>
      <input
        type="password"
        placeholder="Mật khẩu mới"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>Đổi</button>
    </div>
  );
};

export default ResetPassword;