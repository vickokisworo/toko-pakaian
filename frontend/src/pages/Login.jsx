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
    e?.preventDefault(); // Optional chaining in case triggered manually without event
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
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, passwordRef)}
            placeholder="Masukkan email"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, null)}
            placeholder="Masukkan password"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              boxSizing: "border-box",
            }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          >
            {loading ? "Sedang Login..." : "Login"}
          </button>
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            style={{
              width: "100%",
              padding: 10,
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Belum punya akun? Daftar di sini
          </button>
        </div>
      </form>
    </div>
  );
}
