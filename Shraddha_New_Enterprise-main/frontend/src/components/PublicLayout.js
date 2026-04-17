import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Phone, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuote } from "@/contexts/QuoteContext";
import api from "@/lib/api";
import "@/App.css";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { quoteItems } = useQuote();
  const [settings, setSettings] = useState({});
  const location = useLocation();

  useEffect(() => {
    api.get("/settings").then(r => setSettings(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/about", label: "About Us" },
    { to: "/feedback", label: "Feedback" },
    { to: "/contact", label: "Contact" },
    
  ];

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
  <img src="/images/logo.png" alt="Shraddha Enterprises" className="h-10 w-auto object-contain" />
</Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-[#f97316] ${
                  location.pathname === link.to ? "text-[#f97316]" : "text-[#4b5563]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/quote" data-testid="quote-list-btn" className="relative">
              <Button variant="outline" size="sm" className="border-[#f97316] text-[#f97316] hover:bg-orange-50 rounded-xl">
                <ShoppingBag className="w-4 h-4 mr-1" />
                Quote list
                {quoteItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f97316] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {quoteItems.length}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            {settings.phone_number && (
              <a href={`tel:${settings.phone_number}`} data-testid="mobile-call-btn">
                <Button size="sm" className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-xs px-3">
                  <Phone className="w-3 h-3 mr-1" /> Call
                </Button>
              </a>
            )}
            <Link to="/quote" data-testid="mobile-quote-btn" className="relative">
              <ShoppingBag className="w-5 h-5 text-[#4b5563]" />
              {quoteItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#f97316] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {quoteItems.length}
                </span>
              )}
            </Link>
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#4b5563] hover:text-[#111827]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-down" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                className={`block px-3 py-2 rounded-xl text-sm font-medium ${
                  location.pathname === link.to
                    ? "bg-orange-50 text-[#f97316]"
                    : "text-[#4b5563] hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/contact"
              data-testid="mobile-contact-btn"
              className="block mt-2"
            >
              <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl">
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer({ settings }) {
  return (
    <footer className="bg-[#111827] text-white mt-auto" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
  <img src="/images/logo.png" alt="Shraddha Enterprises" className="h-12 w-auto object-contain" />
  <span className="font-semibold text-lg text-white">Shraddha Enterprises</span>
</div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings?.tagline || "Your trusted partner for quality industrial & electrical products"}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4 text-gray-300">Quick links</h4>
            <div className="space-y-2">
              {[{to:"/", label:"Home"},{to:"/products",label:"Products"},{to:"/contact",label:"Contact"}].map(l => (
                <Link key={l.to} to={l.to} className="block text-gray-400 hover:text-[#f97316] text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4 text-gray-300">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>{settings?.address || "Nigdi, Pune - 411044"}</p>
              {settings?.phone_number && <p>Phone: {settings.phone_number}</p>}
              {settings?.email && <p>Email: {settings.email}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Shraddha Enterprises. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    api.get("/settings").then(r => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
