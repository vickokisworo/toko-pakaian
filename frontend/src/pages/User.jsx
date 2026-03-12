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
            <div className="page-header">
                <h1 className="page-title">Users Management</h1>
            </div>

            {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

            <div style={{ marginBottom: "1rem" }}>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setFormData({ nama: "", email: "", password: "", role: "pelanggan" });
                    }}
                >
                    + Add New User
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
                            <h4>{editingId ? "Edit User" : "New User"}</h4>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%", padding: "0.5rem" }}
                                    />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={{ width: "100%", padding: "0.5rem" }}
                                    />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label>Password {editingId && <small>(Leave empty if you don't want to change it)</small>}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!editingId}
                                        style={{ width: "100%", padding: "0.5rem" }}
                                    />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label>Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        style={{ width: "100%", padding: "0.5rem" }}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="kasir">Cashier</option>
                                        <option value="karyawan">Employee</option>
                                        <option value="pelanggan">Customer</option>
                                    </select>
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

            <div className="card">
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #ddd" }}>
                            <th style={{ padding: "0.5rem" }}>ID</th>
                            <th style={{ padding: "0.5rem" }}>Name</th>
                            <th style={{ padding: "0.5rem" }}>Email</th>
                            <th style={{ padding: "0.5rem" }}>Role</th>
                            <th style={{ padding: "0.5rem" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "0.5rem" }}>{u.id}</td>
                                <td style={{ padding: "0.5rem" }}>{u.nama}</td>
                                <td style={{ padding: "0.5rem" }}>{u.email}</td>
                                <td style={{ padding: "0.5rem" }}>{u.role}</td>
                                <td style={{ padding: "0.5rem" }}>
                                    <button
                                        onClick={() => handleEdit(u)}
                                        style={{ marginRight: "0.5rem", padding: "0.2rem 0.5rem" }}
                                    >
                                        Edit
                                    </button>
                                    {currentUser.id !== u.id && (
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            style={{ backgroundColor: "#ff4d4f", color: "white", padding: "0.2rem 0.5rem" }}
                                        >
                                            Delete
                                        </button>
                                    )}
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
