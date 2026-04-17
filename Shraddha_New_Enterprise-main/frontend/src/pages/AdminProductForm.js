import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category_id: "", subcategory_id: "",
    is_featured: false, availability: "in_stock",
    specifications: [{ key: "", value: "" }],
    colour_variants: [{ colour_name: "", hex_code: "#000000", images: [] }]
  });

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data || [])).catch(() => {});
    if (isEdit) {
      setLoading(true);
      api.get(`/products/${id}`).then(r => {
        const p = r.data;
        setForm({
          name: p.name || "", description: p.description || "",
          category_id: p.category_id || "", subcategory_id: p.subcategory_id || "",
          is_featured: p.is_featured || false, availability: p.availability || "in_stock",
          specifications: p.specifications?.length ? p.specifications : [{ key: "", value: "" }],
          colour_variants: p.colour_variants?.length ? p.colour_variants : [{ colour_name: "", hex_code: "#000000", images: [] }]
        });
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const selectedCat = categories.find(c => c.id === form.category_id);
  const subcategories = selectedCat?.subcategories || [];

  const updateField = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const addSpec = () => setForm(p => ({ ...p, specifications: [...p.specifications, { key: "", value: "" }] }));
  const removeSpec = (idx) => setForm(p => ({ ...p, specifications: p.specifications.filter((_, i) => i !== idx) }));
  const updateSpec = (idx, field, value) => setForm(p => ({
    ...p, specifications: p.specifications.map((s, i) => i === idx ? { ...s, [field]: value } : s)
  }));

  const addVariant = () => setForm(p => ({ ...p, colour_variants: [...p.colour_variants, { colour_name: "", hex_code: "#000000", images: [] }] }));
  const removeVariant = (idx) => setForm(p => ({ ...p, colour_variants: p.colour_variants.filter((_, i) => i !== idx) }));
  const updateVariant = (idx, field, value) => setForm(p => ({
    ...p, colour_variants: p.colour_variants.map((v, i) => i === idx ? { ...v, [field]: value } : v)
  }));

  const addImageUrl = (variantIdx, url) => {
    if (!url) return;
    setForm(p => ({
      ...p, colour_variants: p.colour_variants.map((v, i) =>
        i === variantIdx ? { ...v, images: [...v.images, url] } : v
      )
    }));
  };

  const removeImage = (variantIdx, imgIdx) => {
    setForm(p => ({
      ...p, colour_variants: p.colour_variants.map((v, i) =>
        i === variantIdx ? { ...v, images: v.images.filter((_, j) => j !== imgIdx) } : v
      )
    }));
  };

  const handleUpload = async (variantIdx, file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    if (res.data?.url) {
      addImageUrl(variantIdx, res.data.url);
    } else {
      alert("Upload failed — no URL returned");
    }
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    alert(`Upload failed: ${err.response?.data?.detail || err.message}`);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        specifications: form.specifications.filter(s => s.key.trim()),
        colour_variants: form.colour_variants.filter(v => v.colour_name.trim())
      };
      if (isEdit) {
        await api.put(`/products/${id}`, data);
      } else {
        await api.post("/products", data);
      }
      navigate("/admin/products");
    } catch (err) {
      alert("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-[#4b5563]">Loading...</div>;

  return (
    <div className="max-w-3xl" data-testid="admin-product-form-page">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")} className="rounded-xl" data-testid="back-to-products">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-medium text-[#111827]">{isEdit ? "Edit product" : "Add product"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-medium text-sm text-[#111827]">Basic information</h3>
          <div className="space-y-1">
            <Label className="text-xs text-[#4b5563]">Product name</Label>
            <Input data-testid="product-name-input" value={form.name} onChange={e => updateField("name", e.target.value)} required
              className="rounded-xl border-gray-200 focus:border-[#f97316]" placeholder="e.g. Ferrule Crimping Tool TP-70E" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#4b5563]">Description</Label>
            <Textarea data-testid="product-desc-input" value={form.description} onChange={e => updateField("description", e.target.value)}
              className="rounded-xl border-gray-200 focus:border-[#f97316] resize-none" rows={4} placeholder="Describe the product..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-[#4b5563]">Category</Label>
              <select data-testid="product-category-select" value={form.category_id}
                onChange={e => { updateField("category_id", e.target.value); updateField("subcategory_id", ""); }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-[#f97316] outline-none">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#4b5563]">Subcategory</Label>
              <select data-testid="product-subcategory-select" value={form.subcategory_id}
                onChange={e => updateField("subcategory_id", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-[#f97316] outline-none">
                <option value="">Select subcategory</option>
                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-[#4b5563]">Availability</Label>
              <select data-testid="product-availability-select" value={form.availability}
                onChange={e => updateField("availability", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-[#f97316] outline-none">
                <option value="in_stock">In stock</option>
                <option value="on_order">On order</option>
                <option value="contact">Contact for availability</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Switch data-testid="product-featured-toggle" checked={form.is_featured}
                onCheckedChange={v => updateField("is_featured", v)} className="data-[state=checked]:bg-[#f97316]" />
              <Label className="text-sm text-[#4b5563]">Featured product</Label>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-[#111827]">Specifications</h3>
            <Button type="button" variant="ghost" size="sm" onClick={addSpec} className="text-[#f97316] text-xs" data-testid="add-spec-btn">
              <Plus className="w-3 h-3 mr-1" /> Add row
            </Button>
          </div>
          {form.specifications.map((spec, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input data-testid={`spec-key-${idx}`} placeholder="Key (e.g. Voltage)" value={spec.key}
                onChange={e => updateSpec(idx, "key", e.target.value)}
                className="flex-1 rounded-xl border-gray-200 text-sm focus:border-[#f97316]" />
              <Input data-testid={`spec-value-${idx}`} placeholder="Value (e.g. 220V)" value={spec.value}
                onChange={e => updateSpec(idx, "value", e.target.value)}
                className="flex-1 rounded-xl border-gray-200 text-sm focus:border-[#f97316]" />
              {form.specifications.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeSpec(idx)} className="text-gray-400 hover:text-red-500 px-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Colour Variants */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-[#111827]">Colour variants</h3>
            <Button type="button" variant="ghost" size="sm" onClick={addVariant} className="text-[#f97316] text-xs" data-testid="add-variant-btn">
              <Plus className="w-3 h-3 mr-1" /> Add variant
            </Button>
          </div>
          {form.colour_variants.map((variant, vIdx) => (
            <div key={vIdx} className="border border-gray-100 rounded-xl p-4 space-y-3" data-testid={`variant-${vIdx}`}>
              <div className="flex items-center gap-2">
                <Input data-testid={`variant-name-${vIdx}`} placeholder="Colour name" value={variant.colour_name}
                  onChange={e => updateVariant(vIdx, "colour_name", e.target.value)}
                  className="flex-1 rounded-xl border-gray-200 text-sm focus:border-[#f97316]" />
                <input type="color" data-testid={`variant-hex-${vIdx}`} value={variant.hex_code}
                  onChange={e => updateVariant(vIdx, "hex_code", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                {form.colour_variants.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(vIdx)} className="text-gray-400 hover:text-red-500 px-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Images */}
              <div>
                <p className="text-xs text-[#4b5563] mb-2">Images</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {variant.images.map((img, iIdx) => (
                    <div key={iIdx} className="relative group w-16 h-16">
                      <img src={img.startsWith("/") ? `${process.env.REACT_APP_BACKEND_URL}${img}` : img}
                        alt="" className="w-full h-full rounded-lg object-cover border border-gray-200" />
                      <button type="button" onClick={() => removeImage(vIdx, iIdx)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        x
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#f97316] transition-colors"
                    data-testid={`upload-image-${vIdx}`}>
                    <Upload className="w-4 h-4 text-gray-400" />
                    <input type="file" className="hidden" accept="image/*"
                      onChange={e => e.target.files[0] && handleUpload(vIdx, e.target.files[0])} />
                  </label>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Or paste image URL" className="rounded-xl border-gray-200 text-xs focus:border-[#f97316]"
                    data-testid={`image-url-input-${vIdx}`}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(vIdx, e.target.value); e.target.value = ""; } }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} data-testid="save-product-btn"
            className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl px-8">
            {saving ? "Saving..." : isEdit ? "Update product" : "Create product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}
            className="rounded-xl border-gray-200" data-testid="cancel-product-btn">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
