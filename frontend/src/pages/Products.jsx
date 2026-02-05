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
  });

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
      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingId) {
        await updateProduct(editingId, data);
      } else {
        await createProduct(data);
      }
      setFormData({ nama_produk: "", harga: "", stok: "", kategori_id: "" });
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
          {!showForm ? (
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
                });
              }}
              style={{
                backgroundColor: "var(--success)",
                color: "white",
                padding: "10px 16px",
                border: "none"
              }}
            >
              + Add New Product
            </button>
          ) : (
            <div className="card" style={{ maxWidth: 500 }}>
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

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" style={{ backgroundColor: "var(--primary)", color: "white", border: "none", padding: "8px 16px" }}>
                    {editingId ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setImageFile(null);
                    }}
                    style={{ backgroundColor: "transparent", border: "1px solid var(--secondary)", color: "var(--secondary)", padding: "8px 16px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--secondary)", margin: "40px" }}>No products found.</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "stretch", justifyContent: "center" }}>
          {items.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                width: "240px",
                flexShrink: 0 // Prevent shrinking below 240px
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
                      onClick={() => handleEdit(p)}
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
                      onClick={() => handleDelete(p.id)}
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
    </div>
  );
}
