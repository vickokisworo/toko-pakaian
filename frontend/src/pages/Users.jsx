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

  if (loading) return <div style={{ padding: "20px", textAlign: "center", color: "var(--secondary)" }}>Loading users...</div>;

  return (
    <div>
      <h3 style={{ marginTop: 0, color: "var(--primary-dark)" }}>Users Management</h3>
      {error && <div style={{ color: "var(--danger)", marginBottom: 10, padding: 8, backgroundColor: "#fee2e2", borderRadius: 4 }}>{error}</div>}

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
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
          style={{
            backgroundColor: "var(--success)",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer"
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
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px"
            }}
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: 500,
                width: "100%",
                backgroundColor: "white",
                margin: 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 style={{ marginTop: 0 }}>{editingId ? "Edit User" : "New User"}</h4>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 10 }}>
                  <label>Nama</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    required
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
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label>
                    Password {editingId && <span style={{ fontSize: "0.8em", color: "var(--secondary)" }}>(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingId}
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-md)" }}
                  >
                    <option value="pelanggan">Pelanggan</option>
                    <option value="kasir">Kasir</option>
                    <option value="admin">Admin</option>
                  </select>
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

      {users.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--secondary)" }}>No users found.</div>
      ) : (
        <div className="grid-responsive">
          {users.map((u) => (
            <div
              key={u.id}
              className="card"
              style={{ padding: "var(--spacing-md)", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                  👤
                </div>
                <div>
                  <strong style={{ display: "block" }}>{u.nama}</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>{u.email}</span>
                </div>
              </div>

              <div style={{ margin: "8px 0", fontSize: "0.9rem" }}>
                Role:{" "}
                <span
                  style={{
                    backgroundColor: u.role === "admin" ? "#fef3c7" : u.role === "kasir" ? "#cffafe" : "#dcfce7",
                    color: u.role === "admin" ? "#92400e" : u.role === "kasir" ? "#155e75" : "#166534",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    textTransform: "capitalize"
                  }}
                >
                  {u.role}
                </span>
                <span style={{ float: "right", color: u.is_active ? "var(--success)" : "var(--secondary)" }}>
                  {u.is_active ? "● Active" : "○ Inactive"}
                </span>
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: 8, paddingTop: 8 }}>
                <button
                  onClick={() => handleEdit(u)}
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    border: "1px solid var(--primary)",
                    color: "var(--primary)",
                    padding: "6px",
                    fontSize: "0.9rem"
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    border: "1px solid var(--danger)",
                    color: "var(--danger)",
                    padding: "6px",
                    fontSize: "0.9rem"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
