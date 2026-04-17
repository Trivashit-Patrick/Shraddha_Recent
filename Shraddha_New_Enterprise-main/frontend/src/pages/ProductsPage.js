import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import QueryModal from "@/components/QueryModal";
import api from "@/lib/api";

export default function ProductsPage() {
  const { settings } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [queryModal, setQueryModal] = useState({ open: false, product: "", colour: "" });

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("limit", "12");

    api.get(`/products?${params}`).then(r => {
      const prods = r.data.products || [];
      // Attach category names
      const catMap = {};
      categories.forEach(c => { catMap[c.id] = c.name; });
      prods.forEach(p => { p.category_name = catMap[p.category_id] || ""; });
      setProducts(prods);
      setTotal(r.data.total || 0);
      setPages(r.data.pages || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search, category, categories]);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (searchInput) p.set("search", searchInput); else p.delete("search");
    p.set("page", "1");
    setSearchParams(p);
  };

  const selectCategory = (catId) => {
    const p = new URLSearchParams(searchParams);
    if (catId === category) p.delete("category");
    else p.set("category", catId);
    p.set("page", "1");
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="products-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-medium text-[#111827]">Our products</h1>
        <p className="text-sm text-[#4b5563] mt-1">Browse our complete range of industrial & electrical products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-56 shrink-0" data-testid="category-sidebar">
          <div className="sticky top-20 space-y-1">
            <p className="text-xs text-[#4b5563] uppercase tracking-wider mb-3 font-medium">Categories</p>
            <button
              data-testid="category-all"
              onClick={() => selectCategory("")}
              className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                !category ? "bg-orange-50 text-[#f97316] font-medium" : "text-[#4b5563] hover:bg-gray-50"
              }`}
            >
              All products
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                data-testid={`category-${cat.id}`}
                onClick={() => selectCategory(cat.id)}
                className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                  category === cat.id ? "bg-orange-50 text-[#f97316] font-medium" : "text-[#4b5563] hover:bg-gray-50"
                }`}
              >
                {cat.name}
                <span className="text-xs text-gray-400 ml-1">({cat.product_count || 0})</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Categories - Mobile Horizontal */}
        <div className="lg:hidden overflow-x-auto flex gap-2 pb-2 -mx-4 px-4" data-testid="category-mobile-scroll">
          <Button
            size="sm"
            variant={!category ? "default" : "outline"}
            onClick={() => selectCategory("")}
            className={`rounded-xl whitespace-nowrap text-xs ${
              !category ? "bg-[#f97316] text-white" : "border-gray-200 text-[#4b5563]"
            }`}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              size="sm"
              variant={category === cat.id ? "default" : "outline"}
              onClick={() => selectCategory(cat.id)}
              className={`rounded-xl whitespace-nowrap text-xs ${
                category === cat.id ? "bg-[#f97316] text-white" : "border-gray-200 text-[#4b5563]"
              }`}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6" data-testid="product-search-form">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                data-testid="product-search-input"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="pl-10 rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
              />
            </div>
            <Button type="submit" className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl" data-testid="product-search-btn">
              Search
            </Button>
            {(search || category) && (
              <Button type="button" variant="ghost" onClick={clearFilters} className="rounded-xl text-[#4b5563]" data-testid="clear-filters-btn">
                <X className="w-4 h-4" />
              </Button>
            )}
          </form>

          {/* Results info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#4b5563]">
              {total} product{total !== 1 ? "s" : ""} found
              {search && <span> for "{search}"</span>}
            </p>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 h-80 animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSendQuery={(prod, colour) => setQueryModal({ open: true, product: prod.name, colour })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16" data-testid="no-products">
              <p className="text-[#4b5563]">No products found</p>
              <Button onClick={clearFilters} className="mt-3 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl">
                Clear filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8" data-testid="pagination">
              {[...Array(pages)].map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={page === i + 1 ? "default" : "outline"}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set("page", String(i + 1));
                    setSearchParams(p);
                  }}
                  className={`rounded-xl ${
                    page === i + 1
                      ? "bg-[#f97316] text-white"
                      : "border-gray-200 text-[#4b5563]"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <QueryModal
        open={queryModal.open}
        onOpenChange={(v) => setQueryModal(p => ({...p, open: v}))}
        productName={queryModal.product}
        colourName={queryModal.colour}
      />
    </div>
  );
}
