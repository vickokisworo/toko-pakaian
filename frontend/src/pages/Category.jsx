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

            {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

            {isAdmin && (
                <div style={{ marginBottom: "1rem" }}>
                    <button
                        className="btn-success"
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData({ nama_kategori: "" });
                        }}
                    >
                        <i className="ph ph-plus"></i> Add New Category
                    </button>

                    {showForm && (
                        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
                            <div className="modal-content" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h4>{editingId ? "Edit Category" : "New Category"}</h4>
                                    <button className="modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                        <i className="ph ph-x"></i>
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="input-group">
                                            <label>Category Name</label>
                                            <input
                                                type="text"
                                                name="nama_kategori"
                                                placeholder="Example: T-Shirt"
                                                value={formData.nama_kategori}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-success">
                                            {editingId ? "Update" : "Create"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="card table-container">
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
                                            style={{ marginRight: "0.5rem", padding: "0.3rem 0.6rem" }}
                                            className="btn-view"
                                        >
                                            <i className="ph ph-note-pencil"></i> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="btn-danger"
                                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
                                        >
                                            <i className="ph ph-trash"></i> Delete
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
