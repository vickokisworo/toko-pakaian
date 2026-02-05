import React, { useEffect, useState } from "react";
import {
  getCategories,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
} from "../api";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nama_kategori: "" });
  const [searchId, setSearchId] = useState("");

  // ✅ State untuk menampilkan produk
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setItems(data || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await createCategory(formData);
      }
      setFormData({ nama_kategori: "" });
      setEditingId(null);
      setShowForm(false);
      loadCategories();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (category) => {
    setFormData({ nama_kategori: category.nama_kategori });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus kategori ini?")) {
      try {
        await deleteCategory(id);
        // Reset jika kategori yang dipilih dihapus
        if (selectedCategory?.id === id) {
          setSelectedCategory(null);
          setCategoryProducts([]);
        }
        loadCategories();
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ nama_kategori: e.target.value });
  };

  const handleSearch = async () => {
    if (!searchId) return loadCategories();
    try {
      const data = await getCategoryDetail(searchId);
      setItems(data ? [data] : []);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleClearSearch = () => {
    setSearchId("");
    loadCategories();
  };

  // ✅ Fungsi untuk load produk berdasarkan kategori
  const handleSelectCategory = async (category) => {
    setLoadingProducts(true);
    setSelectedCategory(category);

    try {
      const products = await getProducts({ kategori: category.id });
      setCategoryProducts(products || []);
      setError(null);
    } catch (e) {
      setError(e.message);
      setCategoryProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ✅ Fungsi untuk menutup panel produk
  const handleCloseProducts = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
  };

  if (loading) return <div>Loading categories...</div>;

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <h3>Categories</h3>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Cari kategori by id"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ padding: 6, width: 180, marginRight: 8 }}
        />
        <button onClick={handleSearch} style={{ padding: 6 }}>
          Cari
        </button>
        <button
          onClick={handleClearSearch}
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
                setFormData({ nama_kategori: "" });
              }}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: 10,
              }}
            >
              + Add Category
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
                <label>Nama Kategori</label>
                <input
                  type="text"
                  value={formData.nama_kategori}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 5 }}
                />
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

      {/* ✅ Layout Container: Categories Left, Products Right */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap" }}>

        {/* Left Sidebar: Category List */}
        <div style={{ flex: "1 1 250px", minWidth: "200px" }}>
          <h4 style={{ marginTop: 0, marginBottom: "10px", color: "var(--primary-dark)" }}>Daftar Kategori</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {items.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{
                  padding: 12,
                  border: selectedCategory?.id === c.id ? "2px solid #2196F3" : "1px solid #ddd",
                  borderRadius: 5,
                  backgroundColor: selectedCategory?.id === c.id ? "#e3f2fd" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => handleSelectCategory(c)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: selectedCategory?.id === c.id ? "#2196F3" : "inherit" }}>
                    {c.nama_kategori}
                  </strong>
                  {selectedCategory?.id === c.id}
                </div>

                {isAdmin && (
                  <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(c); }}
                      style={{
                        fontSize: "0.8rem",
                        backgroundColor: "#2196F3",
                        color: "white",
                        padding: "4px 8px",
                        border: "none",
                        borderRadius: 3
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      style={{
                        fontSize: "0.8rem",
                        backgroundColor: "#f44336",
                        color: "white",
                        padding: "4px 8px",
                        border: "none",
                        borderRadius: 3
                      }}
                    >
                      Del
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Content: Products Grid */}
        <div style={{ flex: "3 1 400px", minWidth: "300px" }}>
          {selectedCategory ? (
            <div
              style={{
                padding: 20,
                backgroundColor: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <h3 style={{ margin: 0 }}>
                  Produk: <span style={{ color: "#2196F3" }}>{selectedCategory.nama_kategori}</span>
                </h3>
                <button
                  onClick={handleCloseProducts}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  &times; Close
                </button>
              </div>

              {loadingProducts ? (
                <div>Loading products...</div>
              ) : categoryProducts.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
                  Tidak ada produk di kategori ini.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 15
                  }}
                >
                  {categoryProducts.map((p) => (
                    <div
                      key={p.id}
                      className="card"
                      style={{
                        padding: 0,
                        overflow: "hidden",
                        backgroundColor: "white",
                        border: "1px solid #ddd"
                      }}
                    >
                      {/* Placeholder Image */}
                      <div style={{ height: "120px", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "2rem" }}>📦</span>
                      </div>
                      <div style={{ padding: 12 }}>
                        <strong style={{ display: "block", marginBottom: 4 }}>{p.nama_produk}</strong>
                        <div style={{ color: "green", fontWeight: "bold" }}>Rp {p.harga?.toLocaleString()}</div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>Stok: {p.stok}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: 40,
              textAlign: "center",
              border: "2px dashed #e2e8f0",
              borderRadius: 8,
              color: "#94a3b8"
            }}>
              Select a category to view products
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
