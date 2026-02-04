import React, { useEffect, useState } from "react";
import {
  getProducts,
  createTransaction,
  getTransactions,
  getTransactionDetail,
  updateTransaction,
} from "../api";

export default function Transactions({ user }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editingCart, setEditingCart] = useState(null);
  const [txSearch, setTxSearch] = useState("");

  const userRole =
    user?.role || localStorage.getItem("userRole") || "pelanggan";

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const p = await getProducts();
      setProducts(p || []);
      const t = await getTransactions();
      setTransactions(t || []);
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
    if (jumlahBayar <= 0) {
      setError("Jumlah bayar harus lebih dari 0");
      return;
    }

    try {
      const payload = {
        jumlah_bayar: Number(jumlahBayar),
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
    } catch (e) {
      setError(e.message);
    }
  };

  const totalPrice = cart.reduce((sum, c) => sum + c.qty * c.harga_satuan, 0);
  const change = jumlahBayar - totalPrice;

  const canManageAllTransactions = userRole === "admin" || userRole === "kasir";
  const isPelanggan = userRole === "pelanggan";

  return (
    <div>
      <h3>Transactions</h3>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Cari transaksi by id"
          value={txSearch}
          onChange={(e) => setTxSearch(e.target.value)}
          style={{ padding: 6, width: 180, marginRight: 8 }}
        />
        <button
          onClick={async () => {
            if (!txSearch) return loadData();
            try {
              const d = await getTransactionDetail(txSearch);
              setTransactions(d ? [d] : []);
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
            setTxSearch("");
            loadData();
          }}
          style={{ padding: 6, marginLeft: 8 }}
        >
          Clear
        </button>
      </div>

      {/* Sidebar untuk create/edit transaction */}
      <div style={{ display: "flex", gap: 20 }}>
        {!isPelanggan && (
          <>
            <div style={{ flex: 1 }}>
              <h4>Products</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 10,
                }}
              >
                {products.map((p) => (
                  <div key={p.id} className="card" style={{ padding: 10 }}>
                    <strong>{p.nama_produk}</strong>
                    <div>Rp {p.harga?.toLocaleString()}</div>
                    <div style={{ fontSize: "0.8em", color: "#666" }}>
                      Stok: {p.stok}
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      style={{
                        marginTop: 8,
                        backgroundColor: "#4CAF50",
                        color: "white",
                        padding: 5,
                        width: "100%",
                      }}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div style={{ width: 350, border: "1px solid #ddd", padding: 15 }}>
              <h4>Cart</h4>
              {cart.length === 0 ? (
                <div style={{ color: "#666" }}>Keranjang kosong</div>
              ) : (
                <>
                  {cart.map((c) => (
                    <div
                      key={c.product_id}
                      style={{
                        marginBottom: 10,
                        padding: 8,
                        backgroundColor: "#f9f9f9",
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <strong>{c.nama}</strong>
                        <button
                          onClick={() => removeFromCart(c.product_id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "red",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ fontSize: "0.9em", marginBottom: 5 }}>
                        Harga: Rp {c.harga_satuan?.toLocaleString()}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <button
                          onClick={() => updateCartQty(c.product_id, c.qty - 1)}
                          style={{ width: 30, padding: 2 }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={c.qty}
                          onChange={(e) =>
                            updateCartQty(
                              c.product_id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          style={{ width: 50, padding: 2 }}
                        />
                        <button
                          onClick={() => updateCartQty(c.product_id, c.qty + 1)}
                          style={{ width: 30, padding: 2 }}
                        >
                          +
                        </button>
                        <span
                          style={{ marginLeft: "auto", fontWeight: "bold" }}
                        >
                          Rp {(c.qty * c.harga_satuan)?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div
                    style={{
                      borderTop: "2px solid #ddd",
                      paddingTop: 10,
                      marginTop: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.1em",
                        fontWeight: "bold",
                        marginBottom: 10,
                      }}
                    >
                      Total: Rp {totalPrice?.toLocaleString()}
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <label>Jumlah Bayar</label>
                      <input
                        type="number"
                        value={jumlahBayar}
                        onChange={(e) => setJumlahBayar(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                      />
                    </div>

                    {jumlahBayar > 0 && (
                      <div
                        style={{
                          marginBottom: 10,
                          backgroundColor: change < 0 ? "#ffebee" : "#e8f5e9",
                          padding: 10,
                          borderRadius: 4,
                        }}
                      >
                        {change < 0 ? (
                          <div style={{ color: "red" }}>
                            Kurang: Rp {Math.abs(change)?.toLocaleString()}
                          </div>
                        ) : (
                          <div style={{ color: "green" }}>
                            Kembalian: Rp {change?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={cart.length === 0 || change < 0}
                      style={{
                        width: "100%",
                        padding: 10,
                        backgroundColor: "#2196F3",
                        color: "white",
                        fontWeight: "bold",
                        cursor:
                          cart.length === 0 || change < 0
                            ? "not-allowed"
                            : "pointer",
                        opacity: cart.length === 0 || change < 0 ? 0.5 : 1,
                      }}
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Transaction History */}
      <div style={{ marginTop: 30 }}>
        <h4>
          {canManageAllTransactions ? "Transaction History" : "My Transactions"}
        </h4>
        {transactions.length === 0 ? (
          <div style={{ color: "#666" }}>Belum ada transaksi</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 15,
            }}
          >
            {transactions.map((t) => (
              <div
                key={t.id}
                className="card"
                style={{ padding: 15, cursor: "pointer" }}
              >
                <div>
                  <strong>Kode: {t.kode_transaksi}</strong>
                </div>
                <div>Total: Rp {t.total_harga?.toLocaleString()}</div>
                <div>Bayar: Rp {t.jumlah_bayar?.toLocaleString()}</div>
                {t.kembalian > 0 && (
                  <div>Kembalian: Rp {t.kembalian?.toLocaleString()}</div>
                )}
                <div style={{ fontSize: "0.9em", color: "#666", marginTop: 5 }}>
                  {new Date(t.tanggal).toLocaleString()}
                </div>
                <button
                  onClick={() => setSelectedTransaction(t)}
                  style={{
                    marginTop: 10,
                    backgroundColor: "#2196F3",
                    color: "white",
                    padding: 5,
                    width: "100%",
                  }}
                >
                  View Detail
                </button>
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
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              maxWidth: 500,
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Transaction Detail</h3>
            <div>
              <strong>Kode:</strong> {selectedTransaction.kode_transaksi}
            </div>
            <div>
              <strong>Total:</strong> Rp{" "}
              {selectedTransaction.total_harga?.toLocaleString()}
            </div>
            <div>
              <strong>Bayar:</strong> Rp{" "}
              {selectedTransaction.jumlah_bayar?.toLocaleString()}
            </div>
            <div>
              <strong>Kembalian:</strong> Rp{" "}
              {selectedTransaction.kembalian?.toLocaleString()}
            </div>
            <div>
              <strong>Tanggal:</strong>{" "}
              {new Date(selectedTransaction.tanggal).toLocaleString()}
            </div>
            <button
              onClick={() => setSelectedTransaction(null)}
              style={{
                marginTop: 15,
                padding: 10,
                backgroundColor: "#ccc",
                width: "100%",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
