import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState(null);
  const [formName, setFormName] = useState("");
  const [formSubs, setFormSubs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    api.get("/categories").then(r => setCategories(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditCat(null);
    setFormName("");
    setFormSubs([{ name: "" }]);
    setDialogOpen(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setFormName(cat.name);
    setFormSubs(cat.subcategories?.length ? cat.subcategories.map(s => ({ ...s })) : [{ name: "" }]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      name: formName,
      subcategories: formSubs.filter(s => s.name.trim()).map(s => ({ id: s.id, name: s.name }))
    };
    if (editCat) {
      await api.put(`/categories/${editCat.id}`, data);
    } else {
      await api.post("/categories", data);
    }
    setDialogOpen(false);
    fetchCategories();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/categories/${deleteId}`);
    setDeleteId(null);
    fetchCategories();
  };

  return (
    <div className="space-y-6" data-testid="admin-categories-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-[#111827]">Categories</h1>
        <Button onClick={openAdd} className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-sm" data-testid="add-category-btn">
          <Plus className="w-4 h-4 mr-1" /> Add category
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-gray-200" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-[#4b5563]">
          <p>No categories yet</p>
          <Button onClick={openAdd} className="mt-3 bg-[#f97316] text-white rounded-xl">Create your first category</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden" data-testid={`category-row-${cat.id}`}>
              <div className="flex items-center justify-between p-4">
                <button
                  className="flex items-center gap-2 text-left flex-1"
                  onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                  data-testid={`expand-category-${cat.id}`}
                >
                  {expandedCat === cat.id ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{cat.name}</p>
                    <p className="text-xs text-[#4b5563]">
                      {cat.subcategories?.length || 0} subcategories, {cat.product_count || 0} products
                    </p>
                  </div>
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(cat)} className="text-[#4b5563] hover:text-[#f97316]"
                    data-testid={`edit-category-${cat.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(cat.id)} className="text-[#4b5563] hover:text-red-500"
                    data-testid={`delete-category-${cat.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {expandedCat === cat.id && cat.subcategories?.length > 0 && (
                <div className="border-t border-gray-100 px-4 pb-3 pt-2 space-y-1">
                  {cat.subcategories.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 py-1.5 pl-6 text-sm text-[#4b5563]">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-xl" data-testid="category-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">{editCat ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-[#4b5563]">Category name</Label>
              <Input data-testid="category-name-input" value={formName} onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Crimping Tools" className="rounded-xl border-gray-200 focus:border-[#f97316]" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-[#4b5563]">Subcategories</Label>
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => setFormSubs(p => [...p, { name: "" }])}
                  className="text-[#f97316] text-xs" data-testid="add-subcategory-btn">
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              {formSubs.map((sub, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input data-testid={`subcategory-input-${idx}`} value={sub.name}
                    onChange={e => setFormSubs(p => p.map((s, i) => i === idx ? { ...s, name: e.target.value } : s))}
                    placeholder="Subcategory name" className="rounded-xl border-gray-200 text-sm focus:border-[#f97316]" />
                  {formSubs.length > 1 && (
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => setFormSubs(p => p.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 px-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSave} className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl" data-testid="save-category-btn">
                {editCat ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[380px] rounded-xl" data-testid="delete-category-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Delete category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#4b5563]">Are you sure? Products in this category will not be deleted.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-xl" data-testid="confirm-delete-category-btn">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
