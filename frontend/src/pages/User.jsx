import React, { useEffect, useState } from "react";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
} from "../api";

export default function User() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser] = useState(() => {
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
        nama: "",
        email: "",
        password: "",
        role: "pelanggan",
    });

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data || []);
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
                // If editing and password is empty, don't send it or handle it in backend
                // Background backend: if password empty it doesn't update password
                const payload = { ...formData };
                if (!payload.password) {
                    delete payload.password;
                }
                await updateUser(editingId, payload);
            } else {
                await createUser(formData);
            }
            setFormData({ nama: "", email: "", password: "", role: "pelanggan" });
            setEditingId(null);
            setShowForm(false);
            loadUsers();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleEdit = (u) => {
        setFormData({
            nama: u.nama,
            email: u.email,
            password: "", // don't show password
            role: u.role,
        });
        setEditingId(u.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this user?")) {
            try {
                await deleteUser(id);
                loadUsers();
            } catch (e) {
                setError(e.message);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) return <div>Loading users...</div>;

    const isAdmin = currentUser?.role === "admin";

    if (!isAdmin) {
        return <div style={{ color: "red" }}>Access denied: You are not an admin.</div>;
    }

    return (
        <div>

            {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

            <div style={{ marginBottom: "1rem" }}>
                <button
                    className="btn-success"
                    onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setFormData({ nama: "", email: "", password: "", role: "pelanggan" });
                    }}
                >
                    <i className="ph ph-plus"></i> Add New User
                </button>

                {showForm && (
                    <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
                        <div className="modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4>{editingId ? "Edit User" : "New User"}</h4>
                                <button className="modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                    <i className="ph ph-x"></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="input-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            name="nama"
                                            placeholder="Enter full name"
                                            value={formData.nama}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="user@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Password {editingId && <small style={{ fontWeight: 400, opacity: 0.7 }}>(Leave empty to keep current)</small>}</label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!editingId}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Role</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="kasir">Cashier</option>
                                            <option value="karyawan">Employee</option>
                                            <option value="pelanggan">Customer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-success">
                                        {editingId ? "Update User" : "Create User"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <div className="card table-container">
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #ddd" }}>
                            <th style={{ padding: "0.5rem" }}>ID</th>
                            <th style={{ padding: "0.5rem" }}>Name</th>
                            <th style={{ padding: "0.5rem" }}>Email</th>
                            <th style={{ padding: "0.5rem" }}>Role</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "0.5rem" }}>{u.id}</td>
                                <td style={{ padding: "0.5rem" }}>
                                    <div style={{ fontWeight: "600" }}>{u.nama}</div>
                                </td>
                                <td style={{ padding: "0.5rem" }}>{u.email}</td>
                                <td style={{ padding: "0.5rem", textTransform: "capitalize", color: "var(--text-muted)", fontWeight: "500" }}>
                                    {u.role}
                                </td>
                                <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                        <button
                                            onClick={() => handleEdit(u)}
                                            className="btn-view"
                                            style={{ padding: "0.3rem 0.6rem" }}
                                        >
                                            <i className="ph ph-note-pencil"></i> Edit
                                        </button>
                                        {currentUser.id !== u.id && (
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="btn-danger"
                                                style={{ padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
                                            >
                                                <i className="ph ph-trash"></i> Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: "1rem", textAlign: "center" }}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
