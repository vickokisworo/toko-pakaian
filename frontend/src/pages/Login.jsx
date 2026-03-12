import React, { useState } from "react";
import { login } from "../api";
import Register from "./Register";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const passwordRef = React.useRef(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      sessionStorage.setItem("accessToken", res.accessToken);
      sessionStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.user));
      onLogin(res.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef) {
        nextRef.current.focus();
      } else {
        handleLogin();
      }
    }
  };

  if (showRegister) {
    return (
      <Register
        onRegistered={() => {
          setEmail("");
          setPassword("");
          setError("");
        }}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="header-logo" style={{ marginBottom: "0.5rem" }}>STYLA</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <div style={{ position: "relative" }}>
              <i className="ph ph-envelope" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "1.1rem" }}></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                placeholder="example@email.com"
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <i className="ph ph-lock-key" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "1.1rem" }}></i>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, null)}
                placeholder="••••••••"
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: "var(--danger)", backgroundColor: "#fee2e2", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="ph-fill ph-warning-circle"></i> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.8rem", fontSize: "1rem", marginTop: "0.5rem" }}
          >
            {loading ? (
              <><i className="ph ph-spinner-gap" style={{ animation: "spin 1s linear infinite" }}></i> Signing in...</>
            ) : (
              <><i className="ph-bold ph-sign-in"></i> Sign In</>
            )}
          </button>

          <div className="auth-divider">OR</div>

          <button
            type="button"
            className="btn-outline"
            onClick={() => setShowRegister(true)}
            style={{ width: "100%", padding: "0.8rem", fontSize: "1rem" }}
          >
            Create an Account
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
