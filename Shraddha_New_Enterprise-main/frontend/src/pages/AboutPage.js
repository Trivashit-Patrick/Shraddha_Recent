import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, Users, MapPin, Phone,
  Globe, CheckCircle, Package, Truck,
  Award, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── REAL PHOTOS ─────────────────────────────────────────────────
   Copy the 3 images into: frontend/public/images/
     - warehouse.png
     - signboard.png
     - office.png
──────────────────────────────────────────────────────────────── */
const albumPhotos = [
  {
    src: "/images/warehouse.png",
    label: "Our Warehouse",
    desc: "Well-stocked warehouse in Nigdi, Pune",
  },
  {
    src: "/images/signboard.png",
    label: "Sharadha Enterprises Sign Board",
    desc: "Our office signage at Sector 21, Nigdi",
  },
  {
    src: "/images/office.png",
    label: "Our Office",
    desc: "Modern meeting room at our Pune facility",
  },
];

const basicInfo = [
  { label: "Nature of Business", value: "Trader – Wholesaler / Distributor" },
  { label: "Additional Business", value: "Retail Business, Wholesale Business" },
  { label: "Company CEO", value: "Trimbak Yargattikar" },
  { label: "Registered Address", value: "Indradhanu, Sector No. 21, Scheme No. 4, Plot No. 78, Yamunanagar, Nigdi, Pune – 411044, Maharashtra, India" },
  { label: "Total Employees", value: "Upto 10 People" },
  { label: "GST Registration Date", value: "01-07-2017" },
  { label: "Legal Status", value: "Proprietorship" },
  { label: "Annual Turnover", value: "5 – 25 Cr" },
  { label: "GST Partner Name", value: "Shradha Trimbak Yargattikar" },
];

const statutoryInfo = [
  { label: "Import Export Code (IEC)", value: "AAKPY6550D" },
  { label: "GST No.", value: "27AAKPY6550D1ZC" },
  { label: "Banker", value: "Punjab National Bank" },
];

const paymentModes = ["Cash", "Credit Card", "Bank Transfer", "Online"];
const shipmentModes = ["By Air", "By Road", "By Sea"];
const whyUs = [
  "Rich vendor base",
  "Optimum quality product range",
  "On-time delivery",
  "Good market position",
];
const brands = ["Supvan", "Epson", "Canon", "Brother", "Max Letatwin"];
const majorMarkets = ["Gulf Country", "Pan India"];

