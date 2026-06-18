import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../lib/api";
import toast from "react-hot-toast";

export const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password?.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setAuth(data.user, data.accessToken);
      toast.success(`Welcome to Zyra, ${data.user.name}! 🎉`);
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type: string,
    placeholder: string,
    extra?: React.ReactNode,
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {/* <Icon size={16} className="input-icon-left text-gray-500" /> */}
        <input
          type={type}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          className="input-base pl-10 pr-10"
          placeholder={placeholder}
          required
        />
        {extra}
      </div>
    </div>
  );

  const pwToggle = (
    <button
      type="button"
      onClick={() => setShowPw((s) => !s)}
      className="input-icon-right text-gray-500 hover:text-gray-300"
    >
      {showPw ? <EyeOff size={16} /> : <Eye size={16} />} <Lock size={16} />
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 hero-gradient">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="font-display text-3xl font-bold gradient-text inline-block mb-2"
            >
              ZYRA
            </Link>
            <h1 className="text-2xl font-bold text-white mt-2">
              Create account
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Join Zyra and discover premium fashion
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field(
              "name",
              "Full Name",
              "text",
              "Your name",
              <User size={16} />,
            )}

            {field(
              "email",
              "Email address",
              "email",
              "you@example.com",
              <Mail size={16} />,
            )}

            {field(
              "password",
              "Password",
              showPw ? "text" : "password",
              "••••••••",
              // <Lock size={16} />,
              pwToggle,
            )}

            {field(
              "confirm",
              "Confirm Password",
              showPw ? "text" : "password",
              "••••••••",
              <Lock size={16} />,
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-3 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  <Sparkles size={16} /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
