import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, Shield, RefreshCw } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types";
import api from "../lib/api";

const categories = [
  {
    label: "Men",
    href: "/products?category=men",
    emoji: "👔",
    desc: "Sharp. Modern. Effortless.",
  },
  {
    label: "Women",
    href: "/products?category=women",
    emoji: "👗",
    desc: "Bold. Elegant. Timeless.",
  },
  {
    label: "Kids",
    href: "/products?category=kids",
    emoji: "🧒",
    desc: "Fun. Comfy. Colourful.",
  },
  {
    label: "Accessories",
    href: "/products?category=accessories",
    emoji: "👜",
    desc: "The perfect finish.",
  },
];

const perks = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
  { icon: Shield, title: "Secure Payments", desc: "SSL + Stripe protected" },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    desc: "30-day hassle-free returns",
  },
  { icon: Sparkles, title: "Premium Quality", desc: "Crafted to last" },
];

export const HomePage = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products?featured=true&limit=8")
      .then((r) => setFeatured(r.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-16">
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 glass text-brand-500 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} /> New Collection — Spring 2026
            </span>

            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6">
              Dress Like
              <br />
              <span className="gradient-text">Tomorrow.</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover premium fashion crafted for every moment — from dawn to
              dusk, weekend to runway.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary text-lg px-8 py-4">
                Shop Now <ArrowRight size={20} />
              </Link>
              <Link
                to="/products?featured=true"
                className="btn-outline text-lg px-8 py-4"
              >
                New Arrivals
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex justify-center gap-12 mt-16"
          >
            {[
              ["10K+", "Happy Customers"],
              ["500+", "Products"],
              ["4.9★", "Average Rating"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold gradient-text">{val}</div>
                <div className="text-xs text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-surface-1 py-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="p-2.5 glass rounded-xl flex-shrink-0">
                <Icon size={20} className="text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white mb-2">Shop by Category</h2>
        <p className="text-gray-400 mb-10">Find your style, your way.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={cat.href}
                className="block glass rounded-2xl p-8 text-center card-hover group"
              >
                <span className="text-5xl mb-4 block">{cat.emoji}</span>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{cat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Featured Picks
            </h2>
            <p className="text-gray-400">
              Curated by our style editors, just for you.
            </p>
          </div>
          <Link
            to="/products?featured=true"
            className="btn-outline text-sm py-2 px-4"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[3/4] rounded-2xl" />
                <div className="skeleton h-4 mt-3 rounded w-3/4" />
                <div className="skeleton h-4 mt-2 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featured?.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No featured products yet — check back soon!</p>
            <Link to="/products" className="btn-primary mt-4 inline-flex">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="mx-4 mb-20">
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 to-indigo-900 p-12 text-center">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 50%, #e879f9 0%, transparent 50%), radial-gradient(circle at 70% 50%, #818cf8 0%, transparent 50%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Up to 50% Off
            </h2>
            <p className="text-lg text-brand-200 mb-8">
              Limited time sale — shop before it's gone.
            </p>
            <Link
              to="/products?sort=price-asc"
              className="btn-primary text-lg px-10 py-4"
            >
              Shop Sale <Sparkles size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
