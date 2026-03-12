import React, { useEffect, useState } from "react";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../api";

export default function Category() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user] = useState(() => {
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
        nama_kategori: "",
    });

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data || []);
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
        setFormData({
            nama_kategori: category.nama_kategori,
        });
        setEditingId(category.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this category?")) {
            try {
                await deleteCategory(id);
                loadCategories();
            } catch (e) {
                setError(e.message);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) return <div>Loading categories...</div>;

    const isAdmin = user?.role === "admin";

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Categories</h1>
            </div>

            {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

            {isAdmin && (
                <div style={{ marginBottom: "1rem" }}>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData({ nama_kategori: "" });
                        }}
                    >
                        + Add New Category
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
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1000,
                            }}
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                            }}
                        >
                            <div
                                className="card"
                                onClick={(e) => e.stopPropagation()}
                                style={{ width: "400px", padding: "2rem" }}
                            >
                                <h4>{editingId ? "Edit Category" : "New Category"}</h4>
                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <label>Category Name</label>
                                        <input
                                            type="text"
                                            name="nama_kategori"
                                            value={formData.nama_kategori}
                                            onChange={handleChange}
                                            required
                                            style={{ width: "100%", padding: "0.5rem" }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <button type="submit" style={{ flex: 1 }}>
                                            {editingId ? "Update" : "Create"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingId(null);
                                            }}
                                            style={{ flex: 1, backgroundColor: "#ccc" }}
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

            <div className="card">
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #ddd" }}>
                            <th style={{ padding: "0.5rem" }}>ID</th>
                            <th style={{ padding: "0.5rem" }}>Category Name</th>
                            {isAdmin && <th style={{ padding: "0.5rem" }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c) => (
                            <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "0.5rem" }}>{c.id}</td>
                                <td style={{ padding: "0.5rem" }}>{c.nama_kategori}</td>
                                {isAdmin && (
                                    <td style={{ padding: "0.5rem" }}>
                                        <button
                                            onClick={() => handleEdit(c)}
                                            style={{ marginRight: "0.5rem", padding: "0.2rem 0.5rem" }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            style={{ backgroundColor: "#ff4d4f", color: "white", padding: "0.2rem 0.5rem" }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin ? 3 : 2} style={{ padding: "1rem", textAlign: "center" }}>
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
