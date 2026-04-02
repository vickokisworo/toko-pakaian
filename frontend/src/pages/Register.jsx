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
                if (onRegistered) onRegistered();
                if (onBackToLogin) onBackToLogin();
            }, 2000);
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card glass-panel" style={{ textAlign: "center" }}>
                    <i className="ph-fill ph-check-circle" style={{ fontSize: "4rem", color: "var(--secondary)", marginBottom: "1rem" }}></i>
                    <h2 style={{ color: "var(--secondary)", marginBottom: "0.5rem" }}>Registration Successful!</h2>
                    <p>Your account has been created.</p>
                    <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        <i className="ph ph-spinner-gap" style={{ animation: "spin 1s linear infinite", marginRight: "5px" }}></i>
                        Redirecting to login page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <div className="header-logo" style={{ marginBottom: "0.5rem" }}>STYLA</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Sign Up</label>
                        <div style={{ position: "relative" }}>
                            <i className="ph ph-user" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "1.1rem" }}></i>
                            <input
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                required
                                placeholder="Full Name"
                                style={{ paddingLeft: "36px", borderRadius: "8px" }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div style={{ position: "relative" }}>
                            <i className="ph ph-envelope" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "1.1rem" }}></i>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Email Address"
                                style={{ paddingLeft: "36px", borderRadius: "8px" }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: "2rem" }}>
                        <div style={{ position: "relative" }}>
                            <i className="ph ph-lock-key" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "1.1rem" }}></i>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Password"
                                style={{ paddingLeft: "36px", borderRadius: "8px" }}
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
                        style={{ width: "100%", padding: "0.8rem", fontSize: "1rem", borderRadius: "8px" }}
                    >
                        {loading ? (
                            <><i className="ph ph-spinner-gap" style={{ animation: "spin 1s linear infinite" }}></i> Registering...</>
                        ) : (
                            <><i className="ph-bold ph-paper-plane-right"></i> Sign Up</>
                        )}
                    </button>

                    <div className="auth-divider">Already have an account?</div>

                    <button
                        type="button"
                        className="btn-outline"
                        onClick={onBackToLogin}
                        style={{ width: "100%", padding: "0.8rem", fontSize: "1rem", borderRadius: "8px" }}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
