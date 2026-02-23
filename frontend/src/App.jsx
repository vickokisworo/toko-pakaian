import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import { logout } from "./api";

function Nav({ onRoute, onLogout, user }) {
  if (!user) return null;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "white",
        padding: "5px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <button onClick={() => onRoute("#/")} className="nav-link-custom">Dashboard</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: "1.2" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{user.nama}</span>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", textTransform: "capitalize" }}>{user.role}</span>
        </div>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "6px 14px",
            border: "none",
            borderRadius: "20px",
            fontWeight: "bold",
            fontSize: "0.85rem",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      <style>{`
          .nav-link-custom {
            background: transparent;
            color: rgba(255,255,255,0.8);
            border: none;
            font-size: 1rem;
            font-weight: 500;
            padding: 5px 0;
            position: relative;
            cursor: pointer;
          }
          .nav-link-custom:hover { color: white; }
          .nav-link-custom::after {
             content: '';
             position: absolute;
             width: 0;
             height: 2px;
             bottom: 0;
             left: 0;
             background-color: white;
             transition: width 0.3s;
          }
          .nav-link-custom:hover::after { width: 100%; }
        `}</style>
    </nav>
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav onRoute={handleRoute} onLogout={handleLogout} user={user} />
    </div>
  );
}
