import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import { logout } from "./api";
import Product from "./pages/Product";
import Category from "./pages/Category";
import User from "./pages/User";
import Transaction from "./pages/Transaction";
import Search from "./pages/Search";
import Favorite from "./pages/Favorite";

function AppShell({ onRoute, onLogout, user, currentRoute, children }) {
  if (!user) return null;
  const isAdmin = user.role === "admin";
  const isKasir = user.role === "kasir";
  const [globalSearch, setGlobalSearch] = useState("");

  const handleGlobalSearch = (e) => {
    if (e.key === "Enter" && globalSearch.trim()) {
      window.location.hash = `#/search?q=${encodeURIComponent(globalSearch)}`;
    }
  };

  return (
    <div className="app-layout">
      {/* Header Navbar */}
      <header className="header-nav">
        <div className="header-top-row">
          <div className="header-left">
            <a href="#/" className="header-logo">
              STYLA
            </a>
          </div>

          <div className="header-search-container">
            <i className="ph ph-magnifying-glass" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
            <input
              className="header-search-input"
              placeholder="Search products..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={handleGlobalSearch}
              style={{ paddingRight: globalSearch ? "35px" : "10px" }}
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  boxShadow: "none",
                  padding: "4px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Clear search"
              >
                <i className="ph-fill ph-x-circle" style={{ fontSize: "1.1rem" }}></i>
              </button>
            )}
          </div>

          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                <i className="ph ph-user"></i>
              </div>
              <div className="user-info">
                <span className="user-name">{user.nama}</span>
                {(isAdmin || isKasir) && (
                  <span className="user-role badge badge-kasir" style={{ marginTop: "2px" }}>
                    {user.role}
                  </span>
                )}
              </div>
              {user.role === "pelanggan" && (
                <a href="#/favorite" title="My Favorite" style={{ color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", textDecoration: "none", transition: "var(--transition)", marginLeft: "0.5rem" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-light)"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                  <i className="ph ph-heart" style={{ fontSize: "1.6rem" }}></i>
                </a>
              )}
              <button
                onClick={onLogout}
                className="btn-outline"
                style={{ marginLeft: "0.5rem", padding: "0.4rem 0.8rem", borderColor: "var(--danger)", color: "var(--danger)" }}
                title="Logout"
              >
                <i className="ph-bold ph-sign-out"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="header-bottom-row">
          <nav className="nav-links">
            <a href="#/" className={`top-nav-item ${currentRoute === "#/" ? "active" : ""}`}>
              DASHBOARD
            </a>

            <a href="#/product" className={`top-nav-item ${currentRoute.startsWith("#/product") ? "active" : ""}`}>
              PRODUCTS
            </a>

            {(isAdmin || isKasir) && (
              <a href="#/transaction" className={`top-nav-item ${currentRoute === "#/transaction" ? "active" : ""}`}>
                TRANSACTIONS
              </a>
            )}

            {isAdmin && (
              <>
                <a href="#/category" className={`top-nav-item ${currentRoute === "#/category" ? "active" : ""}`}>
                  CATEGORIES
                </a>
                <a href="#/user" className={`top-nav-item ${currentRoute === "#/user" ? "active" : ""}`}>
                  USERS
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content wrapper */}
      <div className="main-content">
        <main className="page-container">
          {children}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <a href="#/" className="header-logo" style={{ color: "#ffffff" }}>
                STYLA
              </a>
              <div style={{ marginTop: "1rem" }}>
                <p style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <i className="ph-fill ph-map-pin" style={{ color: "#a3a3a3", marginTop: "4px" }}></i>
                  <span>Jl. Merdeka No. 123, South Jakarta<br />DKI Jakarta, 12190</span>
                </p>
                <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <i className="ph-fill ph-phone" style={{ color: "#a3a3a3" }}></i>
                  <span>+62 812-3456-7890</span>
                </p>
                <p style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="ph-fill ph-envelope-simple" style={{ color: "#a3a3a3" }}></i>
                  <span>hello@styla.com</span>
                </p>
              </div>
            </div>

            <div className="footer-links">
              <h4>Navigation</h4>
              <a href="#/">Dashboard</a>
              <a href="#/product">Products</a>
              {(isAdmin || isKasir) && <a href="#/transaction">Transactions</a>}
              {isAdmin && <a href="#/category">Categories</a>}
              {isAdmin && <a href="#/user">Users</a>}
            </div>

            <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="#"><i className="ph-fill ph-whatsapp-logo"></i></a>
                <a href="#"><i className="ph-fill ph-instagram-logo"></i></a>
                <a href="#"><i className="ph-fill ph-facebook-logo"></i></a>
                <a href="#"><i className="ph-fill ph-twitter-logo"></i></a>
              </div>
            </div>

            <div className="footer-subscribe">
              <h4>Subscribe to Newsletter</h4>
              <p style={{ fontSize: "0.85rem", marginBottom: "0.8rem" }}>Get the latest updates on system & products.</p>
              <div className="subscribe-form">
                <input type="email" placeholder="Your Email..." style={{ paddingLeft: "15px" }} />
                <button type="button">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} STYLA. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Basic Dashboard View Component
function DashboardView({ user }) {
  return (
    <div>
      <a className="dashboard-hero" href="#/product">
        <img src="/styla_Hero.png" alt="STYLA Banner" className="hero-img" />
      </a>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash || "#/");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Invalid user data in localStorage");
      }
    }

    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleRoute = (r) => {
    window.location.hash = r;
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
      <Login
        onLogin={(u) => {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          window.location.hash = "#/";
        }}
      />
    );
  }

  // Router switch equivalent
  let pageContent = <DashboardView user={user} />;
  if (route.startsWith("#/product")) pageContent = <Product user={user} />;
  else if (route === "#/category") pageContent = <div className="roboto-content"><Category user={user} /></div>;
  else if (route === "#/user") pageContent = <div className="roboto-content"><User user={user} /></div>;
  else if (route === "#/transaction") pageContent = <div className="roboto-content"><Transaction user={user} /></div>;
  else if (route.startsWith("#/search")) pageContent = <div className="roboto-content"><Search user={user} /></div>;
  else if (route === "#/favorite") pageContent = <div className="roboto-content"><Favorite user={user} /></div>;

  return (
    <AppShell onRoute={handleRoute} onLogout={handleLogout} user={user} currentRoute={route}>
      {pageContent}
    </AppShell>
  );
}
