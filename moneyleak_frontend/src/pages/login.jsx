import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Wallet,
  ArrowLeft
} from "lucide-react";
import api from "../services/api";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetMessages();
    setPassword("");
    setOtp("");
    setNewPassword("");
    setOtpSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (isRegister) {
        await api.post("/api/auth/register/", {
          username,
          email,
          phone,
          password,
        });

        setSuccess("Account created successfully. You can now sign in.");
        switchMode("login");
        setUsername("");
        setEmail("");
        setPhone("");
        setPassword("");
      }

      else if (isForgot && !otpSent) {
        await api.post("/api/auth/password-reset/request/", {
          phone_number: phone,
        });

        setOtpSent(true);
        setSuccess("If your number is registered, a verification code will be sent.");
      }

      else if (isForgot && otpSent) {
        await api.post("/api/auth/password-reset/confirm/", {
          phone_number: phone,
          otp,
          new_password: newPassword,
        });

        setSuccess("Password reset successfully. You can now sign in.");
        switchMode("login");
        setPhone("");
      }

      else {
        const response = await api.post("/api/auth/login/", {
          email,
          password,
        });

        localStorage.setItem(
          "moneyleak_access",
          response.data.access
        );

        localStorage.setItem(
          "moneyleak_refresh",
          response.data.refresh
        );

        navigate("/dashboard");
      }
    }

    catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(" ")
              : typeof value === "object"
                ? JSON.stringify(value)
                : String(value);

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(messages || "Something went wrong.");
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    }

    finally {
      setLoading(false);
    }
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

        <h1>
          {isRegister
            ? "Create your account"
            : isForgot
              ? "Reset your password"
              : "Welcome back"}
        </h1>

        <p className="login-subtitle">
          {isRegister
            ? "Start managing your money with clarity."
            : isForgot
              ? "Verify your phone number to reset your password."
              : "Sign in to manage your money with clarity."}
        </p>

        <form onSubmit={handleSubmit} className="login-form">

          {isRegister && (
            <>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </>
          )}

          {(!isForgot || !otpSent) && (
            <>
              {true && (
                <>
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+254712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </>
              )}

              {!isForgot && (
                <>
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </>
              )}

              {isForgot && (
                <>
                  <label htmlFor="reset-phone">Registered phone number</label>
                  <input
                    id="reset-phone"
                    type="tel"
                    placeholder="+254712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </>
              )}
            </>
          )}

          {isForgot && otpSent && (
            <>
              <label htmlFor="otp">Verification code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </>
          )}

          {!isForgot && (
            <>
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
                  {showPassword
                    ? <EyeOff size={17} />
                    : <Eye size={17} />}
                </button>
              </div>
            </>
          )}

          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success">{success}</p>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : isForgot
                  ? otpSent
                    ? "Reset password"
                    : "Send verification code"
                  : "Sign in"}
          </button>
        </form>

        {!isRegister && !isForgot && (
          <div className="auth-switch">
            <button
              type="button"
              onClick={() => switchMode("forgot")}
            >
              Forgot password?
            </button>
          </div>
        )}

        <div className="auth-switch">
          {isForgot ? (
            <button
              type="button"
              onClick={() => switchMode("login")}
            >
              <ArrowLeft size={14} /> Back to login
            </button>
          ) : (
            <>
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}

              <button
                type="button"
                onClick={() => switchMode(isRegister ? "login" : "register")}
              >
                {isRegister ? "Login" : "Register"}
              </button>
            </>
          )}
        </div>

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