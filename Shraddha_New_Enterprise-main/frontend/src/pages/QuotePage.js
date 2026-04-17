import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuote } from "@/contexts/QuoteContext";
import api from "@/lib/api";

export default function QuotePage() {
  const { quoteItems, removeFromQuote, clearQuote } = useQuote();
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quoteItems.length === 0) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/queries", {
        ...form,
        products: quoteItems.map(i => ({ product_name: i.product_name, colour_selected: i.colour_selected })),
        type: "bulk_quote"
      });
      setSuccess(true);
      clearQuote();
    } catch {
      setError("Failed to send quote request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center" data-testid="quote-success">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#111827] mb-2">Quote request sent</h2>
        <p className="text-sm text-[#4b5563] mb-6">We received your bulk quote request and will get back to you shortly.</p>
        <Link to="/products">
          <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl">Continue browsing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="quote-page">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/products">
          <Button variant="ghost" size="sm" className="rounded-xl"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-medium text-[#111827]">Quote list</h1>
      </div>

      {quoteItems.length === 0 ? (
        <div className="text-center py-16" data-testid="quote-empty">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#4b5563] mb-4">Your quote list is empty</p>
          <Link to="/products">
            <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quote Items */}
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {quoteItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4" data-testid={`quote-item-${idx}`}>
                {item.image && (
                  <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827]">{item.product_name}</p>
                  {item.colour_selected && (
                    <p className="text-xs text-[#4b5563]">Colour: {item.colour_selected}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm"
                  onClick={() => removeFromQuote(item.product_id, item.colour_selected)}
                  className="text-gray-400 hover:text-red-500"
                  data-testid={`remove-quote-${idx}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Quote Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4" data-testid="quote-form">
            <h3 className="font-medium text-sm text-[#111827]">Your details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-[#4b5563]">Name</Label>
                <Input data-testid="quote-name" value={form.customer_name}
                  onChange={e => setForm(p => ({...p, customer_name: e.target.value}))}
                  required placeholder="Your full name"
                  className="rounded-xl border-gray-200 focus:border-[#f97316]" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#4b5563]">Email</Label>
                <Input data-testid="quote-email" type="email" value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  required placeholder="you@company.com"
                  className="rounded-xl border-gray-200 focus:border-[#f97316]" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#4b5563]">Phone</Label>
              <Input data-testid="quote-phone" value={form.phone}
                onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                required placeholder="+91 XXXXX XXXXX"
                className="rounded-xl border-gray-200 focus:border-[#f97316]" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#4b5563]">Additional message (optional)</Label>
              <Textarea data-testid="quote-message" value={form.message}
                onChange={e => setForm(p => ({...p, message: e.target.value}))}
                placeholder="Any special requirements..." rows={3}
                className="rounded-xl border-gray-200 focus:border-[#f97316] resize-none" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} data-testid="submit-quote-btn"
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl">
              {loading ? "Sending..." : `Send quote request (${quoteItems.length} item${quoteItems.length !== 1 ? "s" : ""})`}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
