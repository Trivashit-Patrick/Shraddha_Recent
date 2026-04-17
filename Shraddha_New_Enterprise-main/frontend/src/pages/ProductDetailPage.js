import { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import ProductCard from "@/components/ProductCard";
import QueryModal from "@/components/QueryModal";
import { useQuote } from "@/contexts/QuoteContext";
import api from "@/lib/api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const availMap = {
  in_stock: { label: "In stock", cls: "bg-green-100 text-green-700" },
  on_order: { label: "On order", cls: "bg-orange-100 text-orange-700" },
  contact: { label: "Contact for availability", cls: "bg-gray-100 text-gray-600" },
};

/* Fix image URL — prepend BACKEND_URL if it's a relative path */
const fixUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { settings } = useOutletContext();
  const { addToQuote } = useQuote();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [queryModal, setQueryModal] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [addedToQuote, setAddedToQuote] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data);
        setSelectedVariant(0);
        setSelectedImage(0);
        // Track recently viewed in localStorage
        const viewed = JSON.parse(localStorage.getItem("shraddha_recent") || "[]");
        const filtered = viewed.filter(v => v.id !== id);
        filtered.unshift({
          id: r.data.id,
          name: r.data.name,
          image: r.data.colour_variants?.[0]?.images?.[0],
        });
        localStorage.setItem("shraddha_recent", JSON.stringify(filtered.slice(0, 5)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load recently viewed products
    const viewed = JSON.parse(localStorage.getItem("shraddha_recent") || "[]")
      .filter(v => v.id !== id);
    if (viewed.length > 0) {
      Promise.all(
        viewed.slice(0, 4).map(v =>
          api.get(`/products/${v.id}`).then(r => r.data).catch(() => null)
        )
      ).then(results => setRecentlyViewed(results.filter(Boolean)));
    }
  }, [id]);

  /* ── LOADING ── */
  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded-xl aspect-square" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );

  /* ── NOT FOUND ── */
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="text-[#4b5563]">Product not found</p>
      <Link to="/products">
        <Button className="mt-4 bg-[#f97316] text-white rounded-xl">
          Back to products
        </Button>
      </Link>
    </div>
  );

  const variant = product.colour_variants?.[selectedVariant];

  /* Fix all image URLs for current variant */
  const images = (variant?.images || []).map(fixUrl);
  const currentImage = images[selectedImage] || images[0] || "";
  const avail = availMap[product.availability] || availMap.contact;

  const handleAddToQuote = () => {
    addToQuote(product, variant?.colour_name || "");
    setAddedToQuote(true);
    setTimeout(() => setAddedToQuote(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="product-detail-page">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6" data-testid="breadcrumb">
        <Link to="/" className="text-[#4b5563] hover:text-[#f97316]">Home</Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <Link to="/products" className="text-[#4b5563] hover:text-[#f97316]">Products</Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-[#111827] font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* ── IMAGE GALLERY ── */}
        <div data-testid="product-gallery">
          {/* Main image */}
          <div className="bg-gray-50 rounded-xl overflow-hidden aspect-square mb-3 border border-gray-100">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain p-4 image-fade"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <div className="text-center">
                  <div className="text-5xl mb-2">📦</div>
                  <p className="text-sm text-gray-400">No image</p>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  data-testid={`thumbnail-${idx}`}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all bg-gray-50 ${
                    idx === selectedImage
                      ? "border-[#f97316]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── PRODUCT INFO ── */}
        <div data-testid="product-info">
          {/* Category breadcrumb */}
          <div className="flex items-center gap-2 mb-2">
            {product.category_name && (
              <span className="text-xs text-[#4b5563] uppercase tracking-wider">
                {product.category_name}
              </span>
            )}
            {product.subcategory_name && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-[#4b5563] uppercase tracking-wider">
                  {product.subcategory_name}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-medium text-[#111827] mb-3">
            {product.name}
          </h1>

          <Badge
            className={`text-xs px-2.5 py-1 rounded-full mb-4 ${avail.cls}`}
            data-testid="availability-badge"
          >
            {avail.label}
          </Badge>

          <p className="text-sm text-[#4b5563] leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Colour Variants */}
          {product.colour_variants?.length > 0 && (
            <div className="mb-6" data-testid="colour-selector">
              <p className="text-xs text-[#4b5563] uppercase tracking-wider mb-2">
                Colour:{" "}
                <span className="text-[#111827] font-medium normal-case">
                  {variant?.colour_name}
                </span>
              </p>
              <div className="flex items-center gap-3">
                {product.colour_variants.map((v, idx) => (
                  <button
                    key={idx}
                    data-testid={`detail-colour-${idx}`}
                    onClick={() => { setSelectedVariant(idx); setSelectedImage(0); }}
                    title={v.colour_name}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      idx === selectedVariant
                        ? "ring-2 ring-offset-2 ring-[#f97316] border-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: v.hex_code }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              data-testid="detail-send-query-btn"
              onClick={() => setQueryModal(true)}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl px-6"
            >
              Send query
            </Button>
            <Button
              data-testid="detail-add-quote-btn"
              variant="outline"
              onClick={handleAddToQuote}
              className={`rounded-xl px-6 transition-all ${
                addedToQuote
                  ? "bg-green-50 text-green-600 border-green-300"
                  : "border-[#f97316] text-[#f97316] hover:bg-orange-50"
              }`}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {addedToQuote ? "Added ✓" : "Add to quote"}
            </Button>
          </div>

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <div data-testid="specifications-table">
              <h3 className="font-medium text-[#111827] mb-3">Specifications</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableBody>
                    {product.specifications.map((spec, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-[#4b5563] font-medium w-40">
                          {spec.key}
                        </TableCell>
                        <TableCell className="text-sm text-[#111827]">
                          {spec.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.related_products?.length > 0 && (
        <section className="mt-16" data-testid="related-products">
          <h2 className="text-xl font-medium text-[#111827] mb-6">You may also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.related_products.map(rp => (
              <ProductCard
                key={rp.id}
                product={rp}
                onSendQuery={() => setQueryModal(true)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="mt-16" data-testid="recently-viewed">
          <h2 className="text-xl font-medium text-[#111827] mb-6">Recently viewed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.map(rv => (
              <ProductCard
                key={rv.id}
                product={rv}
                onSendQuery={() => setQueryModal(true)}
              />
            ))}
          </div>
        </section>
      )}

      <QueryModal
        open={queryModal}
        onOpenChange={setQueryModal}
        productName={product.name}
        colourName={variant?.colour_name}
      />
    </div>
  );
}