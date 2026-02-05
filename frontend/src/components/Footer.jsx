import React from "react";

export default function Footer() {
    const scrollToHash = (hash) => {
        window.location.hash = hash;
    };

    return (
        <footer style={{
            backgroundColor: "#111827", // Very dark gray (almost black)
            color: "#f3f4f6", // Light gray text
            padding: "60px 20px 20px",
            marginTop: "auto",
            fontFamily: "'Inter', sans-serif" // Assuming Inter or similar based on "premium" request, falling back to sans
        }}>
            <div className="container" style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "40px",
                textAlign: "left"
            }}>

                {/* 1. Contact Us */}
                <div>
                    <h4 style={{ color: "#3b82f6", marginBottom: "20px", fontSize: "1.25rem", fontWeight: "600" }}>
                        Contact Us
                    </h4>
                    <p style={{ marginBottom: "10px", color: "#9ca3af" }}>
                        Do you have any questions or suggestions?<br />
                        <a href="mailto:support@vickostore.com" style={{ color: "#f3f4f6", textDecoration: "none" }}>support@vickostore.com</a>
                    </p>
                    <p style={{ color: "#9ca3af" }}>
                        Do you need support? Give us a call.<br />
                        <span style={{ color: "#f3f4f6", fontWeight: "500" }}>+62 812 3456 7890</span>
                    </p>
                </div>

                {/* 2. Navbar Links */}
                <div>
                    <h4 style={{ color: "#3b82f6", marginBottom: "20px", fontSize: "1.25rem", fontWeight: "600" }}>
                        Quick Links
                    </h4>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        <li>
                            <button onClick={() => scrollToHash("#/")} style={linkStyle}>Dashboard</button>
                        </li>
                        <li>
                            <button onClick={() => scrollToHash("#/products")} style={linkStyle}>Products</button>
                        </li>
                        <li>
                            <button onClick={() => scrollToHash("#/categories")} style={linkStyle}>Categories</button>
                        </li>
                        <li>
                            <button onClick={() => scrollToHash("#/transactions")} style={linkStyle}>Transactions</button>
                        </li>
                    </ul>
                </div>

                {/* 3. Subscribe & Socials */}
                <div>
                    <h4 style={{ color: "#3b82f6", marginBottom: "20px", fontSize: "1.25rem", fontWeight: "600" }}>
                        Subscribe
                    </h4>
                    <p style={{ color: "#9ca3af", marginBottom: "15px" }}>
                        Get the latest updates and offers.
                    </p>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
                        <input
                            type="email"
                            placeholder="Your email"
                            style={{
                                flex: 1,
                                padding: "10px 15px",
                                borderRadius: "5px",
                                border: "1px solid #374151",
                                backgroundColor: "#1f2937",
                                color: "white",
                                outline: "none"
                            }}
                        />
                        <button style={{
                            padding: "10px 20px",
                            borderRadius: "5px",
                            border: "none",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}>
                            Subscribe
                        </button>
                    </div>

                    {/* Social Media Icons */}
                    <h5 style={{ fontSize: "1rem", marginBottom: "10px", fontWeight: "500" }}>Follow Us</h5>
                    <div style={{ display: "flex", gap: "15px" }}>
                        {/* Instagram */}
                        <a href="#" style={socialIconStyle}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                        {/* Facebook */}
                        <a href="#" style={socialIconStyle}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                        </a>
                        {/* Twitter/X */}
                        <a href="#" style={socialIconStyle}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4l11.733 16h4.429l-11.733 -16z" />
                                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                            </svg>
                        </a>
                        {/* Youtube */}
                        <a href="#" style={socialIconStyle}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                            </svg>
                        </a>
                    </div>
                </div>

            </div>

            {/* 4. Copyright */}
            <div style={{
                marginTop: "50px",
                paddingTop: "20px",
                borderTop: "1px solid #374151",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "0.875rem"
            }}>
                <p>&copy; {new Date().getFullYear()} Vicko Store. All rights reserved.</p>
            </div>
        </footer>
    );
}

const linkStyle = {
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "1rem",
    padding: 0,
    textAlign: "left",
    transition: "color 0.2s"
};

const socialIconStyle = {
    color: "#9ca3af",
    transition: "color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#1f2937",
    border: "1px solid #374151"
};
