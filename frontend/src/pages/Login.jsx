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
    <div>
      <h2>Login</h2>
      <p>
        Welcome back! Please sign in to continue.
      </p>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, passwordRef)}
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label>Password</label>
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
          <div>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div>
          <div></div>
          <span>OR</span>
          <div></div>
        </div>

        <button
          type="button"
          onClick={() => setShowRegister(true)}
        >
          Create an Account
        </button>
      </form>
    </div>
  );
}
