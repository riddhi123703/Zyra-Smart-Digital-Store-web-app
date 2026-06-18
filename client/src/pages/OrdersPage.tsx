import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ChevronDown,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  Truck,
  Home,
  XCircle,
} from 'lucide-react';
import type { Order } from '../types';
import api from '../lib/api';

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-brand-400 bg-brand-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const timelineSteps = [
    { key: 'pending', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Order Shipped', icon: Package },
    { key: 'shipped', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Order Delivered', icon: Home },
  ];

  useEffect(() => {
    api.get('/orders/mine').then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Order History</h1>
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={56} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 mb-6">No orders yet.</p>
            <Link to="/products" className="btn-primary px-8 py-3">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isOpen = !!expanded[order._id];
              return (
                <div key={order._id} className="glass rounded-2xl p-5">
                  <button
                    type="button"
                    onClick={() => setExpanded(prev => ({ ...prev, [order._id]: !prev[order._id] }))}
                    className="w-full flex items-center gap-4 text-left"
                  >
                    <div className="p-3 bg-brand-500/10 rounded-xl">
                      <Package size={22} className="text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-white font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.orderStatus] || ''}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₹{order.totalPrice.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="mt-5 border-t border-white/10 pt-5 space-y-5">
                      <div className="glass rounded-xl p-4">
                        <p className="text-sm font-medium text-white mb-4">Order Timeline</p>
                        {order.orderStatus === 'cancelled' ? (
                          <div className="flex items-center gap-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            <XCircle size={16} />
                            This order was cancelled.
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            {timelineSteps.map((step, index) => {
                              const activeIndex = timelineSteps.findIndex((s) => s.key === order.orderStatus);
                              const isActive = activeIndex >= index;
                              const isLast = index === timelineSteps.length - 1;
                              const Icon = step.icon;
                              return (
                                <div key={step.key} className="flex-1 flex items-center">
                                  <div className="flex flex-col items-center text-center min-w-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-brand-500/20 text-brand-300' : 'bg-white/10 text-gray-500'}`}>
                                      <Icon size={18} />
                                    </div>
                                    <span className={`mt-2 text-[11px] font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                      {step.label}
                                    </span>
                                  </div>
                                  {!isLast && (
                                    <div className={`flex-1 h-1 mx-3 rounded-full ${isActive ? 'bg-brand-400/70' : 'bg-white/10'}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-3">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-14 rounded-lg object-cover bg-surface-2 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {item.size} · {item.color} · ×{item.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-brand-400">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="glass rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={14} className="text-brand-400" />
                            <p className="text-sm font-medium text-white">Shipping</p>
                          </div>
                          <p className="text-sm text-gray-300">{order.shippingAddress.fullName}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                          </p>
                          <p className="text-xs text-gray-400">{order.shippingAddress.phone}</p>
                        </div>
                        <div className="glass rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={14} className="text-brand-400" />
                            <p className="text-sm font-medium text-white">Payment</p>
                          </div>
                          <p className="text-sm text-gray-300">
                            {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'Cash on Delivery'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.isPaid ? `Paid on ${new Date(order.paidAt || order.createdAt).toLocaleDateString()}` : 'Payment pending'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
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
                        {order.couponCode && (
                          <div className="flex justify-between text-gray-400">
                            <span>Coupon</span><span className="text-white">{order.couponCode}</span>
                          </div>
                        )}
                        <div className="border-t border-white/10 pt-3 flex justify-between text-white font-semibold">
                          <span>Total</span><span>₹{order.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Link to={`/order/confirm/${order._id}`} className="text-sm text-brand-400 hover:text-brand-300">
                          View confirmation
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
