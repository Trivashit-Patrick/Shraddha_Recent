import { useState, useEffect, useCallback } from "react";
import { MessageSquare, CheckCircle, ThumbsUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

/* ── ORIGINAL 19 HARDCODED TESTIMONIALS ──────────────────────── */
const originalTestimonials = [
  { name: "Vicky Mevawala", location: "India", date: "07 Feb 2026", product: "Ferrule Printer Ribbons", comment: "", tags: ["Response", "Quality", "Delivery"], rating: 5, sellerReply: "Thank you for your feedback." },
  { name: "Mohammed Osman", location: "Bengaluru, Karnataka", date: "11 Nov 2025", product: "Ferrule Printing Machine", comment: "", tags: [], rating: 4 },
  { name: "Gamit", location: "Fortsongadh, Gujarat", date: "17 Oct 2025", product: "MAX Letatwin Ferrule Printing Machine", comment: "", tags: [], rating: 4 },
  { name: "Farid Alam", location: "Bareilly, Uttar Pradesh", date: "19 Feb 2025", product: "Ferrule Printing Machine", comment: "", tags: [], rating: 4 },
  { name: "Harshal Pandurang Burkule", location: "Pune, Maharashtra", date: "20 Sep 2024", product: "Label Printer", comment: "", tags: [], rating: 4 },
  { name: "Ram Babu", location: "Hyderabad, Telangana", date: "08 Aug 2024", product: "Ferrule Printing Machine", comment: "", tags: [], rating: 3 },
  { name: "GAURAV KESHAV PANCHAL", location: "Pune, Maharashtra", date: "10 Aug 2024", product: "Ferrule Printer Ribbons", comment: "", tags: ["Response", "Delivery", "Quality"], rating: 5 },
  { name: "Pratik", location: "Pimpri Chinchwad, Maharashtra", date: "10 Aug 2024", product: "Cable ID Printer", comment: "", tags: [], rating: 4 },
  { name: "Suyash Khapane", location: "Kolhapur, Maharashtra", date: "11 Mar 2024", product: "Ferrule Printing Machine", comment: "", tags: ["Response", "Quality", "Delivery"], rating: 5 },
  { name: "Mohan Jewrajka", location: "Barakar, West Bengal", date: "27 Jan 2024", product: "Typewriter Ribbon", comment: "", tags: [], rating: 3 },
  { name: "Prashant Gore", location: "Mumbai, Maharashtra", date: "26 Nov 2022", product: "Label Tape", comment: "Thank You", tags: ["Response", "Quality", "Delivery"], rating: 5 },
  { name: "Tejas Gore", location: "Pune, Maharashtra", date: "26 Nov 2022", product: "Ferrule Printing Machine", comment: "The support team was very co-operative and quick", tags: ["Response", "Quality", "Delivery"], rating: 5 },
  { name: "Ashwini Bonde", location: "Pimpri Chinchwad, Maharashtra", date: "19 Nov 2022", product: "Ferrule Printing Machine", comment: "Works really good, the quality of the products appears to be great and response from the team was quick", tags: ["Response", "Quality", "Delivery"], rating: 5 },
  { name: "Ashvinee", location: "India", date: "19 Nov 2022", product: "Ferrule Printing Machine", comment: "Quick and easy to deal with. I'm happy with the phone call and the deal I got from the company.", tags: ["Response", "Quality", "Delivery"], rating: 5 },
  { name: "Narender Sapar", location: "Hyderabad, Telangana", date: "23 Dec 2022", product: "DYMO Label Printer", comment: "", tags: [], rating: 2 },
  { name: "Anju", location: "Noida, Uttar Pradesh", date: "17 Feb 2022", product: "Ferrule Printer Ribbons", comment: "", tags: [], rating: 1 },
  { name: "Shaik Abdul Allam", location: "Guntur, Andhra Pradesh", date: "25 Feb 2021", product: "", comment: "", tags: ["Response"], rating: 3 },
  { name: "Suraj Singh", location: "Pune, Maharashtra", date: "25 Nov 2020", product: "Label Printer", comment: "", tags: [], rating: 1 },
  { name: "Mustafa Balure", location: "Pune, Maharashtra", date: "14 Jun 2020", product: "Power Adapter", comment: "", tags: [], rating: 2 },
];

/* ── HELPERS ──────────────────────────────────────────────────── */
const avatarColours = [
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-yellow-100 text-yellow-700",
  "bg-teal-100 text-teal-700",
];
const getColour = (name) => avatarColours[name.charCodeAt(0) % avatarColours.length];
const getInitials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/* Calculate stats from all testimonials */
function calcStats(list) {
  const total = list.length;
  if (total === 0) return { avg: 0, total: 0, dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  list.forEach((t) => {
    const r = t.rating || 0;
    sum += r;
    if (r >= 1 && r <= 5) dist[r] = (dist[r] || 0) + 1;
  });
  return {
    avg: Math.round((sum / total) * 10) / 10,
    total,
    dist,
  };
}

/* ── STAR DISPLAY (read-only) ─────────────────────────────────── */
function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" className="w-3.5 h-3.5"
          fill={s <= rating ? "#f97316" : "none"}
          stroke={s <= rating ? "#f97316" : "#d1d5db"}
          strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ))}
    </div>
  );
}

