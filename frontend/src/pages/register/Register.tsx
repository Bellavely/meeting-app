import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services";
import "./Register.css";
import { UserPlus } from "lucide-react";

export const Register: React.FC = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const { confirmPassword, ...registerData } = form;
      await api.post("/auth/register", registerData);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <div className="register-title ">
          <div className="icon-wrapper">
            <UserPlus color="white" size={24} />
          </div>
          <h1>Create Account</h1>
          <p className="subtitle">Join us to start scheduling</p>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="name-fields">
            <input
              type="text"
              placeholder="First"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Last"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-primary">
            Get Started
          </button>
          <p className="login-prompt">
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
