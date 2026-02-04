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
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Daftar Akun Baru</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: 12 }}>
          <label>Nama Lengkap</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, emailRef)}
            placeholder="Masukkan nama lengkap"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            ref={emailRef}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            name="password"
            value={formData.password}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
            placeholder="Minimal 6 karakter"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Konfirmasi Password</label>
          <input
            ref={confirmPasswordRef}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, null)}
            placeholder="Ulangi password"
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              boxSizing: "border-box",
            }}
          />
        </div>



        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        {success && (
          <div style={{ color: "green", marginBottom: 12 }}>{success}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          >
            {loading ? "Sedang Mendaftar..." : "Daftar"}
          </button>
          <button
            type="button"
            onClick={onBackToLogin}
            style={{ width: "100%", padding: 10, backgroundColor: "#ccc" }}
          >
            Kembali ke Login
          </button>
        </div>
      </form>
    </div>
  );
}
