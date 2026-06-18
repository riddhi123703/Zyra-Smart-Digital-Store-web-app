import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, MapPin, Clock, ArrowRight } from 'lucide-react';
import type { Order } from '../types';
import api from '../lib/api';

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  processing: 'text-blue-400',
  shipped: 'text-brand-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400',
};

export const OrderConfirmPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-gray-400">
        Order not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Success header */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-gray-400">
            Thank you for shopping with Zyra. Your order has been received.
          </p>
          <p className="text-sm font-mono text-brand-400 mt-2">
            Order #{order._id.slice(-10).toUpperCase()}
          </p>
        </motion.div>

        {/* Order details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl divide-y divide-white/5"
        >
          {/* Status */}
          <div className="p-5 flex items-center gap-3">
            <Package size={20} className="text-brand-400" />
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className={`font-semibold capitalize ${statusColors[order.orderStatus] || 'text-white'}`}>
                {order.orderStatus}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-400">Ordered on</p>
              <div className="flex items-center gap-1 text-gray-300 text-sm">
                <Clock size={12} />
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-5">
            <p className="text-sm font-medium text-gray-300 mb-4">
              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-16 rounded-xl object-cover bg-surface-2 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.size} · {item.color} · ×{item.quantity}</p>
                    <p className="text-sm font-semibold text-brand-400 mt-1">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-brand-400" />
              <p className="text-sm font-medium text-white">Shipping Address</p>
            </div>
            <p className="text-sm text-gray-300">{order.shippingAddress.fullName}</p>
            <p className="text-xs text-gray-400 mt-1">
              {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-xs text-gray-400">{order.shippingAddress.phone}</p>
          </div>

          {/* Totals */}
          <div className="p-5 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Items</span><span className="text-white">₹{order.itemsPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span className={order.shippingPrice === 0 ? 'text-green-400' : 'text-white'}>
                {order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax</span><span className="text-white">₹{order.taxPrice}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span><span>−₹{order.discountAmount}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-base">
              <span>Total Paid</span><span>₹{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Link to="/account/orders" className="btn-outline flex-1 justify-center py-3">
            View All Orders
          </Link>
          <Link to="/products" className="btn-primary flex-1 justify-center py-3">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
