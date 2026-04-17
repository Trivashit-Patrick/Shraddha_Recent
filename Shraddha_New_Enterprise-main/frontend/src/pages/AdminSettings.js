import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export default function AdminSettings() {
  const [form, setForm] = useState({
    phone_number: "", email: "",
    company_name: "", address: "", tagline: "",
    google_maps_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings").then(r => {
      const s = r.data;
      setForm({
        phone_number: s.phone_number || "",
        email: s.email || "",
        company_name: s.company_name || "",
        address: s.address || "",
        tagline: s.tagline || "",
        google_maps_url: s.google_maps_url || ""
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/settings", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-[#4b5563]">Loading...</div>;

  return (
    <div className="max-w-2xl" data-testid="admin-settings-page">
      <h1 className="text-xl font-medium text-[#111827] mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-medium text-sm text-[#111827]">Contact information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-[#4b5563]">WhatsApp number</Label>
              <Input data-testid="settings-whatsapp" value={form.whatsapp_number}
                onChange={e => setForm(p => ({...p, whatsapp_number: e.target.value}))}
                placeholder="e.g. 919876543210"
                className="rounded-xl border-gray-200 focus:border-[#f97316]" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#4b5563]">Phone number</Label>
              <Input data-testid="settings-phone" value={form.phone_number}
                onChange={e => setForm(p => ({...p, phone_number: e.target.value}))}
                className="rounded-xl border-gray-200 focus:border-[#f97316]" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#4b5563]">Email</Label>
            <Input data-testid="settings-email" type="email" value={form.email}
              onChange={e => setForm(p => ({...p, email: e.target.value}))}
              className="rounded-xl border-gray-200 focus:border-[#f97316]" />
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-medium text-sm text-[#111827]">Company information</h3>
          <div className="space-y-1">
            <Label className="text-xs text-[#4b5563]">Company name</Label>
            <Input data-testid="settings-company" value={form.company_name}
              onChange={e => setForm(p => ({...p, company_name: e.target.value}))}
              className="rounded-xl border-gray-200 focus:border-[#f97316]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#4b5563]">Tagline</Label>
            <Input data-testid="settings-tagline" value={form.tagline}
              onChange={e => setForm(p => ({...p, tagline: e.target.value}))}
              className="rounded-xl border-gray-200 focus:border-[#f97316]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#4b5563]">Address</Label>
            <Textarea data-testid="settings-address" value={form.address}
              onChange={e => setForm(p => ({...p, address: e.target.value}))}
              rows={3} className="rounded-xl border-gray-200 focus:border-[#f97316] resize-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#4b5563]">Google Maps embed URL</Label>
            <Input data-testid="settings-maps" value={form.google_maps_url}
              onChange={e => setForm(p => ({...p, google_maps_url: e.target.value}))}
              className="rounded-xl border-gray-200 focus:border-[#f97316]" />
          </div>
        </div>

        <Button type="submit" disabled={saving} data-testid="save-settings-btn"
          className={`rounded-xl px-8 ${saved ? "bg-green-500 hover:bg-green-600" : "bg-[#f97316] hover:bg-[#ea580c]"} text-white`}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : saved ? "Saved" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
