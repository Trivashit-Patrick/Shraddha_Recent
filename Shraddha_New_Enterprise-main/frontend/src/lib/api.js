import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;