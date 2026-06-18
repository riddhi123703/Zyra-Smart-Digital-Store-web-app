import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Users, Package,
  DollarSign, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import api from '../../lib/api';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueChange?: number;
  ordersChange?: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const safeStats = (s: Stats | null): Required<Stats> => ({
    totalRevenue: s?.totalRevenue ?? 0,
    totalOrders: s?.totalOrders ?? 0,
    totalUsers: s?.totalUsers ?? 0,
    totalProducts: s?.totalProducts ?? 0,
    revenueChange: s?.revenueChange,
    ordersChange: s?.ordersChange,
  } as Required<Stats>);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  const s = safeStats(stats);
  const cards = [
    {
      label: 'Total Revenue',
      value: `₹${s.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      change: s.revenueChange,
    },
    {
      label: 'Total Orders',
      value: s.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: 'text-brand-400',
      bg: 'bg-brand-400/10',
      change: s.ordersChange,
    },
    {
      label: 'Total Users',
      value: s.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Total Products',
      value: s.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
  ];

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back — here's what's happening.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ label, value, icon: Icon, color, bg, change }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
                {change != null && (
                  <span className={`text-xs flex items-center gap-0.5 font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(change)}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Manage Products', desc: 'Add, edit, or remove products', to: '/admin/products', icon: Package, color: 'text-yellow-400' },
          { label: 'View Orders', desc: 'Process and track orders', to: '/admin/orders', icon: ShoppingBag, color: 'text-brand-400' },
          { label: 'Manage Users', desc: 'View users and roles', to: '/admin/users', icon: Users, color: 'text-blue-400' },
        ].map(({ label, desc, to, icon: Icon, color }) => (
          <a
            key={to}
            href={to}
            className="glass rounded-2xl p-5 flex items-start gap-4 card-hover group"
          >
            <div className="p-2.5 bg-surface-2 rounded-xl flex-shrink-0">
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-brand-300 transition-colors">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <TrendingUp size={14} className="ml-auto text-gray-600 group-hover:text-brand-400 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
};
