import React, { useEffect, useState } from "react";
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    getTransactionDetail,
    getProducts
} from "../api";

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:3000";

export default function Transaction() {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
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

    const [view, setView] = useState("list");

    const [jumlahBayar, setJumlahBayar] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadTransactions();
        loadProducts();
    }, []);

    const [selectedTransaction, setSelectedTransaction] = useState(null);

    async function loadTransactions() {
        try {
            setLoading(true);
            const data = await getTransactions();
            setTransactions(data || []);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data || []);
        } catch (e) {
            console.error(e.message);
        }
    }

    const resetForm = () => {
        setJumlahBayar("");
        setCartItems([]);
        setSelectedTransaction(null);
        setEditingId(null);
    };

    async function handleViewDetails(id) {
        try {
            setLoading(true);
            const data = await getTransactionDetail(id);
            setSelectedTransaction(data);
            setView("details");
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    const handleAddToCartFromCard = (product) => {
        if (product.stok < 1) return;

        const existingItemIndex = cartItems.findIndex(i => i.product_id === product.id);
        if (existingItemIndex >= 0) {
            const newCartItems = [...cartItems];
            if (newCartItems[existingItemIndex].qty < product.stok) {
                newCartItems[existingItemIndex].qty += 1;
                newCartItems[existingItemIndex].subtotal = newCartItems[existingItemIndex].qty * product.harga;
                setCartItems(newCartItems);
            } else {
                alert("Insufficient stock!");
            }
        } else {
            setCartItems([...cartItems, {
                product_id: product.id,
                nama_produk: product.nama_produk,
                harga_satuan: product.harga,
                qty: 1,
                subtotal: product.harga
            }]);
        }
    };

    const handleUpdateCartQty = (index, delta) => {
        const newCartItems = [...cartItems];
        const item = newCartItems[index];
        const product = products.find(p => p.id === item.product_id);

        if (!product) return;

        const newQty = item.qty + delta;
        if (newQty < 1) {
            handleRemoveFromCart(index);
            return;
        }
        if (newQty > product.stok) {
            alert("Insufficient stock!");
            return;
        }

        item.qty = newQty;
        item.subtotal = newQty * product.harga;
        setCartItems(newCartItems);
    };

    const handleRemoveFromCart = (index) => {
        const newCartItems = [...cartItems];
        newCartItems.splice(index, 1);
        setCartItems(newCartItems);
    };

    const totalHargaCart = cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            return setError("Cart is empty!");
        }
        if (!jumlahBayar || parseInt(jumlahBayar) < totalHargaCart) {
            return setError("Insufficient payment!");
        }

        try {
            if (editingId) {
                await updateTransaction(editingId, {
                    jumlah_bayar: parseInt(jumlahBayar),
                    items: cartItems.map(item => ({
                        product_id: item.product_id,
                        qty: item.qty,
                        harga_satuan: item.harga_satuan
                    }))
                });
            } else {
                await createTransaction({
                    jumlah_bayar: parseInt(jumlahBayar),
                    items: cartItems.map(item => ({
                        product_id: item.product_id,
                        qty: item.qty,
                        harga_satuan: item.harga_satuan
                    }))
                });
            }
            resetForm();
            setView("list");
            loadTransactions();
            loadProducts();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleUpdate = (id) => {
        if (selectedTransaction && selectedTransaction.id === id) {
            setEditingId(id);
            setCartItems(selectedTransaction.items.map(item => ({
                product_id: item.product_id,
                nama_produk: item.nama_produk,
                harga_satuan: item.harga_satuan,
                qty: item.qty,
                subtotal: item.subtotal
            })));
            setJumlahBayar(selectedTransaction.jumlah_bayar.toString());
            setView("form");
        }
    };

    if (loading) return <div>Loading...</div>;

    const isKasir = user?.role === "kasir";
    const isAdmin = user?.role === "admin";

    if (!isAdmin && !isKasir) {
        return <div style={{ color: "red" }}>Access denied.</div>;
    }

    if (view === "details" && selectedTransaction) {
        return (
            <div>
                <div className="page-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button onClick={() => setView("list")} style={{ background: "transparent", color: "var(--text-main)", padding: "0.5rem", boxShadow: "none", fontSize: "1.5rem" }}>
                            <i className="ph ph-arrow-left"></i>
                        </button>
                        <h1 className="page-title">Transaction Details</h1>
                    </div>
                    {isKasir && (
                        <button
                            onClick={() => handleUpdate(selectedTransaction.id)}
                            style={{ backgroundColor: "black", color: "white" }}
                        >
                            <i className="ph ph-note-pencil" style={{ marginRight: "0.5rem" }}></i>
                            Update Transaction
                        </button>
                    )}
                </div>

                <div className="card" style={{ marginBottom: "2rem" }}>
                    <h4 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                        Transaction Information
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
                        <div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.2rem" }}>Transaction Code</p>
                            <p style={{ fontWeight: "700", fontSize: "1.1rem" }}>{selectedTransaction.kode_transaksi}</p>

                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.2rem", marginTop: "1rem" }}>Date & Time</p>
                            <p style={{ fontWeight: "500" }}>{new Date(selectedTransaction.tanggal).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        </div>
                        <div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.2rem" }}>Cashier</p>
                            <p style={{ fontWeight: "500" }}>{selectedTransaction.nama_kasir || `ID: ${selectedTransaction.kasir_id}`}</p>

                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.2rem", marginTop: "1rem" }}>Payment Status</p>
                            <span className="badge badge-pelanggan">Paid Success</span>
                        </div>
                        <div style={{ background: "var(--primary-light)", padding: "1rem", borderRadius: "var(--radius-md)", textAlign: "right" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.2rem" }}>Total Amount</p>
                            <p style={{ fontWeight: "800", fontSize: "1.5rem", color: "var(--primary)" }}>Rp. {selectedTransaction.total_harga?.toLocaleString()}</p>

                            <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                                <p>Paid: Rp. {selectedTransaction.jumlah_bayar?.toLocaleString()}</p>
                                <p style={{ color: "var(--success)" }}>Change: Rp. {selectedTransaction.kembalian?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: "1.5rem" }}>Transaction Items ({selectedTransaction.items?.length})</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {selectedTransaction.items?.map((item, idx) => (
                            <div key={idx} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1.5rem",
                                padding: "1rem",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-md)",
                                background: "#fafafa"
                            }}>
                                <div style={{ width: "80px", height: "80px", borderRadius: "4px", overflow: "hidden", background: "#eee", flexShrink: 0 }}>
                                    {item.gambar ? (
                                        <img src={item.gambar.startsWith("http") ? item.gambar : `${API_BASE}/uploads/${item.gambar}`} alt={item.nama_produk} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                                            <i className="ph ph-image" style={{ fontSize: "2rem" }}></i>
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h5 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{item.nama_produk}</h5>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>ID Produk: {item.product_id}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.qty} x Rp. {item.harga_satuan?.toLocaleString()}</p>
                                    <p style={{ fontWeight: "700", fontSize: "1.05rem" }}>Rp. {item.subtotal?.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "2px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ marginRight: "2rem", color: "var(--text-muted)", fontWeight: "600" }}>GRAND TOTAL</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "800" }}>Rp. {selectedTransaction.total_harga?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === "form") {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">{editingId ? `Edit Transaction: ${selectedTransaction?.kode_transaksi}` : "New Transaction (POS)"}</h1>
                </div>
                {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

                <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Select Product</h4>
                    <div className="product-grid">
                        {products.map(p => (
                            <div key={p.id} className="product-card" style={{ opacity: p.stok < 1 ? 0.6 : 1, cursor: p.stok < 1 ? "not-allowed" : "pointer" }}>
                                <div className="product-image-ctr" onClick={() => p.stok >= 1 && handleAddToCartFromCard(p)}>
                                    {p.gambar ? (
                                        <img src={p.gambar.startsWith("http") ? p.gambar : `${API_BASE}/uploads/${p.gambar}`} alt={p.nama_produk} className="product-image" />
                                    ) : (
                                        <div className="product-placeholder">
                                            <i className="ph ph-image"></i>
                                        </div>
                                    )}
                                    <div className="product-overlay">
                                        <span>+ Cart</span>
                                    </div>
                                </div>
                                <div className="product-info">
                                    <div onClick={() => p.stok >= 1 && handleAddToCartFromCard(p)} style={{ cursor: "pointer" }}>
                                        <div className="product-title" style={{ whiteSpace: "normal", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", height: "3rem", fontSize: "0.95rem" }}>
                                            <span style={{
                                                fontSize: "0.62rem",
                                                background: p.stok === 0 ? "rgba(239, 68, 68, 0.05)" : "rgba(10, 10, 10, 0.03)",
                                                color: p.stok === 0 ? "#e11d48" : "#1a1a1a",
                                                padding: "1px 6px",
                                                borderRadius: "4px",
                                                fontWeight: "800",
                                                float: "right",
                                                border: `1px solid ${p.stok === 0 ? "#e11d48" : "#d1d5db"}`,
                                                marginTop: "2px",
                                                marginLeft: "8px"
                                            }}>
                                                Stock: {p.stok}
                                            </span>
                                            {p.nama_produk}
                                        </div>
                                        <div className="product-price">Rp. {p.harga?.toLocaleString()}</div>
                                    </div>
                                    <div className="product-meta" style={{ marginTop: "auto" }}>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.nama_kategori}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ marginBottom: "1rem" }}>
                    <h4>Shopping Cart</h4>
                    <div className="table-container">
                        <table style={{ width: "100%", marginBottom: "1rem", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                    <th style={{ textAlign: "left" }}>Product Name</th>
                                    <th style={{ textAlign: "right" }}>Price</th>
                                    <th style={{ textAlign: "right" }}>Qty</th>
                                    <th style={{ textAlign: "right" }}>Subtotal</th>
                                    <th style={{ textAlign: "center" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                                        <td>{item.nama_produk}</td>
                                        <td style={{ textAlign: "right" }}>Rp. {item.harga_satuan}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                                                <button type="button" onClick={() => handleUpdateCartQty(idx, -1)} style={{ padding: "0.2rem 0.5rem" }}>-</button>
                                                <span>{item.qty}</span>
                                                <button type="button" onClick={() => handleUpdateCartQty(idx, 1)} style={{ padding: "0.2rem 0.5rem" }}>+</button>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>Rp. {item.subtotal}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <button onClick={() => handleRemoveFromCart(idx)} style={{ background: "#ff4d4f", color: "white", padding: "0.2rem 0.5rem" }}>Cancel</button>
                                        </td>
                                    </tr>
                                ))}
                                {cartItems.length > 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>Total:</td>
                                        <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "1.2rem" }}>Rp. {totalHargaCart}</td>
                                        <td></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Amount Paid (Rp.)</label>
                            <input
                                type="number"
                                required
                                value={jumlahBayar}
                                onChange={(e) => setJumlahBayar(e.target.value)}
                                style={{ padding: "0.5rem", width: "100%", fontSize: "1.2rem" }}
                            />
                        </div>
                        {jumlahBayar && parseInt(jumlahBayar) >= totalHargaCart && (
                            <div style={{ marginBottom: "1rem", color: "green", fontWeight: "bold" }}>
                                Change: Rp. {parseInt(jumlahBayar) - totalHargaCart}
                            </div>
                        )}
                        <div className="btn-group" style={{ display: "flex", gap: "1rem" }}>
                            <button type="submit" style={{ flex: 1, padding: "1rem", fontSize: "1.1rem" }}>
                                {editingId ? "Update & Save Changes" : "Pay & Save Transaction"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (editingId) {
                                        setView("details");
                                        setEditingId(null);
                                        setJumlahBayar("");
                                        setCartItems([]);
                                    } else {
                                        setView("list");
                                        resetForm();
                                    }
                                }}
                                style={{ flex: 1, background: "#ccc", color: "#333", padding: "1rem", fontSize: "1.1rem" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                {isKasir && (
                    <button onClick={() => { setView("form"); resetForm(); setError(null); }}>
                        + New Transaction
                    </button>
                )}
            </div>

            {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

            <div className="card table-container">
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #ddd" }}>
                            <th style={{ padding: "0.5rem" }}>ID / Code</th>
                            <th style={{ padding: "0.5rem" }}>Date</th>
                            <th style={{ padding: "0.5rem" }}>Cashier</th>
                            <th style={{ padding: "0.5rem", textAlign: "right" }}>Total</th>
                            <th style={{ padding: "0.5rem", textAlign: "right" }}>Paid</th>
                            <th style={{ padding: "0.5rem", textAlign: "right" }}>Change</th>
                            {(isAdmin || isKasir) && <th style={{ padding: "0.5rem", textAlign: "center" }}>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "0.5rem" }}>
                                    <strong>{tx.kode_transaksi}</strong>
                                </td>
                                <td style={{ padding: "0.5rem" }}>{new Date(tx.tanggal).toLocaleString()}</td>
                                <td style={{ padding: "0.5rem" }}>{tx.nama_kasir || `ID: ${tx.kasir_id}`}</td>
                                <td style={{ padding: "0.5rem", textAlign: "right" }}>Rp. {tx.total_harga}</td>
                                <td style={{ padding: "0.5rem", textAlign: "right" }}>Rp. {tx.jumlah_bayar}</td>
                                <td style={{ padding: "0.5rem", textAlign: "right" }}>Rp. {tx.kembalian}</td>
                                {(isAdmin || isKasir) && (
                                    <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                        <button
                                            onClick={() => handleViewDetails(tx.id)}
                                            className="btn-view"
                                        >
                                            View
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={(isAdmin || isKasir) ? 7 : 6} style={{ padding: "1rem", textAlign: "center" }}>
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
