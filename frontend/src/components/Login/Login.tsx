import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 👉 Demo tạm (sau này gọi API)
    if (email === "admin@gmail.com" && password === "123456") {
      localStorage.setItem(
        "user",
        JSON.stringify({ name: "Admin", role: "admin" })
      );
      navigate("/admin");
    } 
    else if (email === "user@gmail.com" && password === "123456") {
      localStorage.setItem(
        "user",
        JSON.stringify({ name: "User", role: "user" })
      );
      navigate("/");
    } 
    else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => setEmail(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <button>Login</button>
    </form>
  );
}

export default Login;