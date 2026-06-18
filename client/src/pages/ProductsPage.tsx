import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import type { Product, ProductFilters, Category } from "../types";
import api from "../lib/api";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
];

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true); // Open by default if screen allows? Or just responsive.

  const filters: ProductFilters = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    sizes: searchParams.get("sizes")
      ? searchParams.get("sizes")!.split(",")
      : undefined,
    colors: searchParams.get("colors")
      ? searchParams.get("colors")!.split(",")
      : undefined,
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page") || "1"),
  };

  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCategories(r.data.categories))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    // Clear products to force skeleton show if desired,
    // or keep them for a smoother 'silent update' feel.
    // User wants skeleton, so we clear them.
    setProducts([]);

    try {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = String(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = String(filters.maxPrice);
      if (filters.sizes?.length) params.sizes = filters.sizes.join(",");
      if (filters.colors?.length) params.colors = filters.colors.join(",");
      if (filters.sort) params.sort = filters.sort;
      params.page = String(filters.page || 1);
      params.limit = "12";

      const { data } = await api.get("/products", { params });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams.toString()]); // Re-fetch whenever URL params change

  useEffect(() => {
    setLoading(true);
    setProducts([]); // Clear results immediately to show skeleton
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Small debounce to prevent rapid-fire requests
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next, { replace: true }); // Use replace to avoid massive back-button stack during filtering
  };

  const toggleSize = (size: string) => {
    const current = filters.sizes || [];
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    updateParam("sizes", next.join(",") || undefined);
  };

  const toggleColor = (color: string) => {
    const current = filters.colors || [];
    const next = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color];
    updateParam("colors", next.join(",") || undefined);
  };

  const clearAll = () => setSearchParams({});

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {filters.search
                ? `Results for "${filters.search}"`
                : filters.category
                  ? categories.find(
                      (c) =>
                        c.slug === filters.category ||
                        c._id === filters.category,
                    )?.name || filters.category
                  : "All Products"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{total} products found</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="input-base pr-8 py-2 text-sm appearance-none cursor-pointer w-44"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="input-icon-right text-gray-400 pointer-events-none"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="btn-outline text-sm py-2 px-4 flex items-center gap-2"
            >
              <SlidersHorizontal size={14} /> {filtersOpen ? "Hide" : "Show"}{" "}
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {filtersOpen && (
            <aside className="w-64 flex-shrink-0">
              <div className="glass rounded-2xl p-6 sticky top-24 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                    Filter By
                  </h3>
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-bold uppercase text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Category
                  </h4>
                  <div className="space-y-2">
                    {categories?.length === 0 ? (
                      <>
                        <div className="skeleton h-4 w-3/4 rounded-md" />
                        <div className="skeleton h-4 w-1/2 rounded-md" />
                        <div className="skeleton h-4 w-2/3 rounded-md" />
                        <div className="skeleton h-4 w-1/2 rounded-md" />
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => updateParam("category", undefined)}
                          className={`block text-sm transition-all ${!filters.category ? "text-brand-400 font-semibold" : "text-gray-400 hover:text-white"}`}
                        >
                          All Categories
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat._id}
                            onClick={() => updateParam("category", cat.slug)}
                            className={`block text-sm transition-all ${filters.category === cat.slug || filters.category === cat._id ? "text-brand-400 font-semibold translate-x-1" : "text-gray-400 hover:text-white"}`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Price Range
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="input-icon-left text-gray-500 text-xs text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice || ""}
                          onChange={(e) =>
                            updateParam("minPrice", e.target.value)
                          }
                          className="input-base py-2 pl-7 text-xs w-full"
                        />
                      </div>
                      <div className="relative flex-1">
                        <span className="input-icon-left text-gray-500 text-xs text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ""}
                          onChange={(e) =>
                            updateParam("maxPrice", e.target.value)
                          }
                          className="input-base py-2 pl-7 text-xs w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Sizes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSize(s)}
                        className={`w-10 h-8 text-[11px] font-bold rounded-lg border transition-all ${
                          filters.sizes?.includes(s)
                            ? "border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                            : "border-white/10 text-gray-400 hover:border-brand-500/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Colors
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      "Black",
                      "White",
                      "Blue",
                      "Red",
                      "Green",
                      "Yellow",
                      "Purple",
                      "Grey",
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleColor(c.toLowerCase())}
                        title={c}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${filters.colors?.includes(c.toLowerCase()) ? "border-brand-400 scale-125 shadow-lg" : "border-white/10 hover:scale-110"}`}
                        style={{
                          backgroundColor: c.toLowerCase(),
                          borderColor: filters.colors?.includes(c.toLowerCase())
                            ? undefined
                            : "rgba(255,255,255,0.1)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                >
                  <X size={14} /> Collapse
                </button>
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {/* Active Filter Pills */}
            {(filters.sizes?.length ||
              filters.minPrice ||
              filters.maxPrice) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.sizes?.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 glass text-xs text-brand-300 px-3 py-1 rounded-full"
                  >
                    Size: {s}
                    <button onClick={() => toggleSize(s)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="flex items-center gap-1 glass text-xs text-brand-300 px-3 py-1 rounded-full">
                    ₹{filters.minPrice || 0} – ₹{filters.maxPrice || "∞"}
                    <button
                      onClick={() => {
                        updateParam("minPrice", undefined);
                        updateParam("maxPrice", undefined);
                      }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(12)].map((_, i) => (
                  <div key={i}>
                    <div className="skeleton aspect-[3/4] rounded-2xl" />
                    <div className="skeleton h-4 mt-3 rounded w-3/4" />
                    <div className="skeleton h-4 mt-2 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No products found.</p>
                <button onClick={clearAll} className="btn-primary mt-4">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {[...Array(pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateParam("page", String(i + 1))}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                          filters.page === i + 1
                            ? "bg-brand-500 text-white"
                            : "glass text-gray-400 hover:text-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
