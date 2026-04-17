import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Package, FolderOpen, Inbox, Settings, LogOut, ChevronRight
} from "lucide-react";

const sidebarLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/categories", icon: FolderOpen, label: "Categories" },
  { to: "/admin/queries", icon: Inbox, label: "Queries" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const currentPage = sidebarLinks.find(l => location.pathname.startsWith(l.to))?.label || "Admin";

  return (
    <div className="flex h-screen bg-[#f3f4f6]" data-testid="admin-layout">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1a1a2e] flex flex-col shrink-0" data-testid="admin-sidebar">
        <div className="p-4 border-b border-white/10">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
<img src="/images/logo.png" alt="Shraddha Enterprises" className="h-8 w-auto object-contain brightness-0 invert" />
            <span className="text-white font-medium text-sm">Admin portal</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {sidebarLinks.map(link => {
            const Icon = link.icon;
            const active = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`admin-nav-${link.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-[#f97316] text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            data-testid="admin-logout-btn"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0" data-testid="admin-topbar">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4b5563]">Admin</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#111827] font-medium">{currentPage}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#f97316] flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {admin?.name?.[0] || "A"}
              </span>
            </div>
            <span className="text-sm text-[#4b5563]">{admin?.name || "Admin"}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
