import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import { logout } from "./api";
import Product from "./pages/Product";

function Nav({ onRoute, onLogout, user }) {
  if (!user) return null;

  return (
    <nav>
      <h2>Toko Pakaian</h2>
      <div>
        <button onClick={() => onRoute("#/")}>Dashboard</button>
      </div>

      <div>
        <button onClick={() => onRoute("#/product")}>Product</button>
      </div>

      <div>
        <div>
          <span>{user.nama}</span>
          <span>{user.role}</span>
        </div>
        <button
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
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
      <div>
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
    <div>
      <Nav onRoute={handleRoute} onLogout={handleLogout} user={user} />
      <div>
        {route === "#/product" && <Product />}
      </div>
    </div>
  );
}
