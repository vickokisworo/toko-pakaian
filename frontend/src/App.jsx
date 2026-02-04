import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import { logout } from "./api";

function Nav({ onRoute, onLogout, user }) {
  if (!user) return null;

  return (
    <nav
      className="nav"
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#2c3e50",
        color: "white",
        padding: "10px 20px",
        gap: 10,
      }}
    >
      <button onClick={() => onRoute("#/")} style={{ padding: 10 }}>
        Dashboard
      </button>
      <button onClick={() => onRoute("#/products")} style={{ padding: 10 }}>
        Products
      </button>
      <button onClick={() => onRoute("#/categories")} style={{ padding: 10 }}>
        Categories
      </button>
      <button onClick={() => onRoute("#/transactions")} style={{ padding: 10 }}>
        Transactions
      </button>
      {user?.role === "admin" && (
        <button onClick={() => onRoute("#/users")} style={{ padding: 10 }}>
          Users
        </button>
      )}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 15,
        }}
      >
        {user && (
          <>
            <span>
              👤 {user.nama}{" "}
              <span style={{ fontSize: "0.9em", opacity: 0.8 }}>
                ({user.role})
              </span>
            </span>
            <button
              onClick={onLogout}
              style={{
                padding: "8px 15px",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash || "#/");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage on mount
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleRoute = (r) => {
    window.location.hash = r.replace(/^#?/, "#");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setUser(null);
    window.location.hash = "#/login";
  };

  if (route === "#/login" || !sessionStorage.getItem("accessToken")) {
    return (
      <div className="container">
        <Login
          onLogin={(u) => {
            setUser(u);
            localStorage.setItem("user", JSON.stringify(u));
            window.location.hash = "#/";
          }}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <Nav onRoute={handleRoute} onLogout={handleLogout} user={user} />
      <main style={{ padding: 20 }}>
        {route === "#/" && (
          <div>
            <h2>Welcome to Toko Dashboard</h2>
            <p>
              Logged in as: <strong>{user?.nama}</strong> ({user?.role})
            </p>
            {user?.role === "admin" && (
              <div
                style={{
                  marginTop: 20,
                  backgroundColor: "#fff3cd",
                  padding: 15,
                  borderRadius: 5,
                }}
              >
                <strong>Admin Panel</strong>
                <p>
                  You have full access to manage products, categories, users,
                  and transactions.
                </p>
              </div>
            )}
            {user?.role === "kasir" && (
              <div
                style={{
                  marginTop: 20,
                  backgroundColor: "#d1ecf1",
                  padding: 15,
                  borderRadius: 5,
                }}
              >
                <strong>Kasir Panel</strong>
                <p>
                  You can create and manage transactions, and view product
                  catalog.
                </p>
              </div>
            )}
            {user?.role === "pelanggan" && (
              <div
                style={{
                  marginTop: 20,
                  backgroundColor: "#d4edda",
                  padding: 15,
                  borderRadius: 5,
                }}
              >
                <strong>Customer Dashboard</strong>
                <p>
                  You can browse products, create transactions, and view your
                  orders.
                </p>
              </div>
            )}
          </div>
        )}
        {route === "#/products" && <Products />}
        {route === "#/categories" && <Categories />}
        {route === "#/transactions" && <Transactions user={user} />}
        {route === "#/users" && user?.role === "admin" && <Users />}
        {route === "#/users" && user?.role !== "admin" && (
          <div style={{ color: "red" }}>
            Access Denied: Only Admin can access Users page
          </div>
        )}
      </main>
    </div>
  );
}
