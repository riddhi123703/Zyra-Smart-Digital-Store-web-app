import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "../types";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product._id);
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.sizes.length > 1) {
      // Redirect to product page if multiple sizes
      navigate(`/products/${product.slug || product._id}`);
      return;
    }
    addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      size: product.sizes[0] || "One Size",
      color: product.colors[0] || "Default",
      quantity: 1,
    });
    toast.success("Added to cart!");
  };

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/products/${product.slug || product._id}`}
        className="block group rounded-2xl bg-surface-1 border border-white/[0.06] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(192,38,211,0.15)] hover:border-brand-500/20"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-2">
          <img
            src={
              product.images[0] ||
              "https://via.placeholder.com/400x530/1a1a1a/e879f9?text=Zyra"
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />

          {/* Hover overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-brand-500/30">
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-indigo-600/30">
                Featured
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product._id);
            }}
            className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-500/30 hover:border-brand-500/30"
          >
            <Heart
              size={16}
              className={
                wishlisted ? "fill-red-500 text-red-500" : "text-white"
              }
            />
          </button>

          {/* Quick Add */}
          {product.sizes?.length <= 1 && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 bg-white text-black text-sm font-semibold py-2.5 rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-300"
            >
              <ShoppingBag size={14} /> Quick Add
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-gray-500 truncate">
            {typeof product.category === "object" ? product.category.name : ""}
          </p>
          <h3 className="text-sm font-medium text-white mt-0.5 truncate group-hover:text-brand-300 transition-colors duration-300">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-400">
              {product.averageRating.toFixed(1)} ({product.numReviews})
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-white font-bold">
              ₹{product.price.toLocaleString()}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {product.colors?.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color}
                  title={color}
                  className="w-4 h-4 rounded-full border border-white/20 ring-1 ring-transparent group-hover:ring-white/10 transition-all"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
              ))}
              {product.colors?.length > 4 && (
                <span className="text-xs text-gray-500 self-center">
                  +{product.colors?.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
