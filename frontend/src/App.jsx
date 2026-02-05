import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import { logout } from "./api";

// --- Internal Component: Trending Slider ---
function TrendingSlider() {
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      title: "Summer Collection 2024",
      subtitle: "Discover the hottest trends for the season.",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      title: "Exclusive Accessories",
      subtitle: "Complete your look with our premium selection.",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
      title: "Urban Streetwear",
      subtitle: "Style that speaks your personality.",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop",
      title: "Elegant Evening Wear",
      subtitle: "Shine bright on your special nights.",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop",
      title: "Casual Comfort",
      subtitle: "Everyday essentials for everyone.",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000); // Swipe every 4 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: index === current ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "white",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
            {slide.title}
          </h1>
          <p style={{ fontSize: "1.5rem", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{slide.subtitle}</p>
        </div>
      ))}

      {/* Dots Indicator */}
      <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px" }}>
        {slides.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: idx === current ? "white" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Nav({ onRoute, onLogout, user, route }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Add scroll listener to make nav background solid when scrolling down
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!user) return null;

  const isDashboard = route === "#/";

  const handleNavClick = (route) => {
    onRoute(route);
    setMenuOpen(false);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: isDashboard
          ? (scrolled ? "rgba(0,0,0,0.9)" : "transparent")
          : "#374151", // Solid dark grey for other pages
        color: "white",
        padding: "15px 30px",
        transition: "background-color 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo Left */}
      <div style={{ fontSize: "1.5rem", fontWeight: "bold", zIndex: 1002, display: "flex", alignItems: "center", gap: "10px" }}>
        <span>Vicko Store</span>
      </div>

      {/* Mobile Toggle */}
      <button
        className="mobile-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "none",
          background: "transparent",
          border: "none",
          color: "white",
          fontSize: "1.5rem",
          zIndex: 1002,
          cursor: "pointer"
        }}
      >
        ☰
      </button>

      {/* Centered Navigation */}
      <div
        className={`nav-items ${menuOpen ? "open" : ""}`}
        style={{
          position: "absolute", // Center strictly
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "30px",
          alignItems: "center"
        }}
      >
        <button onClick={() => handleNavClick("#/")} className="nav-link-custom">Dashboard</button>
        <button onClick={() => handleNavClick("#/products")} className="nav-link-custom">Products</button>
        <button onClick={() => handleNavClick("#/categories")} className="nav-link-custom">Categories</button>
        {user?.role !== "pelanggan" && (
          <button onClick={() => handleNavClick("#/transactions")} className="nav-link-custom">Transactions</button>
        )}
        {user?.role === "admin" && (
          <button onClick={() => handleNavClick("#/users")} className="nav-link-custom">Users</button>
        )}
      </div>

      {/* User / Logout Right */}
      <div className={`nav-user ${menuOpen ? "open" : ""}`} style={{ zIndex: 1002, display: "flex", alignItems: "center", gap: "15px", marginRight: "50px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: "1.2" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "white" }}>
            {user.nama}
          </span>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", textTransform: "capitalize" }}>
            {user.role}
          </span>
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
            fontSize: "0.85rem"
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
            transition: color 0.3s;
          }
          .nav-link-custom:hover {
             color: white;
          }
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
          .nav-link-custom:hover::after {
             width: 100%;
          }

          @media (max-width: 768px) {
            .mobile-toggle { display: block !important; }
            
            /* Navbar items container becomes full screen overlay on mobile */
            .nav-items {
               display: none; /* hidden by default */
               position: fixed !important;
               top: 0;
               left: 0;
               width: 100%;
               height: 100vh;
               background-color: rgba(0,0,0,0.95);
               flex-direction: column;
               justify-content: center;
               transform: none !important; /* Remove centering transform */
               gap: 20px !important;
               z-index: 1001;
            }

            /* Show items when open */
            .nav-items.open {
               display: flex !important;
            }
            
            /* User section also moves into overlay or hides */
            .nav-user {
               display: none !important; /* Hide direct user section on mobile header */
            }
            
            /* Maybe add user info inside the mobile menu if needed, simplified for now */
          }
        `}</style>
    </nav>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash || "#/");
  const [user, setUser] = useState(null);

  useEffect(() => {
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
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background)"
      }}>
        <div className="container" style={{ width: "100%", maxWidth: "450px" }}>
          <Login
            onLogin={(u) => {
              setUser(u);
              localStorage.setItem("user", JSON.stringify(u));
              window.location.hash = "#/";
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav onRoute={handleRoute} onLogout={handleLogout} user={user} route={route} />

      {/* Main Content Area */}
      <main style={{ flex: 1, marginTop: route === "#/" ? 0 : "80px" }}> {/* Remove margin on Dashboard for fullscreen slider */}
        {route === "#/" && (
          <>
            {/* Full Screen Trending Slider */}
            <TrendingSlider />
          </>
        )}

        {route !== "#/" && (
          <div className="container">
            {route === "#/products" && <Products />}
            {route === "#/categories" && <Categories />}
            {route === "#/transactions" && user?.role !== "pelanggan" && (
              <Transactions user={user} />
            )}
            {route === "#/transactions" && user?.role === "pelanggan" && (
              <div className="card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
                Access Denied: Customers cannot access partial Transactions page.
              </div>
            )}
            {route === "#/users" && user?.role === "admin" && <Users />}
            {route === "#/users" && user?.role !== "admin" && (
              <div className="card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
                Access Denied: Only Admin can access Users page
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{
        padding: "40px 20px",
        backgroundColor: "#4b5563", // Gray-600
        color: "white",
        marginTop: "auto"
      }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px", textAlign: "left" }}>

          {/* Store Information in Footer */}
          <div>
            <h4 style={{ color: "#60a5fa", marginBottom: "15px", fontSize: "1.2rem" }}>📍 Store Location</h4>
            <p style={{ margin: "5px 0", color: "#cbd5e1" }}>Jl. Teknologi No. 123</p>
            <p style={{ margin: "5px 0", color: "#cbd5e1" }}>Digital City, Tech Valley</p>
            <p style={{ margin: "5px 0", color: "#cbd5e1" }}>Indonesia, 12345</p>
          </div>

          <div>
            <h4 style={{ color: "#60a5fa", marginBottom: "15px", fontSize: "1.2rem" }}>🕒 Opening Hours</h4>
            <p style={{ margin: "5px 0", color: "#cbd5e1" }}>Mon - Fri: 09:00 - 21:00</p>
            <p style={{ margin: "5px 0", color: "#cbd5e1" }}>Saturday: 10:00 - 22:00</p>
            <p style={{ margin: "5px 0", color: "#cbd5e1" }}>Sunday: 10:00 - 20:00</p>
          </div>

          <div>
            <h4 style={{ color: "#60a5fa", marginBottom: "15px", fontSize: "1.2rem" }}>📞 Contact Us</h4>
            <p style={{ margin: "5px 0", color: "#cbd5e1" }}>Phone: +62 812 3456 7890</p>
            <p style={{ margin: "5px 0", color: "#cbd5e1" }}>Email: support@vickostore.com</p>
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <span>📷 IG</span> | <span>📘 FB</span> | <span>🐦 TW</span>
            </div>
          </div>

        </div>
        <div style={{ textAlign: "center", borderTop: "1px solid #334155", marginTop: "30px", paddingTop: "20px", color: "#94a3b8", fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} Vicko Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
