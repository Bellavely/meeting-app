import { FormEvent, FC, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/api";

export const Login: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data.accessToken, response.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <div className="card-header">
          <div className="login-icon">
            <LogIn color="white" size={24} />
          </div>
          <h1>Welcome Back</h1>
          <p className="text-muted">Login to manage your meetings</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-error">{error}</p>}
          <button type="submit" className="btn-primary">
            Sign In
          </button>
          <p className="text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="register-link">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
