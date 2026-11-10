import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Wallet } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("Login will be connected to your Django backend in the next integration step.");
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-logo">
          <Wallet size={23} />
        </div>
        <span>MoneyLeak</span>
      </div>

      <div className="login-card">
        <div className="login-icon">
          <ShieldCheck size={25} />
        </div>

        <h1>Welcome back</h1>
        <p className="login-subtitle">
          Sign in to manage your money with clarity.
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>

        <p className="login-footer">
          Your financial information deserves a secure home.
        </p>
      </div>

      <p className="login-copyright">
        © 2026 MoneyLeak. All rights reserved.
      </p>
    </div>
  );
}