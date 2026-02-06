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
      setError("Email dan password harus diisi");
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
      setError(err.message || "Login gagal");
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
    <div className="card" style={{ maxWidth: 400, margin: "0 auto", textAlign: "center", padding: window.innerWidth <= 480 ? "16px" : "24px" }}>
      <h2 style={{ color: "var(--primary-dark)", marginBottom: "var(--spacing-md)" }}>Login</h2>
      <p style={{ color: "var(--secondary)", marginBottom: "var(--spacing-lg)", fontSize: "0.9rem" }}>
        Welcome back! Please sign in to continue.
      </p>

      <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
        <div style={{ marginBottom: "var(--spacing-md)" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, passwordRef)}
            placeholder="example@email.com"
          />
        </div>

        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Password</label>
          <input
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, null)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{
            color: "var(--danger)",
            backgroundColor: "#fee2e2",
            padding: "8px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--spacing-md)",
            fontSize: "0.9rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              fontSize: "1rem"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}></div>
            <span style={{ padding: "0 10px", color: "var(--secondary)", fontSize: "0.8rem" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}></div>
          </div>

          <button
            type="button"
            onClick={() => setShowRegister(true)}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "transparent",
              color: "var(--primary)",
              border: "1px solid var(--primary)",
            }}
          >
            Create an Account
          </button>
        </div>
      </form>
    </div>
  );
}
