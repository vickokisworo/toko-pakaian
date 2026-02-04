import React, { useEffect, useState } from "react";
import {
  getCategories,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory,
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
        loadCategories();
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ nama_kategori: e.target.value });
  };

  if (loading) return <div>Loading categories...</div>;

  const isAdmin = user?.role === "admin";
  const [searchId, setSearchId] = useState("");
  const { getCategoryDetail } = require("../api");

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
        <button
          onClick={async () => {
            if (!searchId) return loadCategories();
            try {
              const data = await getCategoryDetail(searchId);
              setItems(data ? [data] : []);
            } catch (e) {
              setError(e.message);
            }
          }}
          style={{ padding: 6 }}
        >
          Cari
        </button>
        <button
          onClick={() => {
            setSearchId("");
            loadCategories();
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {items.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ padding: 15, border: "1px solid #ddd", borderRadius: 5 }}
          >
            <strong
              style={{ cursor: "pointer", display: "block" }}
              onClick={() => {
                // navigate to products page filtered by kategori
                window.location.hash = `#/products?kategori=${c.id}`;
              }}
            >
              {c.nama_kategori}
            </strong>
            <div>ID: {c.id}</div>

            {isAdmin && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => handleEdit(c)}
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
                  onClick={() => handleDelete(c.id)}
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
