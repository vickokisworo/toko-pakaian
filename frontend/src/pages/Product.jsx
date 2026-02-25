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
    const [user, setUser] = useState(() => {
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
        nama_produk: "",
        harga: "",
        stok: "",
        kategori_id: "",
        deskripsi: "",
    });

    const [selectedProduct, setSelectedProduct] = useState(null);

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
            data.append("deskripsi", formData.deskripsi);


            if (editingId) {
                await updateProduct(editingId, data);
            } else {
                await createProduct(data);
            }
            setFormData({ nama_produk: "", harga: "", stok: "", kategori_id: "", deskripsi: "" });
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
            deskripsi: product.deskripsi || "",
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
            <div>
                <h3>Products</h3>

                <div>
                    <input
                        placeholder="Search by id or name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => loadProducts(search ? { search } : {})}
                    >
                        Search
                    </button>
                    <button
                        onClick={() => {
                            setSearch("");
                            loadProducts({});
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {error && <div>{error}</div>}

            {isAdmin && (
                <div>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingId(null);
                            setFormData({
                                nama_produk: "",
                                harga: "",
                                stok: "",
                                kategori_id: "",
                                deskripsi: "",
                            });
                        }}
                    >
                        + Add New Product
                    </button>

                    {showForm && (
                        <div
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                            }}
                        >
                            <div
                                className="card"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h4>{editingId ? "Edit Product" : "New Product"}</h4>
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <label>Gambar Produk</label>

                                    </div>

                                    <div>
                                        <label>Nama Produk</label>
                                        <input
                                            type="text"
                                            name="nama_produk"
                                            value={formData.nama_produk}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div>
                                            <label>Harga</label>
                                            <input
                                                type="number"
                                                name="harga"
                                                value={formData.harga}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div>
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

                                    <div>
                                        <label>Kategori</label>
                                        <select
                                            name="kategori_id"
                                            value={formData.kategori_id}
                                            onChange={handleChange}
                                            required
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
                                        <label>Deskripsi</label>
                                        <textarea
                                            name="deskripsi"
                                            value={formData.deskripsi}
                                            onChange={handleChange}
                                            rows="4"
                                           
                                        />
                                    </div>

                                    <div>
                                        <button type="submit">
                                            {editingId ? "Update" : "Create"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingId(null);
                                            }}
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

            {items.length === 0 ? (
                <div>No products found.</div>
            ) : (
                <div>
                    {items.map((p) => (
                        <div
                            key={p.id}
                            className="card"
                            onClick={() => setSelectedProduct(p)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-5px)";
                                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                            }}
                        >

                            <div>
                                <strong>{p.nama_produk}</strong>
                                <div>Rp {p.harga?.toLocaleString() || 0}</div>

                                <div>
                                    <span>{p.nama_kategori}</span>
                                    {!isPelanggan && <span>Stok: {p.stok}</span>}
                                </div>

                                {isAdmin && (
                                    <div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(p);
                                            }}
                                         
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(p.id);
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

            {selectedProduct && (
                <div
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                    >
                        <div>
                            <h2>Detail Produk</h2>
                            <button
                                onClick={() => setSelectedProduct(null)}
                            >
                                &times;
                            </button>
                        </div>

                        <div>


                            <div>
                                <h3>{selectedProduct.nama_produk}</h3>

                                <div>
                                    Rp {selectedProduct.harga?.toLocaleString() || 0}
                                </div>

                                <div>
                                    <span>
                                        Kategori: {selectedProduct.nama_kategori}
                                    </span>
                                    <span>
                                        Stok: {selectedProduct.stok}
                                    </span>
                                </div>

                                <div>
                                    <h4>Deskripsi</h4>
                                    <p>
                                        {selectedProduct.deskripsi || "Tidak ada deskripsi untuk produk ini."}
                                    </p>
                                </div>

                                {isAdmin && (
                                    <div>
                                        <button
                                            onClick={() => {
                                                handleEdit(selectedProduct);
                                                setSelectedProduct(null);
                                            }}
                                 
                                        >
                                            Edit Produk
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
