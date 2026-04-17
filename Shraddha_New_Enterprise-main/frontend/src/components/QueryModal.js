import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export default function QueryModal({ open, onOpenChange, productName, colourName }) {
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/queries", {
        ...form,
        products: [{ product_name: productName, colour_selected: colourName || "" }],
        type: "single"
      });
      setSuccess(true);
      setForm({ customer_name: "", email: "", phone: "", message: "" });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to send query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (v) => {
    onOpenChange(v);
    if (!v) { setSuccess(false); setError(""); }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] rounded-xl" data-testid="query-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-[#111827]">
            {success ? "Query sent" : "Send query"}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center" data-testid="query-success">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm text-[#4b5563]">
              We got your request and will get back to you shortly.
            </p>
            <Button
              data-testid="query-done-btn"
              onClick={() => handleClose(false)}
              className="mt-4 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="query-form">
            <div className="bg-orange-50 p-3 rounded-xl text-sm">
              <span className="text-[#4b5563]">Product: </span>
              <span className="font-medium text-[#111827]">{productName}</span>
              {colourName && (
                <>
                  <span className="text-[#4b5563]"> | Colour: </span>
                  <span className="font-medium text-[#111827]">{colourName}</span>
                </>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="q-name" className="text-xs text-[#4b5563]">Name</Label>
              <Input
                id="q-name"
                data-testid="query-name-input"
                value={form.customer_name}
                onChange={e => setForm(p => ({...p, customer_name: e.target.value}))}
                required
                placeholder="Your full name"
                className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="q-email" className="text-xs text-[#4b5563]">Email</Label>
              <Input
                id="q-email"
                type="email"
                data-testid="query-email-input"
                value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                required
                placeholder="you@company.com"
                className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="q-phone" className="text-xs text-[#4b5563]">Phone</Label>
              <Input
                id="q-phone"
                data-testid="query-phone-input"
                value={form.phone}
                onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                required
                placeholder="+91 XXXXX XXXXX"
                className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="q-msg" className="text-xs text-[#4b5563]">Message (optional)</Label>
              <Textarea
                id="q-msg"
                data-testid="query-message-input"
                value={form.message}
                onChange={e => setForm(p => ({...p, message: e.target.value}))}
                placeholder="Tell us about your requirements..."
                rows={3}
                className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316] resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-500" data-testid="query-error">{error}</p>}

            <Button
              type="submit"
              data-testid="query-submit-btn"
              disabled={loading}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl"
            >
              {loading ? "Sending..." : "Send query"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
