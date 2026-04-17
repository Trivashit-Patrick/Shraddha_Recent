import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QuoteProvider } from "@/contexts/QuoteContext";

import PublicLayout from "@/components/PublicLayout";
import AdminLayout from "@/components/AdminLayout";
import AboutPage from "@/pages/AboutPage";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import ContactPage from "@/pages/ContactPage";
import QuotePage from "@/pages/QuotePage";
import FeedbackPage from "@/pages/FeedbackPage";

import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProducts from "@/pages/AdminProducts";
import AdminProductForm from "@/pages/AdminProductForm";
import AdminCategories from "@/pages/AdminCategories";
import AdminQueries from "@/pages/AdminQueries";
import AdminSettings from "@/pages/AdminSettings";

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="w-8 h-8 rounded-full border-2 border-[#f97316] border-t-transparent animate-spin" />
    </div>
  );
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

function AdminLoginGuard() {
  const { admin, loading } = useAuth();
  if (loading) return null;
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  return <AdminLogin />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuoteProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/quote" element={<QuotePage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginGuard />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<AdminProductForm />} />
              <Route path="products/edit/:id" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="queries" element={<AdminQueries />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </QuoteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
