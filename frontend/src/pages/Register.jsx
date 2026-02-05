import React, { useState } from "react";
import { register as apiRegister } from "../api";

export default function Register({ onRegistered, onBackToLogin }) {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs for focus chaining
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const confirmPasswordRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.nama.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email tidak boleh kosong");
      return;
    }
    if (!formData.password) {
      setError("Password tidak boleh kosong");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await apiRegister({
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
      });
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => {
        onRegistered?.();
        onBackToLogin?.();
      }, 1500);
    } catch (err) {
      setError(err.message || "Registrasi gagal");
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
        handleRegister();
      }
    }
  };

  return (
    <div className="card" style={{ maxWidth: 450, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", color: "var(--primary-dark)", marginBottom: "var(--spacing-lg)" }}>Create Account</h2>

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: "var(--spacing-md)" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Full Name</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, emailRef)}
            placeholder="John Doe"
          />
        </div>

        <div style={{ marginBottom: "var(--spacing-md)" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Email Address</label>
          <input
            ref={emailRef}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, passwordRef)}
            placeholder="example@email.com"
          />
        </div>

        <div style={{ display: "flex", gap: "var(--spacing-md)", marginBottom: "var(--spacing-md)" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Password</label>
            <input
              ref={passwordRef}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
              placeholder="Min. 6 chars"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Confirm Password</label>
            <input
              ref={confirmPasswordRef}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, null)}
              placeholder="Repeat password"
            />
          </div>
        </div>

        {error && (
          <div style={{
            color: "var(--danger)",
            backgroundColor: "#fee2e2",
            padding: "8px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--spacing-md)",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            color: "var(--success)",
            backgroundColor: "#dcfce7",
            padding: "8px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--spacing-md)",
            textAlign: "center"
          }}>
            {success}
          </div>
        )}

        <div style={{ marginTop: "var(--spacing-lg)", display: "flex", flexDirection: "column", gap: "10px" }}>
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
            {loading ? "Creating Account..." : "Register"}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "transparent",
              color: "var(--secondary)",
              border: "none",
              textDecoration: "underline"
            }}
          >
            Already have an account? Login
          </button>
        </div>
      </form>
    </div>
  );
}
