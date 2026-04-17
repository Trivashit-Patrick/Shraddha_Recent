import { createContext, useContext, useState, useEffect } from "react";

const QuoteContext = createContext(null);

export function QuoteProvider({ children }) {
  const [quoteItems, setQuoteItems] = useState(() => {
    try {
      const saved = localStorage.getItem("shraddha_quote_list");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("shraddha_quote_list", JSON.stringify(quoteItems));
  }, [quoteItems]);

  const addToQuote = (product, colour) => {
    const exists = quoteItems.find(
      i => i.product_id === product.id && i.colour_selected === colour
    );
    if (!exists) {
      setQuoteItems(prev => [...prev, {
        product_id: product.id,
        product_name: product.name,
        colour_selected: colour,
        image: product.colour_variants?.find(v => v.colour_name === colour)?.images?.[0] || ""
      }]);
    }
  };

  const removeFromQuote = (product_id, colour) => {
    setQuoteItems(prev => prev.filter(
      i => !(i.product_id === product_id && i.colour_selected === colour)
    ));
  };

  const clearQuote = () => setQuoteItems([]);

  return (
    <QuoteContext.Provider value={{ quoteItems, addToQuote, removeFromQuote, clearQuote }}>
      {children}
    </QuoteContext.Provider>
  );
}

export const useQuote = () => useContext(QuoteContext);
