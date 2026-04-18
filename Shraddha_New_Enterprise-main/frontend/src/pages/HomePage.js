import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowRight, Zap, Shield, Headphones, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QueryModal from "@/components/QueryModal";
import api from "@/lib/api";

const features = [
  { icon: Zap, title: "Fast response", desc: "Get quotes and product information within hours, not days." },
  { icon: Shield, title: "Quality products", desc: "All products sourced from certified manufacturers with warranty." },
  { icon: Headphones, title: "Expert support", desc: "Our technical team helps you choose the right products." },
];

const gradients = [
  "linear-gradient(135deg,#78350f,#f97316)",
  "linear-gradient(135deg,#1e3a5f,#3b82f6)",
  "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#3b0764,#a855f7)",
  "linear-gradient(135deg,#7f1d1d,#ef4444)",
  "linear-gradient(135deg,#0c4a6e,#0ea5e9)",
];

function FeaturedCarousel({ products }) {
  const navigate = useNavigate();
  const viewportRef = useRef(null);
  const [vpWidth, setVpWidth] = useState(0);
  const [cur, setCur] = useState(0);
  const touchStartX = useRef(null);
  const isJumping = useRef(false);
  const clonedIdxRef = useRef(1);
  const [clonedIdx, setClonedIdxState] = useState(1);
  const [transition, setTransition] = useState(false);

  const total = products.length;
  const cloned = total > 0 ? [products[total - 1], ...products, products[0]] : [];
  const clonedTotal = cloned.length;

  const isMobile = vpWidth > 0 && vpWidth < 768;

  const cardWidth = vpWidth === 0
    ? 600
    : vpWidth < 480
    ? vpWidth - 48
    : vpWidth < 768
    ? vpWidth - 80
    : Math.min(600, vpWidth - 160);

  const gap = isMobile ? 12 : 20;

  const setClonedIdx = useCallback((val) => {
    clonedIdxRef.current = val;
    setClonedIdxState(val);
  }, []);

  // Measure viewport
  useEffect(() => {
    const measure = () => {
      if (viewportRef.current) {
        setVpWidth(viewportRef.current.offsetWidth);
      }
    };
    const t = setTimeout(measure, 30);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, []);

  const goToCloned = useCallback((idx, withAnim = true) => {
    if (isJumping.current) return;
    setTransition(withAnim);
    setClonedIdx(idx);
    const real = ((idx - 1) % total + total) % total;
    setCur(real);
  }, [total, setClonedIdx]);

  const move = useCallback((dir) => {
    goToCloned(clonedIdxRef.current + dir);
  }, [goToCloned]);


  
  const handleTransitionEnd = useCallback(() => {
    const idx = clonedIdxRef.current;
    if (idx === 0) {
      isJumping.current = true;
      setTransition(false);
      setClonedIdx(total);
      setCur(total - 1);
      requestAnimationFrame(() => requestAnimationFrame(() => { isJumping.current = false; }));
    } else if (idx === clonedTotal - 1) {
      isJumping.current = true;
      setTransition(false);
      setClonedIdx(1);
      setCur(0);
      requestAnimationFrame(() => requestAnimationFrame(() => { isJumping.current = false; }));
    }
  }, [total, clonedTotal, setClonedIdx]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) move(diff > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (total === 0) return null;

  const offset = vpWidth === 0
    ? 0
    : (vpWidth / 2) - (cardWidth / 2) - (clonedIdx * (cardWidth + gap));

  return (
    <div className="relative select-none">
      <div
        ref={viewportRef}
        className="overflow-hidden py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {vpWidth > 0 && (
          <div
            className="flex items-stretch"
            style={{
              gap,
              transform: `translateX(${offset}px)`,
              transition: transition
                ? "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {cloned.map((product, idx) => {
              const isActive = idx === clonedIdx;
              const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const rawImage = product.colour_variants?.[0]?.images?.[0] || null;
const imageUrl = rawImage
  ? rawImage.startsWith("http") ? rawImage : `${BACKEND_URL}${rawImage}`
  : null;
              const realIdx = products.findIndex(p => p.id === product.id);
              const gradIdx = realIdx >= 0 ? realIdx : idx;

              return (
                <div
                  key={`${product.id}-${idx}`}
                  onClick={() => {
                    if (isActive) {
                      navigate(`/products/${product.id}`);
                    } else {
                      const dir = idx > clonedIdxRef.current ? 1 : -1;
                      goToCloned(clonedIdxRef.current + dir);
                    }
                  }}
                  style={{
                    width: cardWidth,
                    minWidth: cardWidth,
                    flexShrink: 0,
                    opacity: isActive ? 1 : 0.35,
                    transform: isActive ? "scale(1)" : "scale(0.9)",
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                    cursor: "pointer",
                    borderColor: isActive
                      ? "rgba(249,115,22,0.5)"
                      : "rgba(255,255,255,0.06)",
                  }}
                  className={`bg-[#1f2937] rounded-2xl overflow-hidden border ${isMobile ? "flex flex-col" : "flex"}`}
                >
                  {/* Image */}
                  <div
                    className="relative flex items-center justify-center flex-shrink-0"
                    style={{
                      width: isMobile ? "100%" : 220,
                      minHeight: isMobile ? 200 : 260,
                      background: gradients[gradIdx % gradients.length],
                      padding: isMobile ? 20 : 28,
                    }}
                  >
                    {product.is_featured && (
                      <span className="absolute top-3 left-3 bg-[#f97316] text-white text-[9px] px-2 py-1 rounded-full uppercase tracking-wide">
                        Featured
                      </span>
                    )}
                    {product.availability === "in_stock" && (
                      <span className="absolute bottom-3 left-3 bg-green-900/40 text-green-400 border border-green-500/30 text-[9px] px-2 py-1 rounded-full">
                        In stock
                      </span>
                    )}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="object-contain w-full"
                        style={{ maxHeight: isMobile ? 160 : 200 }}
                      />
                    ) : (
                      <div style={{ fontSize: isMobile ? 56 : 72 }}>🖨️</div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    className="flex flex-col justify-center flex-1"
                    style={{ padding: isMobile ? 16 : "28px 24px" }}
                  >
                    <p className="text-[10px] text-[#f97316] uppercase tracking-widest mb-2">
                      {product.category_name || "Product"}
                      {product.subcategory_name ? ` / ${product.subcategory_name}` : ""}
                    </p>
                    <h3
                      className="font-medium text-white leading-snug mb-2"
                      style={{ fontSize: isMobile ? 16 : 20 }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="text-gray-400 leading-relaxed mb-4"
                      style={{ fontSize: isMobile ? 12 : 13 }}
                    >
                      {product.description?.substring(0, isMobile ? 80 : 150)}
                      {product.description?.length > (isMobile ? 80 : 150) ? "..." : ""}
                    </p>

                    {!isMobile && product.specifications?.length > 0 && (
                      <ul className="mb-5 space-y-1">
                        {product.specifications.slice(0, 3).map((spec, i) => (
                          <li key={i} className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] flex-shrink-0" />
                            {spec.key}: {spec.value}
                          </li>
                        ))}
                      </ul>
                    )}

                    {isActive && (
                      <div className="flex items-center gap-2 text-[#f97316] text-xs mt-auto">
                        <ArrowRight className="w-3.5 h-3.5" />
                        {isMobile ? "Tap to view" : "Click to view product"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-center gap-5 mt-2 pb-6">
        <button
         onClick={() => move(-1)}
          className="w-9 h-9 rounded-full border border-white/15 bg-white/5 text-white flex items-center justify-center transition-all hover:border-[#f97316] hover:bg-orange-500/15 hover:text-[#f97316]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goToCloned(i + 1)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === cur ? 20 : 6,
                background: i === cur ? "#f97316" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => move(1)}
          className="w-9 h-9 rounded-full border border-white/15 bg-white/5 text-white flex items-center justify-center transition-all hover:border-[#f97316] hover:bg-orange-500/15 hover:text-[#f97316]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { settings } = useOutletContext();
  const [featured, setFeatured] = useState([]);
  api.get("/testimonials").then(r => setTestimonials(r.data || [])).catch(() => {});
  const [queryModal, setQueryModal] = useState({ open: false, product: "", colour: "" });

  useEffect(() => {
    api.get("/products?featured=true&limit=8").then(r => {
      const prods = r.data.products || [];
      api.get("/categories").then(catRes => {
        const cats = catRes.data || [];
        const catMap = {};
        cats.forEach(c => { catMap[c.id] = c.name; });
        prods.forEach(p => { p.category_name = catMap[p.category_id] || ""; });
        setFeatured(prods);
      });
    }).catch(() => {});
    api.get("/testimonials").then(r => setTestimonials(r.data || [])).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">

      {/* HERO + CAROUSEL */}
      <section className="bg-[#111827] overflow-hidden pb-2" data-testid="hero-section">
  {featured.length > 0 ? (
    <div className="pt-6" data-testid="featured-carousel">
      <FeaturedCarousel products={featured} />
    </div>
  ) : (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Loading skeleton */}
      <div className="text-center mb-8">
        <div className="h-4 bg-white/10 rounded-full w-32 mx-auto mb-4 animate-pulse" />
        <div className="h-8 bg-white/10 rounded-full w-96 mx-auto mb-3 animate-pulse" />
        <div className="h-4 bg-white/10 rounded-full w-64 mx-auto animate-pulse" />
      </div>
      <div className="flex gap-4 justify-center items-center overflow-hidden">
        <div className="w-full max-w-xl h-64 bg-white/5 rounded-2xl animate-pulse flex-shrink-0" />
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {[1,2,3].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
        ))}
      </div>
    </div>
  )}
</section>

      {/* FEATURES */}
      <section className="py-16 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-gray-200 hover:-translate-y-1 transition-all duration-300"
                  data-testid={`feature-card-${idx}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#f97316]" />
                  </div>
                  <h3 className="font-medium text-[#111827] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#4b5563] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
<section className="py-16 bg-white" data-testid="testimonials-section">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl md:text-3xl font-medium text-[#111827] text-center mb-2">
      What our clients say
    </h2>
    <p className="text-sm text-[#4b5563] text-center mb-10">
      Trusted by businesses across India
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

      {/* Tejas Gore */}
      <div className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-md hover:border-[#f97316]/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
              TG
            </div>
            <div>
              <p className="text-sm font-medium text-[#111827]">Tejas Gore</p>
              <p className="text-xs text-[#6b7280] flex items-center gap-1">
                <span>📍</span> Pune, Maharashtra
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-4 h-4 fill-[#f97316] text-[#f97316]" />
              ))}
            </div>
            <span className="text-[10px] text-[#9ca3af]">26 Nov 2022</span>
          </div>
        </div>
        <div className="bg-[#f9fafb] rounded-xl px-3 py-2 mb-3">
          <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest mb-0.5">Product</p>
          <p className="text-xs font-medium text-[#111827]">Ferrule Printing Machine</p>
        </div>
        <p className="text-sm text-[#4b5563] leading-relaxed italic border-l-2 border-[#f97316]/30 pl-3 mb-4">
          "The support team was very co-operative and quick"
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full border font-medium bg-orange-50 text-orange-600 border-orange-100">✓ Response</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full border font-medium bg-green-50 text-green-600 border-green-100">✓ Quality</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full border font-medium bg-blue-50 text-blue-600 border-blue-100">✓ Delivery</span>
        </div>
      </div>

      {/* Ashwini Bonde */}
      <div className="p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-md hover:border-[#f97316]/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
              AB
            </div>
            <div>
              <p className="text-sm font-medium text-[#111827]">Ashwini Bonde</p>
              <p className="text-xs text-[#6b7280] flex items-center gap-1">
                <span>📍</span> Pimpri Chinchwad, Maharashtra
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-4 h-4 fill-[#f97316] text-[#f97316]" />
              ))}
            </div>
            <span className="text-[10px] text-[#9ca3af]">19 Nov 2022</span>
          </div>
        </div>
        <div className="bg-[#f9fafb] rounded-xl px-3 py-2 mb-3">
          <p className="text-[9px] text-[#9ca3af] uppercase tracking-widest mb-0.5">Product</p>
          <p className="text-xs font-medium text-[#111827]">Ferrule Printing Machine</p>
        </div>
        <p className="text-sm text-[#4b5563] leading-relaxed italic border-l-2 border-[#f97316]/30 pl-3 mb-4">
          "Works really good, the quality of the products appears to be great and response from the team was quick"
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full border font-medium bg-orange-50 text-orange-600 border-orange-100">✓ Response</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full border font-medium bg-green-50 text-green-600 border-green-100">✓ Quality</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full border font-medium bg-blue-50 text-blue-600 border-blue-100">✓ Delivery</span>
        </div>
      </div>

    </div>

    {/* View all feedback link */}
    <div className="text-center mt-8">
      <Link to="/feedback">
        <Button variant="outline" className="border-[#f97316] text-[#f97316] hover:bg-orange-50 rounded-xl text-sm">
          View all 19 reviews →
        </Button>
      </Link>
    </div>
  </div>
</section>

    {/* CLIENT LOGOS — commented out for now */}
{/* <section className="py-10 bg-[#f3f4f6] overflow-hidden" data-testid="client-logos-section">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <p className="text-xs text-center text-[#4b5563] uppercase tracking-widest mb-6">
      Trusted by leading companies
    </p>
    <div className="flex items-center justify-center gap-12 opacity-40 flex-wrap">
      {["Tata", "Larsen & Toubro", "Siemens", "ABB", "Schneider", "Havells"].map(name => (
        <span key={name} className="text-lg font-medium text-[#111827] whitespace-nowrap">{name}</span>
      ))}
    </div>
  </div>
</section> */}

      {/* CTA */}
      <section className="py-16 bg-[#111827]" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-white mb-3">
            Need a specific product or bulk order?
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Send us your requirements and our team will get back to you with the best pricing.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" data-testid="cta-explore-btn">
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl px-6">
                Explore products
              </Button>
            </Link>
            <Link to="/contact" data-testid="cta-contact-btn">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl px-6">
                Get in touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <QueryModal
        open={queryModal.open}
        onOpenChange={(v) => setQueryModal(p => ({ ...p, open: v }))}
        productName={queryModal.product}
        colourName={queryModal.colour}
      />
    </div>
  );
}