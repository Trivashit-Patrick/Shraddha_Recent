import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#f97316] flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">SE</span>
          </div>
          <h1 className="text-xl font-medium text-[#111827]">Admin portal</h1>
          <p className="text-sm text-[#4b5563] mt-1">Sign in to manage your website</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4" data-testid="admin-login-form">
          <div className="space-y-1">
            <Label htmlFor="admin-email" className="text-xs text-[#4b5563]">Email</Label>
            <Input
              id="admin-email"
              type="email"
              data-testid="admin-email-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@shraddha.com"
              className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="admin-password" className="text-xs text-[#4b5563]">Password</Label>
            <Input
              id="admin-password"
              type="password"
              data-testid="admin-password-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
            />
          </div>

          {error && <p className="text-sm text-red-500" data-testid="admin-login-error">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
