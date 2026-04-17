import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";

const availLabels = { in_stock: "In stock", on_order: "On order", contact: "Contact" };
const availClasses = { in_stock: "bg-green-100 text-green-700", on_order: "bg-orange-100 text-orange-700", contact: "bg-gray-100 text-gray-600" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c.name; });

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (catFilter) params.set("category", catFilter);
    params.set("page", page);
    params.set("limit", "10");
    api.get(`/products?${params}`).then(r => {
      setProducts(r.data.products || []);
      setTotalPages(r.data.pages || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [page, search, catFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/products/${deleteId}`);
    setDeleteId(null);
    fetchProducts();
  };

  const toggleFeatured = async (product) => {
    await api.put(`/products/${product.id}`, {
      ...product,
      is_featured: !product.is_featured
    });
    fetchProducts();
  };

  return (
    <div className="space-y-6" data-testid="admin-products-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-[#111827]">Products</h1>
        <Link to="/admin/products/add">
          <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-sm" data-testid="add-product-btn">
            <Plus className="w-4 h-4 mr-1" /> Add product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap" data-testid="product-filters">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            data-testid="admin-product-search"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 rounded-xl border-gray-200 focus:border-[#f97316]"
          />
        </div>
        <select
          data-testid="admin-category-filter"
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#4b5563] bg-white focus:border-[#f97316] outline-none"
        >
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Colours</TableHead>
              <TableHead className="text-xs">Availability</TableHead>
              <TableHead className="text-xs">Featured</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#4b5563]">Loading...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#4b5563]">No products found</TableCell></TableRow>
            ) : (
              products.map(p => (
                <TableRow key={p.id} className="hover:bg-gray-50" data-testid={`product-row-${p.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.colour_variants?.[0]?.images?.[0] && (
                        <img src={p.colour_variants[0].images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{p.name}</p>
                        <p className="text-xs text-[#4b5563]">{p.views_count || 0} views, {p.queries_count || 0} queries</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#4b5563]">{catMap[p.category_id] || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.colour_variants?.map((v, i) => (
                        <span key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor: v.hex_code}} title={v.colour_name} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] px-2 py-0.5 rounded-full ${availClasses[p.availability] || availClasses.contact}`}>
                      {availLabels[p.availability] || "Contact"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      data-testid={`featured-toggle-${p.id}`}
                      checked={p.is_featured}
                      onCheckedChange={() => toggleFeatured(p)}
                      className="data-[state=checked]:bg-[#f97316]"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/products/edit/${p.id}`}>
                        <Button variant="ghost" size="sm" className="text-[#4b5563] hover:text-[#f97316]" data-testid={`edit-product-${p.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost" size="sm"
                        className="text-[#4b5563] hover:text-red-500"
                        onClick={() => setDeleteId(p.id)}
                        data-testid={`delete-product-${p.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i} size="sm"
              variant={page === i + 1 ? "default" : "outline"}
              onClick={() => setPage(i + 1)}
              className={`rounded-xl ${page === i + 1 ? "bg-[#f97316] text-white" : "border-gray-200"}`}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[380px] rounded-xl" data-testid="delete-product-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Delete product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#4b5563]">Are you sure? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl" data-testid="delete-cancel-btn">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-xl" data-testid="delete-confirm-btn">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
