import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Truck,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, Review } from "../types";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuthStore } from "../store/useAuthStore";
import api from "../lib/api";
import toast from "react-hot-toast";

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    body: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setQuantityByProduct = useCartStore((s) => s.setQuantityByProduct);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { toggle, isWishlisted } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((r) => {
        setProduct(r.data.product);
        setReviews(r.data.reviews);
      })
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a colour");
      return;
    }
    const size = selectedSize || "One Size";
    const color = selectedColor || "Default";
    const existing = items.find((i) => i.product === product._id);
    if (existing) {
      setQuantityByProduct(product._id, qty, size, color);
      toast.success(`Cart updated to ${qty} item${qty > 1 ? "s" : ""}`);
    } else {
      const result = addItem({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
        size,
        color,
        quantity: qty,
      });
      toast.success(
        result === "updated"
          ? `Cart updated to ${qty} item${qty > 1 ? "s" : ""}`
          : "Added to cart!",
      );
    }
    toggleCart();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to leave a review");
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await api.post("/reviews", {
        productId: product!._id,
        ...reviewForm,
      });
      setReviews((prev) => [data.review, ...prev]);
      setReviewForm({ rating: 5, title: "", body: "" });
      toast.success("Review submitted!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen pt-20 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 rounded w-3/4" />
            <div className="skeleton h-6 rounded w-1/3" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-2/3" />
            <div className="skeleton h-12 rounded-xl w-full mt-6" />
          </div>
        </div>
      </div>
    );

  if (!product) return null;

  const inStock =
    product.stock?.length === 0 ||
    product.stock.some(
      (s) =>
        (!selectedSize || s.size === selectedSize) &&
        (!selectedColor || s.color === selectedColor) &&
        s.quantity > 0,
    );

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface-2 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={
                    product.images[selectedImage] ||
                    "https://via.placeholder.com/600x600/1a1a1a/e879f9?text=Zyra"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 glass p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((i) =>
                        Math.min(product.images?.length - 1, i + 1),
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 glass p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-brand-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? "border-brand-500" : "border-transparent"}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-brand-400 text-sm font-medium">
                {typeof product.category === "object"
                  ? product.category.name
                  : ""}
              </p>
              <h1 className="text-3xl font-bold text-white mt-1">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.round(product.averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  ({product.numReviews} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-white">
                ₹{product.price.toLocaleString()}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.comparePrice.toLocaleString()}
                </span>
              )}
              {discount > 0 && (
                <span className="text-brand-400 font-semibold text-sm">
                  {discount}% off
                </span>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-300 mb-3">
                  Size{" "}
                  {selectedSize && (
                    <span className="text-brand-400">— {selectedSize}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-12 h-11 px-4 rounded-xl border text-sm font-medium transition-all ${
                        selectedSize === s
                          ? "border-brand-500 bg-brand-500/20 text-white"
                          : "border-white/15 text-gray-400 hover:border-brand-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-300 mb-3">
                  Colour{" "}
                  {selectedColor && (
                    <span className="text-brand-400">— {selectedColor}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      title={c}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === c ? "border-brand-400 scale-110" : "border-white/20 hover:border-white/60"}`}
                      style={{ backgroundColor: c.toLowerCase() }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Qty + CTA */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="text-gray-400 hover:text-white"
                >
                  −
                </button>
                <span className="text-white font-semibold w-6 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="text-gray-400 hover:text-white"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn-primary flex-1 justify-center text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                onClick={() => toggle(product._id)}
                className={`p-4 glass rounded-xl transition-all ${isWishlisted(product._id) ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
              >
                <Heart
                  size={20}
                  className={isWishlisted(product._id) ? "fill-red-400" : ""}
                />
              </button>
            </div>

            {/* Perks */}
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Truck size={14} className="text-brand-400" /> Free shipping
                above ₹999
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <RefreshCw size={14} className="text-brand-400" /> 30-day
                returns
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 grid lg:grid-cols-3 gap-10">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-6">
              Write a Review
            </h3>
            <form
              onSubmit={handleReviewSubmit}
              className="glass rounded-2xl p-6 space-y-4"
            >
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setReviewForm((f) => ({ ...f, rating: n }))
                      }
                    >
                      <Star
                        size={24}
                        className={
                          n <= reviewForm.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
              <input
                className="input-base"
                placeholder="Review title"
                value={reviewForm.title}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
              <textarea
                className="input-base resize-none h-28"
                placeholder="Share your experience..."
                value={reviewForm.body}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, body: e.target.value }))
                }
                required
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary w-full justify-center"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">
              Customer Reviews{" "}
              <span className="text-gray-400 font-normal">
                ({reviews?.length})
              </span>
            </h3>
            {reviews?.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="glass rounded-2xl p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                          {r.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {r.user.name}
                          </p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < r.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-600"
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-3">
                      {r.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                      {r.body}
                    </p>
                    {r.isVerifiedPurchase && (
                      <span className="inline-block mt-2 text-xs text-green-400 glass px-2 py-0.5 rounded">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
