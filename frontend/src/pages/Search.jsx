import React, { useEffect, useState } from "react";
import { getProducts } from "../api";

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:3000";

export default function Search() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        if (saved && saved !== "undefined") {
            try { return JSON.parse(saved); } catch (e) { return null; }
        }
        return null;
    });

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        const query = new URLSearchParams(window.location.hash.split("?")[1]).get("q") || "";
        setSearchQuery(query);
        loadResults(query);
    }, [window.location.hash]);

    async function loadResults(q) {
        setLoading(true);
        try {
            const data = await getProducts({ search: q });
            // Artificial delay for UX
            await new Promise(r => setTimeout(r, 800));
            setItems(data || []);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="search-page">
            <div className="page-header" style={{ marginBottom: "2rem" }}>
                <h1 className="page-title">
                    Search results for  "{searchQuery}"
                </h1>
            </div>

            {loading ? (
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p className="loading-text">Searching Collection...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "5rem 2rem" }}>
                    <i className="ph ph-magnifying-glass" style={{ fontSize: "4rem", color: "var(--border-strong)", marginBottom: "1rem" }}></i>
                    <h3>Search Not Found</h3>
                    <p>Sorry, we couldn't find any products matching "{searchQuery}".</p>
                    <button className="btn-outline" style={{ marginTop: "1.5rem" }} onClick={() => window.location.hash = "#/product"}>
                        View All Products
                    </button>
                </div>
            ) : (
                <div className="product-grid">
                    {items.map((p) => (
                        <div key={p.id} className="product-card">
                            <div className="product-image-ctr" onClick={() => setSelectedProduct(p)}>
                                {p.gambar ? (
                                    <img src={p.gambar.startsWith("http") ? p.gambar : `${API_BASE}/uploads/${p.gambar}`} alt={p.nama_produk} className="product-image" />
                                ) : (
                                    <div className="product-placeholder">
                                        <i className="ph ph-image"></i>
                                    </div>
                                )}
                                <div className="product-overlay">
                                    <span>View Details</span>
                                </div>
                            </div>

                            <div className="product-info">
                                <div onClick={() => setSelectedProduct(p)} style={{ cursor: "pointer" }}>
                                    <div className="product-title" style={{ whiteSpace: "normal", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", height: "3rem", fontSize: "0.95rem" }}>
                                        <span style={{
                                            fontSize: "0.62rem",
                                            background: p.stok === 0 ? "rgba(239, 68, 68, 0.05)" : "rgba(10, 10, 10, 0.03)",
                                            color: p.stok === 0 ? "#e11d48" : "#1a1a1a",
                                            padding: "2px 8px",
                                            borderRadius: "0",
                                            fontWeight: "800",
                                            float: "right",
                                            border: `1.5px solid ${p.stok === 0 ? "#e11d48" : "#d1d5db"}`,
                                            marginTop: "2px",
                                            marginLeft: "10px",
                                            textTransform: "uppercase"
                                        }}>
                                            Stock: {p.stok}
                                        </span>
                                        {p.nama_produk}
                                    </div>
                                    <div className="product-price" style={{ fontSize: "1.1rem", margin: "0.25rem 0" }}>
                                        Rp {p.harga?.toLocaleString("id-ID") || 0}
                                    </div>
                                </div>

                                <div className="product-meta" style={{ marginTop: "auto" }}>
                                    <span style={{ fontSize: "0.75rem", fontWeight: "500", color: "var(--text-muted)" }}>{p.nama_kategori}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content" style={{ maxWidth: "650px" }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Product Detail</h4>
                            <button className="modal-close" onClick={() => setSelectedProduct(null)}>
                                <i className="ph ph-x"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "1.5rem" }}>
                                <div className="product-detail-image-wrapper" style={{ borderRadius: "var(--radius-md)", overflow: "hidden", height: "250px", background: "#f3f4f6" }}>
                                    {selectedProduct.gambar ? (
                                        <img src={selectedProduct.gambar.startsWith("http") ? selectedProduct.gambar : `${API_BASE}/uploads/${selectedProduct.gambar}`} alt={selectedProduct.nama_produk} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", color: "#cbd5e1" }}>
                                            <i className="ph ph-image"></i>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <h3 style={{ marginBottom: "0.25rem", fontSize: "1.4rem" }}>{selectedProduct.nama_produk}</h3>
                                    <div style={{ color: "var(--primary)", fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
                                        Rp {selectedProduct.harga?.toLocaleString("id-ID")}
                                    </div>

                                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                        <span className="badge badge-kasir">{selectedProduct.nama_kategori}</span>
                                        <span className={`stok-badge ${selectedProduct.stok === 0 ? 'stok-empty' : ''}`} style={{ fontSize: "0.8rem" }}>
                                            Remaining Stock: {selectedProduct.stok}
                                        </span>
                                    </div>

                                    <h5 style={{ color: "var(--text-main)", marginBottom: "0.4rem", fontSize: "0.95rem" }}>Product Description</h5>
                                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.6", margin: 0 }}>
                                        {selectedProduct.deskripsi || "No description available for this product."}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-outline" onClick={() => setSelectedProduct(null)}>Close</button>
                            {isAdmin && (
                                <button className="btn-success" onClick={() => {
                                    window.location.hash = "#/product";
                                }}>
                                    Manage in Catalog
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
