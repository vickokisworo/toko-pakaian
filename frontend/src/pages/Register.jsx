import React, { useState } from "react";
import { register } from "../api";

export default function Register({ onRegistered, onBackToLogin }) {
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => {
                onRegistered();
                onBackToLogin();
            }, 2000);
        } catch (err) {
            setError(err.message || "Registrasi gagal");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="card" style={{ maxWidth: 400, margin: "0 auto", textAlign: "center", padding: "24px" }}>
                <h2 style={{ color: "var(--success)" }}>Registrasi Berhasil!</h2>
                <p>Akun Anda telah dibuat sebagai <strong>Pelanggan</strong>.</p>
                <p>Mengalihkan ke halaman login...</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ maxWidth: 400, margin: "0 auto", textAlign: "center", padding: "24px" }}>
            <h2 style={{ color: "var(--primary-dark)", marginBottom: "var(--spacing-md)" }}>Create Account</h2>
            <p style={{ color: "var(--secondary)", marginBottom: "var(--spacing-lg)", fontSize: "0.9rem" }}>
                Join us today! Registration is free for customers.
            </p>

            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                <div style={{ marginBottom: "var(--spacing-md)" }}>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Full Name</label>
                    <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div style={{ marginBottom: "var(--spacing-md)" }}>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="example@email.com"
                    />
                </div>

                <div style={{ marginBottom: "var(--spacing-lg)" }}>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
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

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "var(--primary)",
                        color: "white",
                        border: "none",
                        fontSize: "1rem",
                        cursor: "pointer",
                        borderRadius: "var(--radius-md)",
                        marginBottom: "10px"
                    }}
                >
                    {loading ? "Registering..." : "Sign Up"}
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
                        fontSize: "0.9rem",
                        cursor: "pointer"
                    }}
                >
                    Already have an account? Back to Login
                </button>
            </form>
        </div>
    );
}
