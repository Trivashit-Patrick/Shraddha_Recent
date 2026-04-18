import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check token in localStorage first
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setAdmin(false);
      setLoading(false);
      return;
    }
    api.get("/auth/me")
      .then(res => setAdmin(res.data))
      .catch(() => {
        setAdmin(false);
        localStorage.removeItem("admin_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    // Store token in localStorage
    if (res.data?.token) {
      localStorage.setItem("admin_token", res.data.token);
    }
    setAdmin(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("admin_token");
    setAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);