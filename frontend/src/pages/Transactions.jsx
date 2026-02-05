import React, { useEffect, useState } from "react";
import {
  getProducts,
  createTransaction,
  updateTransaction,
  getTransactions,
  getTransactionDetail,
  getCategories,
} from "../api";

export default function Transactions({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editingTransactionId, setEditingTransactionId] = useState(null); // New state for edit mode
  const [txSearch, setTxSearch] = useState("");

  const userRole =
    user?.role || localStorage.getItem("userRole") || "pelanggan";

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [p, t, c] = await Promise.all([
        getProducts(),
        getTransactions(),
        getCategories(),
      ]);
      setProducts(p || []);
      setTransactions(t || []);
      setCategories(c || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.product_id === product.id);
      if (found)
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [
        ...prev,
        {
          product_id: product.id,
          qty: 1,
          harga_satuan: product.harga,
          nama: product.nama_produk,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, qty } : i)),
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Cart kosong");
      return;
    }

    const totalPrice = cart.reduce((sum, c) => sum + c.qty * c.harga_satuan, 0);
    const paymentAmount = Number(jumlahBayar);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Jumlah bayar harus lebih dari 0");
      return;
    }

    if (paymentAmount < totalPrice) {
      setError(`Jumlah bayar kurang. Total: Rp ${totalPrice.toLocaleString()}`);
      return;
    }

    try {
      const payload = {
        jumlah_bayar: paymentAmount,
        items: cart.map((c) => ({
          product_id: c.product_id,
          qty: c.qty,
          harga_satuan: c.harga_satuan,
        })),
      };
      const res = await createTransaction(payload);
      alert("Transaksi sukses! Kode: " + res.transaksi.kode_transaksi);
      setTransactions((prev) => [res.transaksi, ...prev]);
      setCart([]);
      setJumlahBayar(0);
      setError(null);
      loadData(); // Reload to get updated data
    } catch (e) {
      setError(e.message);
    }
  };

  const handleStartEdit = async (transaction) => {
    try {
      // Fetch fresh details with items
      const detail = await getTransactionDetail(transaction.id);

      // Populate cart with existing items
      setCart(detail.items.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        harga_satuan: item.harga_satuan,
        nama: item.nama_produk || "Product " + item.product_id
      })));

      setJumlahBayar(detail.jumlah_bayar);
      setEditingTransactionId(transaction.id);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError("Failed to load transaction for editing: " + e.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setCart([]);
    setJumlahBayar(0);
  };

  const handleUpdateTransaction = async () => {
    if (cart.length === 0) {
      setError("Cart kosong");
      return;
    }

    const totalPrice = cart.reduce((sum, c) => sum + c.qty * c.harga_satuan, 0);
    const paymentAmount = Number(jumlahBayar);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Jumlah bayar harus lebih dari 0");
      return;
    }

    if (paymentAmount < totalPrice) {
      setError(`Jumlah bayar kurang. Total: Rp ${totalPrice.toLocaleString()}`);
      return;
    }

    try {
      const payload = {
        jumlah_bayar: paymentAmount,
        items: cart.map((c) => ({
          product_id: c.product_id,
          qty: c.qty,
          harga_satuan: c.harga_satuan,
        })),
      };

      const res = await updateTransaction(editingTransactionId, payload);
      alert("Update sukses!");

      // Refresh list
      loadData();

      // Reset edit mode
      handleCancelEdit();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSearch = async () => {
    if (!txSearch.trim()) {
      loadData();
      return;
    }

    const searchId = parseInt(txSearch);
    if (isNaN(searchId)) {
      setError("ID transaksi harus berupa angka");
      return;
    }

    try {
      const d = await getTransactionDetail(searchId);
      setTransactions(d ? [d] : []);
      setError(null);
    } catch (e) {
      setError(e.message);
      setTransactions([]);
    }
  };

  const handleClearSearch = () => {
    setTxSearch("");
    setError(null);
    loadData();
  };

  const totalPrice = cart.reduce((sum, c) => sum + c.qty * c.harga_satuan, 0);
  const change = jumlahBayar - totalPrice;

  const canManageAllTransactions = userRole === "admin" || userRole === "kasir";
  const isPelanggan = userRole === "pelanggan";

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.kategori_id === selectedCategory)
    : products;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ margin: 0, color: "var(--primary-dark)" }}>Transactions</h3>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            placeholder="Search ID (Number)"
            value={txSearch}
            onChange={(e) => setTxSearch(e.target.value)}
            type="text"
            style={{ width: 150 }}
          />
          <button onClick={handleSearch} style={{ backgroundColor: "var(--secondary)", color: "white", border: "none" }}>
            Search
          </button>
          <button onClick={handleClearSearch} style={{ backgroundColor: "transparent", color: "var(--secondary)", border: "1px solid var(--secondary)" }}>
            Clear
          </button>
        </div>
      </div>

      {error && <div style={{ color: "var(--danger)", marginBottom: 10, padding: 8, backgroundColor: "#fee2e2", borderRadius: 4 }}>{error}</div>}

      {/* Main Layout: Stack on mobile, Side-by-side on desktop */}
      <div style={{ display: "flex", gap: "var(--spacing-lg)", flexDirection: "row", flexWrap: "wrap" }}>

        {!isPelanggan && userRole !== "admin" && (
          <>
            {/* Products Column */}
            <div style={{ flex: "2 1 500px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)" }}>
                <h4 style={{ margin: 0 }}>Available Products</h4>
                {/* Category Filter Chips */}
                <div style={{ display: "flex", gap: 8, overflowX: "auto", maxWidth: "60%", paddingBottom: 4 }}>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: "1px solid var(--primary)",
                      backgroundColor: selectedCategory === null ? "var(--primary)" : "white",
                      color: selectedCategory === null ? "white" : "var(--primary)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    All
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: "1px solid var(--primary)",
                        backgroundColor: selectedCategory === c.id ? "var(--primary)" : "white",
                        color: selectedCategory === c.id ? "white" : "var(--primary)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {c.nama_kategori}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="grid-responsive"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", // Wider cards for landscape feel
                  gap: "var(--spacing-md)",
                }}
              >
                {filteredProducts.map((p) => (
                  <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {/* Placeholder Image */}
                    <div style={{ height: "140px", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ color: "#94a3b8", fontSize: "2rem" }}>📷</span>
                    </div>

                    <div style={{ padding: "var(--spacing-md)", flex: 1, display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: "1.05rem", marginBottom: 4 }}>{p.nama_produk}</strong>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ color: "var(--primary)", fontWeight: "bold" }}>Rp {p.harga?.toLocaleString()}</span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                          {p.nama_kategori}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.85em", color: "var(--secondary)", marginBottom: "auto" }}>
                        Stok: {p.stok}
                      </div>

                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stok <= 0}
                        style={{
                          marginTop: "var(--spacing-sm)",
                          backgroundColor: p.stok <= 0 ? "#cbd5e1" : "var(--success)",
                          color: "white",
                          padding: "8px",
                          width: "100%",
                          border: "none",
                          borderRadius: "var(--radius-sm)",
                          cursor: p.stok <= 0 ? "not-allowed" : "pointer"
                        }}
                      >
                        {p.stok <= 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Column */}
            <div className="card" style={{ flex: "1 1 300px", height: "fit-content", padding: "var(--spacing-md)", border: editingTransactionId ? "2px solid var(--warning)" : undefined }}>
              <h4 style={{ marginTop: 0 }}>
                {editingTransactionId ? `Editing Transaction #${transactions.find(t => t.id === editingTransactionId)?.kode_transaksi}` : "Current Cart"}
              </h4>
              {cart.length === 0 ? (
                <div style={{ color: "var(--secondary)", padding: "20px 0", textAlign: "center" }}>Cart is empty</div>
              ) : (
                <>
                  <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "5px" }}>
                    {cart.map((c) => (
                      <div
                        key={c.product_id}
                        style={{
                          marginBottom: 10,
                          padding: 8,
                          backgroundColor: "var(--background)",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #e2e8f0"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <strong style={{ fontSize: "0.95rem" }}>{c.nama}</strong>
                          <button
                            onClick={() => removeFromCart(c.product_id)}
                            style={{ background: "none", border: "none", color: "var(--danger)", padding: 0, fontSize: "1.2rem", lineHeight: 1 }}
                          >
                            &times;
                          </button>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: 4 }}>
                            <button
                              onClick={() => updateCartQty(c.product_id, c.qty - 1)}
                              style={{ width: 28, padding: 0, height: 28, background: "none", border: "none" }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={c.qty}
                              onChange={(e) => updateCartQty(c.product_id, parseInt(e.target.value) || 0)}
                              style={{ width: 40, padding: 0, textAlign: "center", border: "none", background: "transparent", margin: 0 }}
                              min="1"
                            />
                            <button
                              onClick={() => updateCartQty(c.product_id, c.qty + 1)}
                              style={{ width: 28, padding: 0, height: 28, background: "none", border: "none" }}
                            >
                              +
                            </button>
                          </div>
                          <span style={{ marginLeft: "auto", fontWeight: "bold", color: "var(--primary)" }}>
                            Rp {(c.qty * c.harga_satuan)?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: 10, marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "bold", marginBottom: 15 }}>
                      <span>Total:</span>
                      <span>Rp {totalPrice?.toLocaleString()}</span>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                      <label style={{ fontSize: "0.9rem", color: "var(--secondary)" }}>Amount Paid</label>
                      <input
                        type="number"
                        value={jumlahBayar}
                        onChange={(e) => setJumlahBayar(e.target.value)}
                        style={{ marginTop: 4 }}
                        min="0"
                      />
                    </div>

                    {jumlahBayar > 0 && (
                      <div
                        style={{
                          marginBottom: 10,
                          backgroundColor: change < 0 ? "#fee2e2" : "#dcfce7",
                          padding: 10,
                          borderRadius: 4,
                          fontSize: "0.9rem"
                        }}
                      >
                        {change < 0 ? (
                          <div style={{ color: "var(--danger)" }}>Deficit: Rp {Math.abs(change)?.toLocaleString()}</div>
                        ) : (
                          <div style={{ color: "var(--success)" }}>Change: Rp {change?.toLocaleString()}</div>
                        )}
                      </div>
                    )}

                    {editingTransactionId ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={handleUpdateTransaction}
                          disabled={cart.length === 0 || change < 0}
                          style={{
                            flex: 1,
                            padding: 12,
                            backgroundColor: "var(--warning)",
                            color: "black",
                            border: "none",
                            fontWeight: "bold",
                            cursor: cart.length === 0 || change < 0 ? "not-allowed" : "pointer",
                            opacity: cart.length === 0 || change < 0 ? 0.6 : 1,
                          }}
                        >
                          Update Transaction
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: 12,
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || change < 0}
                        style={{
                          width: "100%",
                          padding: 12,
                          backgroundColor: "var(--primary)",
                          color: "white",
                          border: "none",
                          cursor: cart.length === 0 || change < 0 ? "not-allowed" : "pointer",
                          opacity: cart.length === 0 || change < 0 ? 0.6 : 1,
                        }}
                      >
                        Process Checkout
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Transaction History Section */}
      <div style={{ marginTop: "var(--spacing-xl)" }}>
        <h4 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
          {canManageAllTransactions ? "Transaction History" : "My Transactions"}
        </h4>

        {transactions.length === 0 ? (
          <div style={{ color: "var(--secondary)", fontStyle: "italic" }}>No transactions found</div>
        ) : (
          <div className="grid-responsive" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {transactions.map((t) => (
              <div key={t.id} className="card" style={{ padding: "var(--spacing-md)", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <strong>#{t.kode_transaksi}</strong>
                  <span style={{ fontSize: "0.8em", color: "var(--secondary)" }}>
                    {new Date(t.tanggal).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "var(--secondary)" }}>Total:</span>
                  <strong>Rp {t.total_harga?.toLocaleString()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "var(--secondary)" }}>Paid:</span>
                  <span>Rp {t.jumlah_bayar?.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => setSelectedTransaction(t)}
                  style={{
                    marginTop: 12,
                    backgroundColor: "transparent",
                    color: "var(--primary)",
                    border: "1px solid var(--primary)",
                    padding: "6px",
                    width: "100%",
                    fontSize: "0.9rem"
                  }}
                >
                  View Details
                </button>

                {canManageAllTransactions && (
                  <button
                    onClick={() => handleStartEdit(t)}
                    style={{
                      marginTop: 8,
                      backgroundColor: "var(--warning)",
                      color: "black",
                      border: "none",
                      padding: "6px",
                      width: "100%",
                      fontSize: "0.9rem",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTransaction && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 500,
              maxHeight: "90vh",
              overflow: "auto",
              padding: 0, // Reset padding for custom header
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--background)" }}>
              <h3 style={{ margin: 0 }}>Transaction Details</h3>
              <button onClick={() => setSelectedTransaction(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>Transaction Code</div>
                  <div style={{ fontWeight: "bold" }}>{selectedTransaction.kode_transaksi}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>Date</div>
                  <div style={{ fontWeight: "bold" }}>{new Date(selectedTransaction.tanggal).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ backgroundColor: "var(--background)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span>Total Amount</span>
                  <strong>Rp {selectedTransaction.total_harga?.toLocaleString()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span>Amount Paid</span>
                  <span>Rp {selectedTransaction.jumlah_bayar?.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #cbd5e1", paddingTop: 8 }}>
                  <span>Change</span>
                  <span style={{ color: "var(--success)", fontWeight: "bold" }}>Rp {selectedTransaction.kembalian?.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "var(--secondary)",
                  color: "white",
                  border: "none",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
