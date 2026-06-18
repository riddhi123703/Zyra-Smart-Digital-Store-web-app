import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import type { Product } from '../types';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const WishlistPage = () => {
  const { productIds, toggle } = useWishlistStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setLoading(false);
      setProducts([]);
      return;
    }
    // Fetch each wishlisted product
    Promise.all(productIds.map(id => api.get(`/products/${id}`).then(r => r.data.product).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [productIds]);

  const handleAddToCart = (product: Product) => {
    addItem({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size: product.sizes[0] || 'M',
      color: product.colors[0] || 'default',
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-white mb-8">My Wishlist</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[3/4] rounded-2xl" />
                <div className="skeleton h-4 mt-2 rounded w-3/4" />
                <div className="skeleton h-4 mt-1 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (productIds.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="text-gray-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-8">Save items you love to your wishlist.</p>
          <Link to="/products" className="btn-primary px-8 py-3">
            Explore Products <ShoppingBag size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
          <span className="text-sm text-gray-400">{productIds.length} item{productIds.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl overflow-hidden group"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <Link to={`/products/${product.slug}`}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                {/* Remove button */}
                <button
                  onClick={() => toggle(product._id)}
                  className="absolute top-3 right-3 p-2 glass rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/20 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                  </span>
                )}
              </div>
              {/* Info */}
              <div className="p-3">
                <Link to={`/products/${product.slug}`}>
                  <h3 className="text-sm font-medium text-white line-clamp-1 hover:text-brand-300 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-brand-400 font-bold text-sm">₹{product.price.toLocaleString()}</span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-gray-500 text-xs line-through">₹{product.comparePrice.toLocaleString()}</span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn-primary w-full justify-center mt-3 py-2 text-xs"
                >
                  <ShoppingBag size={12} /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
