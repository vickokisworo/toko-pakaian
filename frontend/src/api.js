const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function getAuthHeaders() {
  const token = sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseErrorMessage(json, statusText) {
  if (json?.error) return json.error;
  if (json?.message) return json.message;
  if (json?.errors && Array.isArray(json.errors)) {
    return json.errors.map((e) => e.message || e).join(", ");
  }
  return statusText;
}

async function request(path, opts = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(opts.headers || {}),
  };

  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers });

    if (res.status === 401) {
      // try refresh
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const r = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (r.ok) {
            const data = await r.json();
            sessionStorage.setItem("accessToken", data.accessToken);
            // retry original request
            const headers2 = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.accessToken}`,
            };
            const res2 = await fetch(`${API_URL}${path}`, {
              ...opts,
              headers: { ...headers2, ...(opts.headers || {}) },
            });
            if (res2.status === 204) return null;
            const json2 = await res2.json().catch(() => null);
            if (!res2.ok) {
              throw new Error(parseErrorMessage(json2, res2.statusText));
            }
            return json2;
          }
        } catch (refreshErr) {
          // Refresh failed, clear tokens
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          throw new Error("Session expired, please login again");
        }
      }
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      throw new Error("Unauthorized. Please login again.");
    }

    if (res.status === 204) return null;

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(json, res.statusText));
    }
    return json;
  } catch (error) {
    // Network error or other issues
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Connection error. Please check your internet connection.",
      );
    }
    throw error;
  }
}

export async function login(email, password) {
  return request(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(payload) {
  return request(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  const refreshToken = sessionStorage.getItem("refreshToken");
  try {
    await request(`/auth/logout`, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch (e) { }
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
}

export async function getMe() {
  try {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return null;
    return request("/users/me", { method: "GET" });
  } catch (e) {
    return null;
  }
}

export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const path = qs ? `/products?${qs}` : `/products`;
  return request(path, { method: "GET" });
}

export async function getProductDetail(id) {
  return request(`/products/${id}`, { method: "GET" });
}

export async function createProduct(payload) {
  return request(`/products`, {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
}

export async function updateProduct(id, payload) {
  return request(`/products/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
}

export async function deleteProduct(id) {
  return request(`/products/${id}`, { method: "DELETE" });
}

export async function getCategories() {
  return request(`/categories`, { method: "GET" });
}

export async function getCategoryDetail(id) {
  return request(`/categories/${id}`, { method: "GET" });
}

export async function createCategory(payload) {
  return request(`/categories`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(id, payload) {
  return request(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id) {
  return request(`/categories/${id}`, { method: "DELETE" });
}

export async function getTransactions() {
  return request(`/transactions`, { method: "GET" });
}

export async function getTransactionDetail(id) {
  return request(`/transactions/${id}`, { method: "GET" });
}

export async function getTransactionByKode(kode) {
  return request(`/transactions/kode/${kode}`, { method: "GET" });
}

export async function createTransaction(payload) {
  return request(`/transactions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTransaction(id, payload) {
  return request(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getUsers() {
  return request(`/users`, { method: "GET" });
}

export async function getUserDetail(id) {
  return request(`/users/${id}`, { method: "GET" });
}

export async function createUser(payload) {
  return request(`/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id, payload) {
  return request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: "DELETE" });
}

export default {
  login,
  register,
  logout,
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactions,
  getTransactionDetail,
  getTransactionByKode,
  createTransaction,
  updateTransaction,
  getUsers,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
};
