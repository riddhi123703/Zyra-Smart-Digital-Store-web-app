import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Loader2, Package } from "lucide-react";
import type { Product, Category } from "../../types";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string;
  comparePrice: string;
  images: string;
  sizes: string;
  colors: string;
  tags: string;
  isFeatured: boolean;
}

const defaultForm: ProductForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  comparePrice: "",
  images: "",
  sizes: "S,M,L,XL",
  colors: "black,white",
  tags: "",
  isFeatured: false,
};

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchProducts = () => {
    api
      .get("/products?limit=100")
      .then((r) => setProducts(r.data.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get("/categories").then((r) => setCategories(r.data.categories || []));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category?._id || "",
      price: String(product.price),
      comparePrice: String(product.comparePrice || ""),
      images: product.images.join(", "),
      sizes: product.sizes.join(","),
      colors: product.colors.join(","),
      tags: product.tags.join(", "),
      isFeatured: product.isFeatured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      images: form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: form.colors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      isFeatured: form.isFeatured,
    };
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
        toast.success("Product updated!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created!");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const F = (
    label: string,
    key: keyof ProductForm,
    placeholder?: string,
    type = "text",
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="input-base text-sm py-2"
        placeholder={placeholder || label}
      />
    </div>
  );

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 text-sm mt-1">
            {products.length} products
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        {/* <Search size={16} className="input-icon-left text-gray-500" /> */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9 text-sm"
          placeholder="Search products..."
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">No products found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl overflow-hidden group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-surface-2">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-gray-600" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-brand-400 font-bold text-sm">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.comparePrice && (
                        <span className="text-gray-500 text-xs line-through">
                          ₹{product.comparePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.isFeatured && (
                        <span className="text-xs bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                      <span className="text-xs bg-surface-2 text-gray-400 px-1.5 py-0.5 rounded-full">
                        {product.numReviews} reviews
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(product)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deletingId === product._id}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      {deletingId === product._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal — rendered via Portal to escape sidebar's stacking context */}
      {createPortal(
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 flex-shrink-0">
                  <h2 className="text-lg font-bold text-white">
                    {editing ? "Edit Product" : "Add Product"}
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <form
                  onSubmit={handleSave}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {F("Product Name", "name", "Premium Cotton T-Shirt")}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        className="input-base text-sm py-2 h-20 resize-none"
                        placeholder="Product description..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                        className="input-base text-sm py-2"
                      >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {F("Price (₹)", "price", "999", "number")}
                      {F("Compare Price (₹)", "comparePrice", "1299", "number")}
                    </div>
                    {F("Image URLs", "images", "url1, url2, ...")}
                    {F("Sizes", "sizes", "S,M,L,XL")}
                    {F("Colors", "colors", "black,white,blue")}
                    {F("Tags", "tags", "men, casual, cotton")}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() =>
                          setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))
                        }
                        className={`w-10 h-5 rounded-full relative transition-colors ${form.isFeatured ? "bg-brand-500" : "bg-surface-2"}`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isFeatured ? "left-5" : "left-0.5"}`}
                        />
                      </div>
                      <span className="text-sm text-gray-300">
                        Featured product
                      </span>
                    </label>
                  </div>

                  {/* Fixed Footer */}
                  <div className="flex gap-3 p-6 pt-4 border-t border-white/10 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="btn-outline flex-1 justify-center py-2.5 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex-1 justify-center py-2.5 text-sm"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : editing ? (
                        "Save Changes"
                      ) : (
                        "Create Product"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};
