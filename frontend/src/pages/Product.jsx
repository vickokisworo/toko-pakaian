import React, { useEffect, useState, useCallback } from "react";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getWishlist,
    addWishlist,
    removeWishlist,
} from "../api";

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:3000";

export default function Products() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        if (saved && saved !== "undefined") {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nama_produk: "",
        harga: "",
        stok: "",
        kategori_id: "",
        deskripsi: "",
    });
    const [file, setFile] = useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Wishlist state
    const [wishlistProductIds, setWishlistProductIds] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const isAdmin = user?.role === "admin";
    const isPelanggan = user?.role === "pelanggan";

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [selectedCategory]);

    useEffect(() => {
        if (isPelanggan) {
            loadWishlist();
        }
    }, [isPelanggan]);

    async function loadProducts() {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory !== "all") {
                params.kategori = selectedCategory;
            }
            const data = await getProducts(params);
            // Artificial delay to show loading state
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setItems(data || []);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadCategories() {
        try {
            const data = await getCategories();
            setCategories(data || []);
        } catch (e) {
            console.error("Error loading categories:", e);
        }
    }

    async function loadWishlist() {
        try {
            const data = await getWishlist();
            const wishlists = data?.wishlists || [];
            setWishlistProductIds(wishlists.map(f => f.id));
        } catch (e) {
            // silently fail — column may not exist yet
            console.warn("Could not load wishlist:", e.message);
        }
    }

    const handleToggleWishlist = async (e, productId) => {
        e.stopPropagation();
        if (wishlistLoading) return;
        setWishlistLoading(true);
        try {
            const isWishlisted = wishlistProductIds.includes(productId);
            if (isWishlisted) {
                await removeWishlist(productId);
                setWishlistProductIds(prev => prev.filter(id => id !== productId));
                setToastMessage("Berhasil dihapus dari Wishlist");
                setToastVisible(true);
            } else {
                await addWishlist(productId);
                setWishlistProductIds(prev => [...prev, productId]);
                setToastMessage("Berhasil ditambahkan ke Wishlist");
                setToastVisible(true);
            }
            setTimeout(() => {
                setToastVisible(false);
            }, 4000);
        } catch (e) {
            setError(e.message);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("nama_produk", formData.nama_produk);
            data.append("harga", formData.harga);
            data.append("stok", formData.stok);
            data.append("kategori_id", formData.kategori_id);
            data.append("deskripsi", formData.deskripsi);
            if (file) data.append("gambar", file);

            if (editingId) {
                await updateProduct(editingId, data);
            } else {
                await createProduct(data);
            }
            setFormData({ nama_produk: "", harga: "", stok: "", kategori_id: "", deskripsi: "" });
            setFile(null);
            setEditingId(null);
            setShowForm(false);
            loadProducts();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            nama_produk: product.nama_produk,
            harga: product.harga,
            stok: product.stok,
            kategori_id: product.kategori_id,
            deskripsi: product.deskripsi || "",
        });
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this product?")) {
            try {
                await deleteProduct(id);
                loadProducts();
            } catch (e) {
                setError(e.message);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <div className="page-header">
                {isAdmin && (
                    <button
                        className="btn-success"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData({ nama_produk: "", harga: "", stok: "", kategori_id: "", deskripsi: "" });
                        }}
                    >
                        <i className="ph ph-plus"></i> Add Product
                    </button>
                )}
            </div>

            {error && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</div>}

            {
                showForm && (
                    <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
                        <div className="modal-content" style={{ maxWidth: "550px" }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4>{editingId ? "Edit Product" : "Add New Product"}</h4>
                                <button className="modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                    <i className="ph ph-x"></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="input-group">
                                        <label>Product Name</label>
                                        <input
                                            type="text"
                                            name="nama_produk"
                                            placeholder="Enter product name..."
                                            value={formData.nama_produk}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div className="input-group">
                                            <label>Price (Rp)</label>
                                            <input
                                                type="number"
                                                name="harga"
                                                placeholder="Example: 50000"
                                                value={formData.harga}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Stock</label>
                                            <input
                                                type="number"
                                                name="stok"
                                                placeholder="0"
                                                value={formData.stok}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>Category</label>
                                        <select
                                            name="kategori_id"
                                            value={formData.kategori_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.nama_kategori}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label>Description</label>
                                        <textarea
                                            name="deskripsi"
                                            placeholder="Write product description here..."
                                            value={formData.deskripsi}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Product Image</label>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setFile(e.target.files[0])}
                                                style={{ padding: "0.4rem" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-success">
                                        {editingId ? "Save Changes" : "Add Product"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <div className="product-main-layout">
                <div className="category-bar-container">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                            <nav className="category-nav">
                                <div
                                    className={`category-nav-item ${selectedCategory === "all" ? "active" : ""}`}
                                    onClick={() => setSelectedCategory("all")}
                                >
                                    <span>All Categories</span>
                                    <span className="badge">{items.length}</span>
                                </div>

                                {categories.map((c) => (
                                    <div
                                        key={c.id}
                                        className={`category-nav-item ${selectedCategory === c.id ? "active" : ""}`}
                                        onClick={() => setSelectedCategory(c.id)}
                                    >
                                        <span>{c.nama_kategori}</span>
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                <div className="product-content">
                    {loading ? (
                        <div className="loading-screen" style={{ minHeight: "300px" }}>
                            <div className="spinner"></div>
                            <p className="loading-text">Preparing Best Collection...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                            <i className="ph ph-package" style={{ fontSize: "4rem", color: "var(--border-strong)", marginBottom: "1rem" }}></i>
                            <h3 style={{ color: "var(--text-muted)" }}>Product Not Found</h3>
                            <p>Try using different keywords or select a different category.</p>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {items.map((p) => {
                                const isWishlisted = wishlistProductIds.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className={`product-card${isWishlisted ? " product-card--wishlist" : ""}`}
                                    >
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
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.35rem", height: "3rem" }}>
                                                    <div className="product-title" style={{ flex: 1, whiteSpace: "normal", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "0.95rem" }}>
                                                        {p.nama_produk} {p.stok === 0 && <span style={{ color: "var(--danger)", fontSize: "0.75rem" }}> (Sold Out)</span>}
                                                    </div>
                                                    {isPelanggan && (
                                                        <button
                                                            className={`btn-wishlist btn-wishlist--inline${isWishlisted ? " active" : ""}`}
                                                            onClick={(e) => handleToggleWishlist(e, p.id)}
                                                            disabled={wishlistLoading}
                                                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                        >
                                                            <i className={isWishlisted ? "ph-fill ph-heart" : "ph ph-heart"}></i>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="product-price" style={{ fontSize: "1.1rem", margin: "0.25rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span>Rp {p.harga?.toLocaleString('id-ID') || 0}</span>
                                                    <span style={{
                                                        fontSize: "0.68rem",
                                                        color: "var(--text-muted)",
                                                        fontWeight: "600",
                                                        fontFamily: "var(--font-main, sans-serif)"
                                                    }}>
                                                        {p.total_terjual || 0} sold
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="product-meta" style={{ marginTop: "auto" }}>
                                                <span style={{ fontSize: "0.75rem", fontWeight: "500", color: "var(--text-muted)" }}>{p.nama_kategori}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {
                selectedProduct && (
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
                                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", width: "100%" }}>
                                            <h3 style={{ marginBottom: "0.25rem", fontSize: "1.4rem", fontWeight: "800", flex: 1, textAlign: "left" }}>{selectedProduct.nama_produk}</h3>
                                            {isPelanggan && (
                                                <button
                                                    className={`btn-wishlist-modal mobile-only-wishlist${wishlistProductIds.includes(selectedProduct.id) ? " active" : ""}`}
                                                    onClick={(e) => { handleToggleWishlist(e, selectedProduct.id); }}
                                                    disabled={wishlistLoading}
                                                    title={wishlistProductIds.includes(selectedProduct.id) ? "Remove Wishlist" : "Add to Wishlist"}
                                                    style={{ marginTop: "0.25rem" }}
                                                >
                                                    <i className={wishlistProductIds.includes(selectedProduct.id) ? "ph-fill ph-heart" : "ph ph-heart"}></i>
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ fontFamily: "'Roboto', sans-serif", color: "var(--primary)", fontSize: "1.5rem", fontWeight: "900", marginBottom: "1rem", textAlign: "left", width: "100%" }}>
                                            Rp {selectedProduct.harga?.toLocaleString('id-ID')}
                                        </div>

                                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                            <span className="badge badge-kasir">{selectedProduct.nama_kategori}</span>
                                            <span className={`stok-badge ${selectedProduct.stok === 0 ? 'stok-empty' : ''}`} style={{ fontSize: "0.8rem" }}>
                                                Stock: {selectedProduct.stok}
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
                                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setSelectedProduct(null)}>Close</button>
                                {isPelanggan && (
                                    <button
                                        className={`btn-wishlist-modal desktop-only-wishlist${wishlistProductIds.includes(selectedProduct.id) ? " active" : ""}`}
                                        onClick={(e) => { handleToggleWishlist(e, selectedProduct.id); }}
                                        disabled={wishlistLoading}
                                        title={wishlistProductIds.includes(selectedProduct.id) ? "Remove Wishlist" : "Add to Wishlist"}
                                    >
                                        <i className={wishlistProductIds.includes(selectedProduct.id) ? "ph-fill ph-heart" : "ph ph-heart"}></i>
                                    </button>
                                )}
                                {isAdmin && (
                                    <>
                                        <button className="btn-danger" onClick={() => { handleDelete(selectedProduct.id); setSelectedProduct(null); }}>
                                            Delete
                                        </button>
                                        <button onClick={() => { handleEdit(selectedProduct); setSelectedProduct(null); }}>
                                            Edit
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {toastVisible && (
                <div className="toast-notification">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className={toastMessage.includes("dihapus") ? "ph-bold ph-x" : "ph-bold ph-check"} style={{ color: "#ffffff", fontSize: "1.3rem" }}></i>
                        <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{toastMessage}</span>
                    </div>
                    <a href="#/wishlist" style={{
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        fontWeight: "600",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "transparent",
                        transition: "all 0.2s"
                    }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#333333"; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                        Lihat
                    </a>
                </div>
            )}
        </div >
    );
}
