import React, { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const u = await getUsers();
      setUsers(u || []);
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
        await updateUser(editingId, formData);
      } else {
        if (!formData.password) {
          setError("Password harus diisi untuk user baru");
          return;
        }
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

  const handleEdit = (user) => {
    setFormData({
      nama: user.nama,
      email: user.email,
      password: "",
      role: user.role,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus user ini?")) {
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

  return (
    <div>
      <h3>Users Management (Admin Only)</h3>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <div style={{ marginBottom: 20 }}>
        {!showForm ? (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                nama: "",
                email: "",
                password: "",
                role: "pelanggan",
              });
            }}
            style={{ backgroundColor: "#4CAF50", color: "white", padding: 10 }}
          >
            + Add User
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ marginBottom: 20, padding: 15, border: "1px solid #ccc" }}
          >
            <div style={{ marginBottom: 10 }}>
              <label>Nama</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>
                Password {editingId && "(kosongkan jika tidak ingin ubah)"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!editingId}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="pelanggan">Pelanggan</option>
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 10,
        }}
      >
        {users.map((u) => (
          <div
            key={u.id}
            className="card"
            style={{ padding: 15, border: "1px solid #ddd", borderRadius: 5 }}
          >
            <div>
              <strong>{u.nama}</strong>
            </div>
            <div>Email: {u.email}</div>
            <div>
              Role:{" "}
              <span
                style={{
                  backgroundColor: "#e3f2fd",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                {u.role}
              </span>
            </div>
            <div style={{ fontSize: "0.9em", color: "#666", marginTop: 5 }}>
              Status: {u.is_active ? "Active" : "Inactive"}
            </div>

            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => handleEdit(u)}
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
                onClick={() => handleDelete(u.id)}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: 5,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
