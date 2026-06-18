import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import type { Coupon } from "../../types";

interface CouponForm {
  code: string;
  type: "percent" | "fixed";
  value: string;
  minOrderAmount: string;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
}

const defaultForm: CouponForm = {
  code: "",
  type: "percent",
  value: "10",
  minOrderAmount: "0",
  maxUses: "1000",
  expiresAt: "",
  isActive: true,
};

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "ZYRA-";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars?.length)];
  }
  return code;
};

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(defaultForm);

  const fetchCoupons = () => {
    setLoading(true);
    api
      .get("/admin/coupons")
      .then((response) => setCoupons(response.data.coupons || []))
      .catch(() => toast.error("Failed to load coupons"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreate = () => {
    setForm({ ...defaultForm, code: generateCode() });
    setModalOpen(true);
  };

  const regenerateCode = () => {
    setForm((current) => ({ ...current, code: generateCode() }));
  };

  // handles error msg
  const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: { message?: string } } })
        .response;
      return response?.data?.message;
    }
    return undefined;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/coupons", {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : undefined,
        isActive: form.isActive,
      });
      toast.success("Coupon created");
      setModalOpen(false);
      setForm(defaultForm);
      fetchCoupons();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons((current) => current.filter((coupon) => coupon._id !== id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Coupon code copied");
    } catch {
      toast.error("Could not copy code");
    }
  };

  const stats = useMemo(() => {
    return {
      total: coupons?.length,
      active: coupons.filter((coupon) => coupon.isActive)?.length,
      expired: coupons.filter(
        (coupon) => coupon.expiresAt && new Date(coupon.expiresAt) < new Date(),
      )?.length,
    };
  }, [coupons]);

  const Field = (
    label: string,
    key: keyof CouponForm,
    type: "text" | "number" | "datetime-local" = "text",
    placeholder?: string,
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={String(form[key])}
        onChange={(event) =>
          setForm((current) => ({ ...current, [key]: event.target.value }))
        }
        className="input-base text-sm py-2"
      />
    </div>
  );

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-gray-400 text-sm mt-1">
            Create and manage discount codes
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary py-2 px-4 text-sm">
          <Plus size={16} /> Generate Coupon
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-gray-400">Total coupons</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-gray-400">Active coupons</p>
          <p className="text-2xl font-bold text-brand-300 mt-1">
            {stats.active}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-gray-400">Expired coupons</p>
          <p className="text-2xl font-bold text-red-300 mt-1">
            {stats.expired}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : coupons?.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <TicketPercent size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">No coupons yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Generate your first coupon from the admin UI.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {coupons.map((coupon) => {
            const expired = coupon.expiresAt
              ? new Date(coupon.expiresAt) < new Date()
              : false;
            return (
              <div
                key={coupon._id}
                className="glass rounded-2xl p-5 border border-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white tracking-wide">
                        {coupon.code}
                      </h3>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${coupon.isActive ? "bg-brand-500/20 text-brand-300" : "bg-white/10 text-gray-300"}`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                      {expired && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-300">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {coupon.type === "percent"
                        ? `${coupon.value}% off`
                        : `₹${coupon.value} off`}{" "}
                      · Min order ₹{coupon.minOrderAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Uses {coupon.usedCount}/{coupon.maxUses}
                      {coupon.expiresAt
                        ? ` · Expires ${new Date(coupon.expiresAt).toLocaleString()}`
                        : " · No expiry"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(coupon._id)}
                    disabled={deletingId === coupon._id}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    {deletingId === coupon._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                initial={{ opacity: 0, scale: 0.92, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 18 }}
                transition={{ type: "spring", damping: 24, stiffness: 260 }}
                className="glass rounded-2xl w-full max-w-lg overflow-hidden"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Generate Coupon
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Use the form to create a backend coupon code.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={form.code}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            code: event.target.value.toUpperCase(),
                          }))
                        }
                        className="input-base text-sm py-2 flex-1 uppercase tracking-wide"
                        placeholder="ZYRA-SUMMER"
                      />
                      <button
                        type="button"
                        onClick={regenerateCode}
                        className="btn-outline py-2 px-3 text-sm"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Discount Type
                      </label>
                      <select
                        value={form.type}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            type: event.target.value as CouponForm["type"],
                          }))
                        }
                        className="input-base text-sm py-2"
                      >
                        <option value="percent">Percent</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    </div>
                    {Field("Discount Value", "value", "number", "10")}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {Field("Minimum Order", "minOrderAmount", "number", "0")}
                    {Field("Max Uses", "maxUses", "number", "1000")}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Expires At
                    </label>
                    <input
                      type="datetime-local"
                      step={60}
                      value={form.expiresAt}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          expiresAt: event.target.value,
                        }))
                      }
                      className="input-base text-sm py-2"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                      className="accent-brand-500"
                    />
                    <span className="text-sm text-gray-300">
                      Active on creation
                    </span>
                  </label>

                  <div className="flex gap-3 pt-2">
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
                      ) : (
                        "Create Coupon"
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
