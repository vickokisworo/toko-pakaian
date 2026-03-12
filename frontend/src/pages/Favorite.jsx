import React, { useEffect, useState } from "react";
import { getFavorite, getProductDetail, setFavorite } from "../api";

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:3000";

export default function Favorite({ user }) {
  const [favoriteProduct, setFavoriteProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const isPelanggan = user?.role === "pelanggan";

  useEffect(() => {
    loadFavoriteDetails();
  }, []);

  async function loadFavoriteDetails() {
    try {
      setLoading(true);
      const data = await getFavorite();
      const fav = data?.favorite;
      if (fav && fav.id) {
        // fav might only have id according to Product.jsx logic, or full object.
        // Let's ensure we have product details:
        if (fav.nama_produk) {
          setFavoriteProduct(fav);
        } else {
          const detail = await getProductDetail(fav.id);
          setFavoriteProduct(detail);
        }
      } else {
        setFavoriteProduct(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveFavorite = async () => {
    try {
      setLoading(true);
      await setFavorite(null);
      setFavoriteProduct(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Favorite Product</h1>
      </div>

      {error && <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</div>}

      <div className="product-content">
        {loading ? (
          <div className="loading-screen" style={{ minHeight: "300px" }}>
            <div className="spinner"></div>
            <p className="loading-text">Loading...</p>
          </div>
        ) : !favoriteProduct ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <h3 style={{ color: "var(--text-muted)" }}>No Favorite Product</h3>
            <p>You haven't added any product to your favorites yet.</p>
            <a 
              href="#/product" 
              className="btn-success" 
              style={{ marginTop: "1rem", display: "inline-block", textDecoration: "none"}}
              onMouseOver={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
              onMouseOut={(e) => { e.currentTarget.style.textDecoration = "none"; }}
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="product-grid">
            <div className="product-card product-card--favorite">
                <div className="product-image-ctr" onClick={() => setSelectedProduct(favoriteProduct)}>
                    {favoriteProduct.gambar ? (
                        <img src={`${API_BASE}/uploads/${favoriteProduct.gambar}`} alt={favoriteProduct.nama_produk} className="product-image" />
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
                    <div onClick={() => setSelectedProduct(favoriteProduct)} style={{ cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.35rem", height: "3rem" }}>
                            <div className="product-title" style={{ flex: 1, whiteSpace: "normal", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "0.95rem" }}>
                                {favoriteProduct.nama_produk} {favoriteProduct.stok === 0 && <span style={{ color: "var(--danger)", fontSize: "0.75rem" }}> (Sold Out)</span>}
                            </div>
                            {isPelanggan && (
                                <button
                                    className="btn-favorite btn-favorite--inline active"
                                    onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(); }}
                                    disabled={loading}
                                    title="Remove from favorite"
                                >
                                    <i className="ph-fill ph-heart"></i>
                                </button>
                            )}
                        </div>
                        <div className="product-price" style={{ fontSize: "1.1rem", margin: "0.25rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Rp {favoriteProduct.harga?.toLocaleString('id-ID') || 0}</span>
                            <span style={{
                                fontSize: "0.68rem",
                                color: "var(--text-muted)",
                                fontWeight: "600",
                                fontFamily: "var(--font-main, sans-serif)"
                            }}>
                                {favoriteProduct.total_terjual || 0} sold
                            </span>
                        </div>
                    </div>

                    <div className="product-meta" style={{ marginTop: "auto" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "500", color: "var(--text-muted)" }}>{favoriteProduct.nama_kategori}</span>
                    </div>
                </div>
            </div>
          </div>
        )}
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
                          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "1.5rem" }}>
                              <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", height: "250px", background: "#f3f4f6" }}>
                                  {selectedProduct.gambar ? (
                                      <img src={`${API_BASE}/uploads/${selectedProduct.gambar}`} alt={selectedProduct.nama_produk} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", color: "#cbd5e1" }}>
                                          <i className="ph ph-image"></i>
                                      </div>
                                  )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                  <h3 style={{ marginBottom: "0.25rem", fontSize: "1.4rem", fontWeight: "800" }}>{selectedProduct.nama_produk}</h3>
                                  <div style={{ fontFamily: "'Roboto', sans-serif", color: "var(--primary)", fontSize: "1.5rem", fontWeight: "900", marginBottom: "1rem" }}>
                                      Rp {selectedProduct.harga?.toLocaleString('id-ID')}
                                  </div>

                                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                      <span className="badge badge-kasir">{selectedProduct.nama_kategori}</span>
                                      <span className={`stok-badge ${selectedProduct.stok === 0 ? 'stok-empty' : ''}`} style={{ fontSize: "0.8rem" }}>
                                          Stock: {selectedProduct.stok}
                                      </span>
                                      {isPelanggan && (
                                          <span className="badge" style={{ background: "#fff0f5", color: "#e11d48" }}>
                                              <i className="ph-fill ph-heart" style={{ marginRight: "3px" }}></i> My Favorite
                                          </span>
                                      )}
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
                          {isPelanggan && (
                              <button
                                  className="btn-favorite-modal active"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(); setSelectedProduct(null); }}
                                  disabled={loading}
                                  title="Remove Favorite"
                              >
                                  <i className="ph-fill ph-heart"></i>
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          )
      }
    </div>
  );
}
