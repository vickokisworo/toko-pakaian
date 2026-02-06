import React, { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../api";

export default function Products() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    nama_produk: "",
    harga: "",
    stok: "",
    kategori_id: "",
    deskripsi: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [search, setSearch] = React.useState("");

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts(params = {}) {
    try {
      if (!Object.keys(params).length) {
        const hash = window.location.hash || "";
        const qs = hash.includes("?") ? hash.split("?")[1] : "";
        params = Object.fromEntries(new URLSearchParams(qs));
      }
      const data = await getProducts(params);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("nama_produk", formData.nama_produk);
      data.append("harga", formData.harga);
      data.append("stok", formData.stok);
      data.append("kategori_id", formData.kategori_id);
      data.append("deskripsi", formData.deskripsi);
      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingId) {
        await updateProduct(editingId, data);
      } else {
        await createProduct(data);
      }
      setFormData({ nama_produk: "", harga: "", stok: "", kategori_id: "", deskripsi: "" });
      setImageFile(null);
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
    if (confirm("Hapus produk ini?")) {
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

  if (loading) return <div style={{ padding: "20px", textAlign: "center", color: "var(--secondary)" }}>Loading products...</div>;

  const isAdmin = user?.role === "admin";
  const isPelanggan = user?.role === "pelanggan";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ margin: 0, color: "var(--primary-dark)" }}>Products</h3>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            placeholder="Search by id or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 180 }}
          />
          <button
            onClick={() => loadProducts(search ? { search } : {})}
            style={{ backgroundColor: "var(--secondary)", color: "white", border: "none" }}
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearch("");
              loadProducts({});
            }}
            style={{ backgroundColor: "transparent", color: "var(--secondary)", border: "1px solid var(--secondary)" }}
          >
            Clear
          </button>
        </div>
      </div>

      {error && <div style={{ color: "var(--danger)", marginBottom: 10, padding: 8, backgroundColor: "#fee2e2", borderRadius: 4 }}>{error}</div>}

      {isAdmin && (
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setImageFile(null);
              setFormData({
                nama_produk: "",
                harga: "",
                stok: "",
                kategori_id: "",
                deskripsi: "",
              });
            }}
            style={{
              backgroundColor: "var(--success)",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer"
            }}
          >
            + Add New Product
          </button>

          {showForm && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                padding: "20px"
              }}
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setImageFile(null);
              }}
            >
              <div
                className="card"
                style={{
                  maxWidth: 500,
                  width: "100%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  backgroundColor: "white",
                  margin: 0
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h4 style={{ marginTop: 0 }}>{editingId ? "Edit Product" : "New Product"}</h4>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 10 }}>
                    <label>Gambar Produk</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      style={{ display: "block", marginTop: 5 }}
                    />
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label>Nama Produk</label>
                    <input
                      type="text"
                      name="nama_produk"
                      value={formData.nama_produk}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label>Harga</label>
                      <input
                        type="number"
                        name="harga"
                        value={formData.harga}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Stok</label>
                      <input
                        type="number"
                        name="stok"
                        value={formData.stok}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label>Kategori</label>
                    <select
                      name="kategori_id"
                      value={formData.kategori_id}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "var(--radius-md)"
                      }}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label>Deskripsi</label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      rows="4"
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginTop: "5px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "var(--radius-md)",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" style={{ backgroundColor: "var(--primary)", color: "white", border: "none", padding: "8px 16px", cursor: "pointer", borderRadius: "var(--radius-md)" }}>
                      {editingId ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setImageFile(null);
                      }}
                      style={{ backgroundColor: "transparent", border: "1px solid var(--secondary)", color: "var(--secondary)", padding: "8px 16px", cursor: "pointer", borderRadius: "var(--radius-md)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--secondary)", margin: "40px" }}>No products found.</div>
      ) : (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "stretch",
          justifyContent: window.innerWidth <= 480 ? "center" : "center"
        }}>
          {items.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                width: window.innerWidth <= 480 ? "100%" : "240px",
                flexShrink: 0, // Prevent shrinking below 240px
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onClick={() => setSelectedProduct(p)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
            >
              <div style={{ height: "180px", overflow: "hidden", borderBottom: "1px solid #e2e8f0" }}>
                <img
                  src={p.image ? `http://localhost:3000${p.image}` : `https://images.unsplash.com/photo-${1515886657613 + (p.id * 1000)}?q=80&w=300&auto=format&fit=crop`}
                  alt={p.nama_produk}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=300&auto=format&fit=crop"; }}
                />
              </div>

              <div style={{ padding: "var(--spacing-md)", flex: 1, display: "flex", flexDirection: "column" }}>
                <strong style={{ fontSize: "1.05rem", marginBottom: 4 }}>{p.nama_produk}</strong>
                <div style={{ color: "var(--primary)", fontWeight: "bold" }}>Rp {p.harga?.toLocaleString() || 0}</div>

                <div style={{ fontSize: "0.85rem", color: "var(--secondary)", margin: "8px 0" }}>
                  <span style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "12px", border: "1px solid #e2e8f0", marginRight: 8, fontSize: "0.8rem" }}>{p.nama_kategori}</span>
                  {!isPelanggan && <span>Stok: {p.stok}</span>}
                </div>

                {isAdmin && (
                  <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(p);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: "white",
                        border: "1px solid var(--primary)",
                        color: "var(--primary)",
                        padding: "6px",
                        fontSize: "0.85rem",
                        borderRadius: "var(--radius-md)"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: "white",
                        border: "1px solid var(--danger)",
                        color: "var(--danger)",
                        padding: "6px",
                        fontSize: "0.8rem",
                        borderRadius: "var(--radius-md)"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "var(--radius-lg)",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "var(--shadow-xl)",
              display: "flex",
              flexDirection: "column",
              animation: "slideUp 0.3s ease-out"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, color: "var(--primary-dark)" }}>Detail Produk</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", gap: "30px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 300px" }}>
                <img
                  src={selectedProduct.image ? `http://localhost:3000${selectedProduct.image}` : `https://images.unsplash.com/photo-${1515886657613 + (selectedProduct.id * 1000)}?q=80&w=800&auto=format&fit=crop`}
                  alt={selectedProduct.nama_produk}
                  style={{ width: "100%", borderRadius: "var(--radius-md)", objectFit: "cover", aspectRatio: "4/3" }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop"; }}
                />
              </div>

              <div style={{ flex: "1 1 300px" }}>
                <h3 style={{ marginTop: 0, fontSize: "1.5rem", color: "var(--primary-dark)" }}>{selectedProduct.nama_produk}</h3>

                <div style={{ fontSize: "1.25rem", color: "var(--primary)", fontWeight: "bold", marginBottom: "15px" }}>
                  Rp {selectedProduct.harga?.toLocaleString() || 0}
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                  <span style={{ backgroundColor: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "var(--secondary)" }}>
                    Kategori: {selectedProduct.nama_kategori}
                  </span>
                  <span style={{ backgroundColor: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "var(--secondary)" }}>
                    Stok: {selectedProduct.stok}
                  </span>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "var(--primary-dark)" }}>Deskripsi</h4>
                  <p style={{ lineHeight: "1.6", color: "#475569", whiteSpace: "pre-wrap" }}>
                    {selectedProduct.deskripsi || "Tidak ada deskripsi untuk produk ini."}
                  </p>
                </div>

                {isAdmin && (
                  <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        handleEdit(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >
                      Edit Produk
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
