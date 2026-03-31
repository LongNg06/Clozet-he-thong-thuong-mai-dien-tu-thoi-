import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  localStorage.setItem("user", JSON.stringify(data.user));

  if (data.user.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/");
  }
};

  return (
    <div className="login">
  <form onSubmit={handleSubmit}>
    <h2>Đăng nhập</h2>

    <input
      type="email"
      placeholder="Email"
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Mật khẩu"
      onChange={(e) => setPassword(e.target.value)}
    />

    <button type="submit">Đăng nhập</button>

    <div className="extra">
      <p>
        <a href="#">Quên mật khẩu?</a>
      </p>
      <p>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  </form>
</div>
  );
}

export default Login;