/* ── TAG PILL ─────────────────────────────────────────────────── */
function Tag({ label }) {
  const map = {
    Response: "bg-orange-50 text-orange-600 border-orange-100",
    Quality: "bg-green-50 text-green-600 border-green-100",
    Delivery: "bg-blue-50 text-blue-600 border-blue-100",
  };
  return (
    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${map[label] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
      ✓ {label}
    </span>
  );
}

/* ── TESTIMONIAL CARD ─────────────────────────────────────────── */
function TestimonialCard({ t }) {
  const initials = getInitials(t.name);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-[#f97316]/40 hover:shadow-sm transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium ${getColour(t.name)}`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#111827] truncate">{t.name}</p>
          <p className="text-xs text-[#6b7280] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />{t.location}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {t.rating > 0 && <StarDisplay rating={t.rating} />}
          <span className="text-[10px] text-[#9ca3af]">{t.date}</span>
        </div>
      </div>

      {t.product && (
        <div className="bg-[#f9fafb] rounded-xl px-3 py-2">
          <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest mb-0.5">Product</p>
          <p className="text-xs font-medium text-[#111827]">{t.product}</p>
        </div>
      )}

      {t.comment && (
        <p className="text-sm text-[#4b5563] leading-relaxed italic border-l-2 border-[#f97316]/30 pl-3">
          "{t.comment}"
        </p>
      )}

      {t.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {t.tags.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
      )}

      {t.sellerReply && (
        <div className="border-t border-gray-50 pt-3 flex gap-2.5 items-start">
          <div className="w-6 h-6 rounded-full bg-[#f97316] flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">SE</span>
          </div>
          <div>
            <p className="text-[10px] text-[#f97316] font-medium mb-0.5">Response from Shraddha Enterprises</p>
            <p className="text-xs text-[#6b7280] italic">{t.sellerReply}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SUMMARY STATS (dynamic) ──────────────────────────────────── */
function SummaryStats({ stats }) {
  const { avg, total, dist, satisfaction, response, delivery } = stats;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-[#fff7ed] border border-orange-100 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-xl font-medium text-[#f97316]">{avg}</span>
          <span className="text-[9px] text-[#f97316]">/ 5</span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#111827]">Overall rating</p>
          <p className="text-xs text-[#6b7280]">Based on {total} verified review{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Rating bars — dynamic */}
      <div className="flex flex-col gap-2 mb-5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = dist[star] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-[11px] text-[#6b7280] w-10 flex-shrink-0">{star} star</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f97316] rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-[#6b7280] w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Satisfaction pills */}
      <div className="grid grid-cols-3 gap-2">
        {[
        { label: "Satisfaction", value: `${stats.satisfaction || Math.round(avg / 5 * 100)}%` },
        { label: "Response", value: `${stats.response || Math.round(avg / 5 * 100 - 1)}%` },
        { label: "Delivery", value: `${stats.delivery || Math.round(avg / 5 * 100 - 1)}%` },
      ].map((s) => (
          <div key={s.label} className="bg-[#f9fafb] rounded-xl p-2.5 text-center">
            <p className="text-sm font-medium text-[#f97316]">{s.value}</p>
            <p className="text-[10px] text-[#6b7280] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── FEEDBACK FORM ────────────────────────────────────────────── */
function FeedbackForm({ onNewFeedback }) {
  const [form, setForm] = useState({ name: "", location: "", product: "", comment: "", tags: [], rating: 0 });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) {
      setError("Please fill in your name and feedback.");
      return;
    }
    if (form.rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setLoading(true);

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).replace(/-/g, " ");

    const newEntry = {
      ...form,
      date: dateStr,
      is_approved: false,
    };

    try {
      await api.post("/feedback", newEntry);
    } catch {
      // continue even if API not wired yet
    } finally {
      setLoading(false);
    }

    // Pass new entry to parent so it shows immediately
    onNewFeedback({
      ...form,
      date: dateStr,
      is_approved: true,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-[#111827] mb-2">Thank you!</h3>
        <p className="text-sm text-[#6b7280] max-w-sm mx-auto">
          Your feedback has been submitted. It will appear after admin approval.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", location: "", product: "", comment: "", tags: [], rating: 0 }); }}
          className="mt-5 text-sm text-[#f97316] hover:underline"
        >
          Submit another feedback
        </button>
      </div>
    );
  }

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  const activeRating = hoveredStar || form.rating;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="bg-[#111827] px-6 py-5">
        <h3 className="text-white font-medium flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4 text-[#f97316]" />
          Share your experience
        </h3>
        <p className="text-gray-400 text-xs mt-1">We'd love to hear what you think</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4">

        {/* STAR RATING */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#6b7280]">
            Your rating <span className="text-[#f97316]">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm((p) => ({ ...p, rating: star }))}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 transition-colors duration-150"
                  fill={star <= activeRating ? "#f97316" : "none"}
                  stroke={star <= activeRating ? "#f97316" : "#d1d5db"}
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </button>
            ))}
            {activeRating > 0 && (
              <span className="ml-2 text-sm font-medium text-[#f97316]">
                {ratingLabels[activeRating]}
              </span>
            )}
          </div>
          {/* Star hint */}
          {form.rating === 0 && (
            <p className="text-[11px] text-[#9ca3af]">Click a star to rate</p>
          )}
        </div>

        {/* Name + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#6b7280]">Your name <span className="text-[#f97316]">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rahul Sharma"
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#f97316] transition-colors bg-[#f9fafb] text-[#111827]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#6b7280]">Your location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Mumbai, Maharashtra"
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#f97316] transition-colors bg-[#f9fafb] text-[#111827]" />
          </div>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#6b7280]">Product purchased</label>
          <input name="product" value={form.product} onChange={handleChange} placeholder="e.g. Cable ID Printer TP70E"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#f97316] transition-colors bg-[#f9fafb] text-[#111827]" />
        </div>

        {/* Comment */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#6b7280]">Your feedback <span className="text-[#f97316]">*</span></label>
          <textarea name="comment" value={form.comment} onChange={handleChange} rows={4}
            placeholder="Tell us about your experience..."
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#f97316] transition-colors bg-[#f9fafb] text-[#111827] resize-none leading-relaxed" />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#6b7280]">Rate us on (optional)</label>
          <div className="flex flex-wrap gap-3">
            {["Response", "Quality", "Delivery"].map((tag) => (
              <label key={tag} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" value={tag} className="accent-[#f97316] w-3.5 h-3.5"
                  onChange={(e) => {
                    setForm((p) => ({
                      ...p,
                      tags: e.target.checked
                        ? [...(p.tags || []), tag]
                        : (p.tags || []).filter((t) => t !== tag),
                    }));
                  }}
                />
                <span className="text-xs text-[#4b5563]">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <Button type="submit" disabled={loading}
          className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl py-2.5 text-sm font-medium mt-1 disabled:opacity-60">
          {loading ? "Submitting..." : "Submit feedback"}
        </Button>
      </form>
    </div>
  );
}

/* ── MAIN PAGE ────────────────────────────────────────────────── */
export default function FeedbackPage() {
  const [allTestimonials, setAllTestimonials] = useState(originalTestimonials);
  const [stats, setStats] = useState(calcStats(originalTestimonials));
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch live stats from backend
  

  // Fetch approved feedback + live stats on mount
  useEffect(() => {
    // Fetch approved feedback from backend
    api.get("/feedback")
      .then((r) => {
        const backendApproved = r.data || [];
        if (backendApproved.length > 0) {
          setAllTestimonials([...originalTestimonials, ...backendApproved]);
        }
      })
      .catch(() => {});

    // Fetch live stats from backend
    api.get("/feedback/stats")
      .then((r) => {
        setStats(r.data);
      })
      .catch(() => {
        // fallback to local calc
        setStats(calcStats(originalTestimonials));
      });

  }, []); // ← empty array — only runs once on mount

  // When user submits — refetch stats from backend after save
  const handleNewFeedback = useCallback((newEntry) => {
    // Add card immediately to the list
    setAllTestimonials((prev) => [newEntry, ...prev]);

    // Refetch stats from backend after 500ms
    setTimeout(() => {
      api.get("/feedback/stats")
        .then((r) => setStats(r.data))
        .catch(() => {});
    }, 500);
  }, []);

  const filters = ["All", "With comments", "Ferrule Machine", "Label Printer", "Ribbons"];

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1); // reset to page 1 on filter change
  };

 const filtered = allTestimonials.filter((t) => {
    if (t.is_approved === false) return false;
    if (filter === "All") return true;
    if (filter === "With comments") return t.comment?.trim() !== "";
    if (filter === "Ferrule Machine") return t.product?.toLowerCase().includes("ferrule");
    if (filter === "Label Printer") return t.product?.toLowerCase().includes("label printer");
    if (filter === "Ribbons") return t.product?.toLowerCase().includes("ribbon");
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#f9fafb]" data-testid="feedback-page">

      {/* HERO */}
      <section className="bg-[#111827] py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 text-[#f97316] text-[10px] sm:text-xs px-4 py-1.5 rounded-full border border-orange-500/30 mb-5 uppercase tracking-widest">
            <ThumbsUp className="w-3.5 h-3.5" />
            Verified customer reviews
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight mb-4">
            Customer <span className="text-[#f97316]">Feedback</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Real reviews from our customers across India.{" "}
            <span className="text-white font-medium">{stats.total} verified reviews</span> with an overall rating of{" "}
            <span className="text-[#f97316] font-medium">{stats.avg} / 5</span>.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT — stats + form */}
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
              <SummaryStats stats={stats} />
              <FeedbackForm onNewFeedback={handleNewFeedback} />
            </div>

            {/* RIGHT — testimonials */}
            <div className="flex-1 min-w-0">
              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.map((f) => (
  <button
    key={f}
    onClick={() => handleFilterChange(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                      filter === f
                        ? "bg-[#f97316] text-white border-[#f97316]"
                        : "bg-white text-[#4b5563] border-gray-200 hover:border-[#f97316] hover:text-[#f97316]"
                    }`}
                  >
                    {f}{f === "All" && <span className="ml-1.5 opacity-70">({filtered.length})</span>}
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#9ca3af] mb-4">
                Showing {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} review{filtered.length !== 1 ? "s" : ""}
              </p>

              {paginated.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginated.map((t, i) => <TestimonialCard key={i} t={t} />)}
                </div>
              ) : (
                <div className="text-center py-16 text-[#9ca3af]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No reviews match this filter.</p>
                </div>
              )}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {/* Prev */}
                  <button
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-[#4b5563] flex items-center justify-center text-sm transition-all hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &#8592;
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    // Show first, last, current and neighbours only
                    if (
                      p === 1 ||
                      p === totalPages ||
                      p === page ||
                      p === page - 1 ||
                      p === page + 1
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`w-9 h-9 rounded-xl border text-sm font-medium transition-all ${
                            p === page
                              ? "bg-[#f97316] text-white border-[#f97316]"
                              : "bg-white text-[#4b5563] border-gray-200 hover:border-[#f97316] hover:text-[#f97316]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    // Show dots
                    if (p === page - 2 || p === page + 2) {
                      return (
                        <span key={p} className="text-[#9ca3af] text-sm px-1">...</span>
                      );
                    }
                    return null;
                  })}

                  {/* Next */}
                  <button
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-[#4b5563] flex items-center justify-center text-sm transition-all hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &#8594;
                  </button>

                  {/* Page info */}
                  <span className="text-xs text-[#9ca3af] ml-2">
                    Page {page} of {totalPages}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}