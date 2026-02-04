// src/middleware/authorization.js

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "User tidak terautentikasi" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Akses ditolak: role tidak diizinkan" });
    }
    next();
  };
}

module.exports = authorizeRoles;
