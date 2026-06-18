import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { Link } from "react-router-dom";

export const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } =
    useCartStore();
  const cartTotal = total();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-surface-1 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-400" />
                <h2 className="text-lg font-semibold">
                  Your Cart ({items?.length})
                </h2>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-gray-600 mb-4" />
                  <p className="text-gray-400">Your cart is empty</p>
                  <button
                    onClick={toggleCart}
                    className="btn-primary mt-4 text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="flex gap-3 glass rounded-xl p-3"
                  >
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/80x80/1a1a1a/e879f9?text=Zyra"
                      }
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.size} · {item.color}
                      </p>
                      <p className="text-brand-400 font-semibold text-sm mt-1">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-gray-300 hover:text-white hover:bg-brand-600 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-gray-300 hover:text-white hover:bg-brand-600 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items?.length > 0 && (
              <div className="p-5 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={toggleCart}
                  className="btn-primary w-full justify-center text-base"
                >
                  Checkout · ₹{cartTotal.toLocaleString()}
                </Link>
                <Link
                  to="/cart"
                  onClick={toggleCart}
                  className="btn-outline w-full justify-center text-sm"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
