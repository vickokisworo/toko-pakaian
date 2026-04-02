import React, { useState, useEffect } from "react";
import { getFavorite, removeFavorite } from "../api";

export default function Favorite({ user }) {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadFavoriteDetails();
  }, []);

  async function loadFavoriteDetails() {
    try {
      setLoading(true);
      const data = await getFavorite();
      const favorites = data?.favorites || [];
      setFavoriteProducts(favorites);
    } catch (e) {
      console.error("Could not load favorites:", e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveFavorite = async (productId) => {
    try {
      setLoading(true);
      await removeFavorite(productId);
      setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
    } catch (e) {
      alert("Gagal menghapus favorit: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const isPelanggan = user?.role === "pelanggan";

  if (!isPelanggan) {
    return (
      <div className="admin-container">
        <h2 style={{ textAlign: "center", marginTop: "2rem" }}>Akses Ditolak</h2>
        <p style={{ textAlign: "center" }}>Halaman ini hanya untuk pelanggan.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <h1 className="page-title">Favorite Produk</h1>
      
      <div className="product-layout" style={{ marginTop: "20px" }}>
        {loading && favoriteProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner"></div>
            <p>Memuat favorit...</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px" }}>
            <h3 style={{ color: "var(--text-muted)" }}>Belum Ada Produk Favorit</h3>
            <p>Anda belum menambahkan produk apa pun ke daftar Favorit Anda.</p>
          </div>
        ) : (
          <div className="product-grid">
            {favoriteProducts.map((p, index) => (
              <div 
                key={p.id} 
                className="product-card product-card--favorite" 
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedProduct(p)}
              >
                <div className="product-image-container">
                  <img 
                    src={p.gambar ? (p.gambar.startsWith('http') ? p.gambar : `https://toko-pakaian-backend-production.up.railway.app/uploads/${p.gambar}`) : "/placeholder-cloth.png"} 
                    alt={p.nama_produk} 
                    className="product-image"
                  />
                  <div className="product-badge">{p.nama_kategori}</div>
                  <button 
                    className="btn-favorite--card active"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(p.id); }}
                    title="Hapus dari Favorit"
                  >
                    <i className="fas fa-heart"></i>
                  </button>
                </div>
                <div className="product-info">
                  <div className="product-header">
                    <h3 className="product-name">{p.nama_produk}</h3>
                    <div className="product-price">Rp {p.harga?.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="product-footer">
                    <span className="product-stock">Stok: {p.stok}</span>
                    <button className="btn-buy">Detail</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay active" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</button>
            
            <div className="product-detail-grid">
              <div className="product-detail-image-wrapper">
                <img 
                  src={selectedProduct.gambar ? (selectedProduct.gambar.startsWith('http') ? selectedProduct.gambar : `https://toko-pakaian-backend-production.up.railway.app/uploads/${selectedProduct.gambar}`) : "/placeholder-cloth.png"} 
                  alt={selectedProduct.nama_produk} 
                />
              </div>
              
              <div className="product-detail-info">
                <div className="category-tag">{selectedProduct.nama_kategori}</div>
                <h3>{selectedProduct.nama_produk}</h3>
                <div className="detail-price">Rp {selectedProduct.harga?.toLocaleString('id-ID')}</div>
                
                <div className="detail-meta">
                  <div className="meta-item">
                    <span className="meta-label">Stok</span>
                    <span className="meta-value">{selectedProduct.stok} pcs</span>
                  </div>
                </div>
                
                <div className="detail-description">
                  <h4>Deskripsi Produk</h4>
                  <p>{selectedProduct.deskripsi || "Tidak ada deskripsi untuk produk ini."}</p>
                </div>
                
                <div className="detail-actions">
                  <button 
                    className="btn-favorite-modal active"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(selectedProduct.id); setSelectedProduct(null); }}
                  >
                    <i className="fas fa-heart" style={{ marginRight: '8px' }}></i>
                    Hapus Favorit
                  </button>
                  <button className="btn-primary-modern" style={{ flex: 1 }}>
                    Beli Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
