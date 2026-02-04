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
      // if params not provided, check hash for kategori query (e.g. #/products?kategori=1)
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
      if (editingId) {
        await updateProduct(editingId, formData);
      } else {
        await createProduct(formData);
      }
      setFormData({ nama_produk: "", harga: "", stok: "", kategori_id: "" });
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

  if (loading) return <div>Loading products...</div>;

  const isAdmin = user?.role === "admin";
  const isPelanggan = user?.role === "pelanggan";

  return (
    <div>
      <h3>Products</h3>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Search by id or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 6, width: 220, marginRight: 8 }}
        />
        <button
          onClick={() => loadProducts(search ? { search } : {})}
          style={{ padding: 6 }}
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearch("");
            loadProducts({});
          }}
          style={{ padding: 6, marginLeft: 8 }}
        >
          Clear
        </button>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          {!showForm ? (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  nama_produk: "",
                  harga: "",
                  stok: "",
                  kategori_id: "",
                });
              }}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: 10,
              }}
            >
              + Add Product
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                marginBottom: 20,
                padding: 10,
                border: "1px solid #ccc",
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <label>Nama Produk</label>
                <input
                  type="text"
                  name="nama_produk"
                  value={formData.nama_produk}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 5 }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Harga</label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 5 }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Stok</label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 5 }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Kategori</label>
                <select
                  name="kategori_id"
                  value={formData.kategori_id}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 5 }}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button type="submit" style={{ marginRight: 10 }}>
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  style={{ backgroundColor: "#ccc" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 10,
        }}
      >
        {items.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{ padding: 15, border: "1px solid #ddd", borderRadius: 5 }}
          >
            <strong>{p.nama_produk}</strong>
            <div>Harga: Rp {p.harga?.toLocaleString() || 0}</div>
            {!isPelanggan && <div>Stok: {p.stok}</div>}
            <div>Kategori: {p.nama_kategori}</div>

            {isAdmin && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => handleEdit(p)}
                  style={{
                    marginRight: 5,
                    backgroundColor: "#2196F3",
                    color: "white",
                    padding: 5,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    padding: 5,
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
