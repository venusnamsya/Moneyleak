import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach tokens only to protected requests
api.interceptors.request.use((config) => {
  const url = config.url || "";

  const isAuthRequest =
    url.includes("/api/auth/login/") ||
    url.includes("/api/auth/register/");

  if (isAuthRequest) {
    delete config.headers.Authorization;
    return config;
  }

  const token = localStorage.getItem("moneyleak_access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;