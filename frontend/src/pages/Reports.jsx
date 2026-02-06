import React, { useEffect, useState } from "react";
import { getSalesReport } from "../api";

export default function Reports() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReport();
    }, []);

    async function loadReport() {
        try {
            const report = await getSalesReport();
            setData(report);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--secondary)" }}>
                Loading report...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "20px", color: "var(--danger)", backgroundColor: "#fee2e2", borderRadius: "8px" }}>
                Error: {error}
            </div>
        );
    }

    const isPositiveChange = data.percentageChange >= 0;

    return (
        <div>
            <h3 style={{ color: "var(--primary-dark)", marginBottom: "var(--spacing-lg)" }}>
                Sales Report
            </h3>

            {/* Revenue Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "30px"
            }}>
                {/* Total Revenue */}
                <div className="card" style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    padding: "24px"
                }}>
                    <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "0.875rem", color: "var(--secondary)", fontWeight: "500" }}>
                            Total Revenue
                        </div>
                    </div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "var(--primary-dark)" }}>
                        Rp {data.totalRevenue.toLocaleString()}
                    </div>
                </div>

                {/* Today's Revenue */}
                <div className="card" style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    padding: "24px"
                }}>
                    <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "0.875rem", color: "var(--secondary)", fontWeight: "500" }}>
                            Today's Revenue
                        </div>
                    </div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "var(--primary-dark)" }}>
                        Rp {data.todayRevenue.toLocaleString()}
                    </div>
                </div>

                {/* Daily Change */}
                <div className="card" style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    padding: "24px"
                }}>
                    <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "0.875rem", color: "var(--secondary)", fontWeight: "500" }}>
                            Daily Change
                        </div>
                    </div>
                    <div style={{
                        fontSize: "1.75rem",
                        fontWeight: "bold",
                        color: isPositiveChange ? "#22c55e" : "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{
                            transform: isPositiveChange ? "rotate(0deg)" : "rotate(180deg) scaleX(-1)",
                            transition: "transform 0.3s"
                        }}>
                            <path d="M3 17 L9 11 L13 15 L21 7" />
                            <polyline points="15 7 21 7 21 13" />
                        </svg>
                        {Math.abs(data.percentageChange).toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Best Seller Card */}
            {data.bestSeller ? (
                <div className="card" style={{ background: "white", border: "1px solid #e2e8f0" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <h4 style={{ margin: 0, color: "var(--primary-dark)", fontWeight: "600" }}>
                            Best Selling Product
                        </h4>
                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "24px",
                        flexWrap: "wrap"
                    }}>
                        {/* Product Image */}
                        <div style={{
                            width: window.innerWidth <= 480 ? "100%" : "120px",
                            height: "120px",
                            borderRadius: "12px",
                            overflow: "hidden",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0"
                        }}>
                            {data.bestSeller.image ? (
                                <img
                                    src={`http://localhost:3000${data.bestSeller.image}`}
                                    alt={data.bestSeller.nama_produk}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=300&auto=format&fit=crop";
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "2.5rem"
                                }}>

                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div style={{ flex: 1, minWidth: "200px" }}>
                            <h3 style={{ margin: "0 0 16px 0", color: "var(--primary-dark)", fontSize: "1.25rem" }}>
                                {data.bestSeller.nama_produk}
                            </h3>
                            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                                <div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Units Sold
                                    </div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
                                        {data.bestSeller.total_qty}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Total Revenue
                                    </div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#22c55e" }}>
                                        Rp {data.bestSeller.total_revenue.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--secondary)", background: "white", border: "1px solid #e2e8f0" }}>
                    No sales data available
                </div>
            )}
        </div>
    );
}
