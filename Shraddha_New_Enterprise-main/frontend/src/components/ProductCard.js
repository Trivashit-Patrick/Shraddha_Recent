import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const availabilityConfig = {
  in_stock: { label: "In stock", className: "bg-green-100 text-green-700 border-green-200" },
  on_order: { label: "On order", className: "bg-orange-100 text-orange-700 border-orange-200" },
  contact: { label: "Contact for availability", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

/* Fix image URL — prepend BACKEND_URL if relative path */
const fixUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

export default function ProductCard({ product, onSendQuery }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const variant = product.colour_variants?.[selectedVariant];
  const image = fixUrl(variant?.images?.[0] || "");
  const avail = availabilityConfig[product.availability] || availabilityConfig.contact;

  return (
    <div
      className="product-card bg-white rounded-xl border border-gray-200 overflow-hidden colour-transition"
      style={{ borderBottomColor: variant?.hex_code || "transparent", borderBottomWidth: "3px" }}
      data-testid={`product-card-${product.id}`}
    >
      {/* Image */}
      <Link to={`/products/${product.id}`} data-testid={`product-link-${product.id}`}>
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={`${product.name} - ${variant?.colour_name || ""}`}
              className="w-full h-full object-contain p-2 image-fade"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Package className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className={`text-[10px] px-2 py-0.5 rounded-full border ${avail.className}`}>
              {avail.label}
            </Badge>
          </div>
          {product.is_featured && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-[#f97316] text-white text-[10px] px-2 py-0.5 rounded-full border-0">
                Featured
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <p className="text-[11px] text-[#4b5563] mb-1 uppercase tracking-wider">
          {product.category_name || "Product"}
        </p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-[#111827] text-sm mb-1 hover:text-[#f97316] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-[#4b5563] line-clamp-2 mb-3">
          {product.description?.substring(0, 80)}
          {product.description?.length > 80 ? "..." : ""}
        </p>

        {/* Colour Dots */}
        {product.colour_variants?.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {product.colour_variants.map((v, idx) => (
              <button
                key={idx}
                data-testid={`colour-dot-${product.id}-${idx}`}
                onClick={() => setSelectedVariant(idx)}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  idx === selectedVariant
                    ? "ring-2 ring-offset-1 ring-[#f97316] border-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: v.hex_code }}
                title={v.colour_name}
              />
            ))}
            <span className="text-[10px] text-[#4b5563]">{variant?.colour_name}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to={`/products/${product.id}`} className="flex-1">
            <Button
              data-testid={`view-product-${product.id}`}
              variant="outline"
              size="sm"
              className="w-full border-gray-200 text-[#4b5563] hover:text-[#f97316] hover:border-[#f97316] rounded-xl text-xs"
            >
              View
            </Button>
          </Link>
          <Button
            data-testid={`send-query-${product.id}`}
            size="sm"
            onClick={() => onSendQuery?.(product, variant?.colour_name)}
            className="flex-1 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-xs"
          >
            Send query
          </Button>
        </div>
      </div>
    </div>
  );
}

function Package({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}