/* ── LIGHTBOX ─────────────────────────────────────────────────── */
function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  if (index === null || index === undefined) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <img
          src={photos[index].src}
          alt={photos[index].label}
          className="w-full max-h-[75vh] object-contain rounded-2xl"
        />
        <div className="text-center mt-3">
          <p className="text-white text-sm font-medium">{photos[index].label}</p>
          <p className="text-white/50 text-xs mt-1">{photos[index].desc}</p>
        </div>
        <button onClick={onPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={onNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex justify-center gap-1.5 mt-4">
          {photos.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300" style={{ width: i === index ? 20 : 6, height: 6, background: i === index ? "#f97316" : "rgba(255,255,255,0.3)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ────────────────────────────────────────────────── */
export default function AboutPage() {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  return (
    <div className="min-h-screen bg-[#f9fafb]" data-testid="about-page">

      {/* HERO */}
      <section className="bg-[#111827] py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 text-[#f97316] text-[10px] sm:text-xs px-4 py-1.5 rounded-full border border-orange-500/30 mb-5 uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            Established 2008
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight mb-4">
            About <span className="text-[#f97316]">Shradha Enterprises</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A renowned Wholesale Trader and Exporter of Label Printers, Label Tapes, Cable ID Printers and more — trusted by businesses across India and beyond since 2008.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white py-8 sm:py-10 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Award, value: "15+", label: "Years of experience" },
            { icon: Users, value: "500+", label: "Happy clients" },
            { icon: Package, value: "100+", label: "Products" },
            { icon: Globe, value: "20%", label: "Export share" },
          ].map((s, i) => (
            <div key={i} className="text-center py-4 px-2">
              <s.icon className="w-6 h-6 text-[#f97316] mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-medium text-[#111827]">{s.value}</div>
              <div className="text-xs text-[#6b7280] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-medium text-[#111827] mb-6">Who we are</h2>
          <div className="space-y-4 text-[#4b5563] text-sm sm:text-base leading-relaxed">
            <p>Established in the year <strong>2008</strong>, we, <strong>"Shradha Enterprises"</strong>, are one of the renowned <strong>Wholesale Trader and Exporter</strong> of an extended collection of Label Printers, Label Tapes and many more. These products are admired for their easy usability, low maintenance, and long life.</p>
            <p>These products are procured from some of the licensed vendors of the market. These vendors are selected by our procurement agents after a thorough evaluation of their ability to meet bulk orders, delivery schedules, market reputation, past clients served, and quality standards. We have formed amicable relations with our vendors by practicing fair business policies and maintaining crystal clear communication with them.</p>
            <p>Our mentor, <strong>Mr. Trimbak Yargattikar</strong>, is instrumental in our success in this domain. His knowledge has enabled us to garner a huge clientele.</p>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-12 sm:py-16 px-4 bg-[#f9fafb]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-medium text-[#111827] mb-6">Our story</h2>
          <div className="space-y-4 text-[#4b5563] text-sm sm:text-base leading-relaxed">
            <p>Since the founding of our company in the year 2008, we have earned a reputation as a leading supplier, trader, wholesaler and exporter of various types of unique products. We provide a diverse assortment of goods, some of which are Supvan Printer Label Tape Cassette, Epson LW 700 Label Printer, TR-100BK-PT Brother Black Ink Ribbon, PT-509Y Label Tape Cassette, TP70E Cable ID Printer, Canon Ink Ribbon, and many more.</p>
            <p>Finest grade of raw materials are used for the production of goods. Our products always exceed the expectations of customers because of their distinctive design, excellent quality, top-notch performance, and affordable pricing.</p>
            <p>We have our facility based in the city of Pune, Maharashtra, India, where we get the products from the leading vendors of the industry. We also make sure that we conduct business in a wholly ethical manner in order to ensure the complete satisfaction of our customers.</p>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-medium text-[#111827] mb-3">Why choose us?</h2>
          <p className="text-[#6b7280] text-sm mb-8 leading-relaxed">Banking on our vendor base and market reputation, we can offer optimum quality printers and accessories. We have a team to coordinate with our vendors and clients to meet the exact requirements.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {whyUs.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#fff7ed] border border-orange-100 rounded-xl px-4 sm:px-5 py-4">
                <CheckCircle className="w-5 h-5 text-[#f97316] flex-shrink-0" />
                <span className="text-[#111827] text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACTSHEET */}
      <section className="py-12 sm:py-16 px-4 bg-[#f9fafb]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-medium text-[#111827] mb-8">Factsheet</h2>
          <div className="flex flex-col gap-5">

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-[#111827] px-5 py-3"><h3 className="text-sm font-medium text-white">Basic information</h3></div>
              <div className="divide-y divide-gray-50">
                {basicInfo.map((row, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-5 py-3">
                    <span className="text-xs text-[#6b7280] sm:w-44 flex-shrink-0 font-medium">{row.label}</span>
                    <span className="text-xs text-[#111827]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-[#111827] px-5 py-3"><h3 className="text-sm font-medium text-white">Statutory profile</h3></div>
              <div className="divide-y divide-gray-50">
                {statutoryInfo.map((row, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-5 py-3">
                    <span className="text-xs text-[#6b7280] sm:w-44 flex-shrink-0 font-medium">{row.label}</span>
                    <span className="text-xs text-[#111827] font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Shipment */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-[#111827] px-5 py-3"><h3 className="text-sm font-medium text-white">Payment & shipment</h3></div>
              <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-3 font-medium">Payment modes</p>
                  <div className="flex flex-wrap gap-2">
                    {paymentModes.map((m) => (
                      <span key={m} className="text-xs bg-orange-50 text-[#f97316] border border-orange-100 px-3 py-1 rounded-full">{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-3 font-medium">Shipment modes</p>
                  <div className="flex flex-wrap gap-2">
                    {shipmentModes.map((m) => (
                      <span key={m} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <Truck className="w-3 h-3" />{m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Brands + Markets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-[#111827] px-5 py-3"><h3 className="text-sm font-medium text-white">Brands we deal in</h3></div>
                <div className="px-5 py-4 flex flex-wrap gap-2">
                  {brands.map((b) => (
                    <span key={b} className="text-xs bg-[#f9fafb] border border-gray-200 text-[#111827] px-3 py-1.5 rounded-full font-medium">{b}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-[#111827] px-5 py-3"><h3 className="text-sm font-medium text-white">Major markets</h3></div>
                <div className="px-5 py-4 flex flex-wrap gap-2">
                  {majorMarkets.map((m) => (
                    <span key={m} className="text-xs bg-green-50 border border-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                      <Globe className="w-3 h-3" />{m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY ALBUM */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-medium text-[#111827] mb-2">Company album</h2>
          <p className="text-sm text-[#6b7280] mb-8">A glimpse into our warehouse, office and branding</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {albumPhotos.map((photo, i) => (
              <div
                key={i}
                onClick={() => setLightboxIdx(i)}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 cursor-pointer hover:border-[#f97316] transition-all duration-300"
                style={{ aspectRatio: "4/3" }}
              >
                <img
                  src={photo.src}
                  alt={photo.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex flex-col justify-end p-4">
                  <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-sm font-medium">{photo.label}</p>
                    <p className="text-white/70 text-xs mt-0.5">{photo.desc}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-14 sm:py-16 px-4 bg-[#111827]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-medium text-white mb-3">Get in touch with us</h2>
          <p className="text-gray-400 text-sm mb-2">Trimbak Yargattikar (CEO) — Shradha Enterprises</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-400 mb-8">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#f97316]" />Indradhanu, Sector 21, Nigdi, Pune – 411044</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#f97316]" />07942537207</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl px-6">Contact us</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 rounded-xl px-6">Browse products</Button>
            </Link>
            <a href="https://maps.app.goo.gl/vjq371YgqbYXeUPV6" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 rounded-xl px-6">
                <MapPin className="w-4 h-4 mr-2" />Get directions
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Lightbox
        photos={albumPhotos}
        index={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onPrev={() => setLightboxIdx(i => (i - 1 + albumPhotos.length) % albumPhotos.length)}
        onNext={() => setLightboxIdx(i => (i + 1) % albumPhotos.length)}
      />
    </div>
  );
}