import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, ChevronDown } from "lucide-react";
import type { Order } from "../../types";
import api from "../../lib/api";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  shipped: "text-brand-400 bg-brand-400/10 border-brand-400/20",
  delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/orders")
      .then((r) => setOrders(r.data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: status as Order["orderStatus"] }
            : o,
        ),
      );
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      (typeof o.user === "object" &&
        o.user.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">
            {orders?.length} total orders
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        {/* <Search size={16} className="input-icon-left text-gray-500" /> */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9 text-sm"
          placeholder="Search by order ID or customer..."
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "Order ID",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((order, i) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {typeof order.user === "object" ? order.user.name : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {order.items?.length}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    ₹{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                        disabled={updatingId === order._id}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium bg-transparent cursor-pointer appearance-none pr-6 transition-all ${statusColors[order.orderStatus] || ""}`}
                      >
                        {STATUSES.map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="bg-surface-2 text-white capitalize"
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={10}
                        className="input-icon-right pointer-events-none opacity-60"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
