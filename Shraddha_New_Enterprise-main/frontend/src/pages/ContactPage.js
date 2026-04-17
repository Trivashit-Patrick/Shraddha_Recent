import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export default function ContactPage() {
  const { settings } = useOutletContext();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/contact", form);
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="contact-page">
      <h1 className="text-2xl md:text-3xl font-medium text-[#111827] mb-2">Contact us</h1>
      <p className="text-sm text-[#4b5563] mb-8">
        Get in touch with our team for queries, bulk orders, or technical support.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── CONTACT FORM ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="contact-form-card">
          {success ? (
            <div className="text-center py-8" data-testid="contact-success">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-medium text-[#111827] mb-2">Message sent</h3>
              <p className="text-sm text-[#4b5563]">We will get back to you shortly.</p>
              <Button
                onClick={() => setSuccess(false)}
                className="mt-4 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl"
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
              <div className="space-y-1">
                <Label htmlFor="c-name" className="text-xs text-[#4b5563]">Name</Label>
                <Input
                  id="c-name"
                  data-testid="contact-name-input"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  placeholder="Your full name"
                  className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="c-email" className="text-xs text-[#4b5563]">Email</Label>
                  <Input
                    id="c-email"
                    type="email"
                    data-testid="contact-email-input"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    placeholder="you@company.com"
                    className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-phone" className="text-xs text-[#4b5563]">Phone</Label>
                  <Input
                    id="c-phone"
                    data-testid="contact-phone-input"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="c-msg" className="text-xs text-[#4b5563]">Message</Label>
                <Textarea
                  id="c-msg"
                  data-testid="contact-message-input"
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  required
                  placeholder="Tell us about your requirements..."
                  rows={5}
                  className="rounded-xl border-gray-200 focus:border-[#f97316] focus:ring-[#f97316] resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                data-testid="contact-submit-btn"
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl"
              >
                {loading ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
        </div>

        {/* ── MAP & INFO ── */}
        <div className="space-y-6">

          {/* Google Map — exact Shradha Enterprises location */}
          <div className="rounded-xl border border-gray-200 overflow-hidden h-72 sm:h-80" data-testid="google-map">
            <iframe
              src={
  settings?.google_maps_url ||
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d945.0073318688045!2d73.7819678!3d18.6626799!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b7a48b2c8d37%3A0x7ff7288c8e24a32d!2sShradha%20Enterprises!5e0!3m2!1sen!2sin!4v1776446172828!5m2!1sen!2sin"
}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shradha Enterprises Location"
            />
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4" data-testid="contact-info">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#f97316] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-[#4b5563]">
                  {settings?.address ||
                    "Indradhanu, Sector No. 21, Scheme No. 4, Plot No. 78, Yamunanagar, Nigdi, Pune – 411044, Maharashtra, India"}
                </p>
                <a
                  href="https://maps.app.goo.gl/vjq371YgqbYXeUPV6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#f97316] hover:underline mt-1 inline-block"
                >
                  Get directions →
                </a>
              </div>
            </div>

            {settings?.phone_number && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#f97316] shrink-0" />
                <a
                  href={`tel:${settings.phone_number}`}
                  className="text-sm text-[#4b5563] hover:text-[#f97316] transition-colors"
                >
                  {settings.phone_number}
                </a>
              </div>
            )}

            {settings?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#f97316] shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="text-sm text-[#4b5563] hover:text-[#f97316] transition-colors"
                >
                  {settings.email}
                </a>
              </div>
            )}

            {/* Business Hours */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-[#111827] mb-2">Business hours</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#4b5563]">
                  <span>Monday – Saturday</span>
                  <span className="font-medium">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between text-xs text-[#4b5563]">
                  <span>Sunday</span>
                  <span className="text-red-500">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}