import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import type { User } from "../../types";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    api
      .get("/admin/users")
      .then((r) => setUsers(r.data.users || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (user: User) => {
    if (user._id === currentUser?._id) {
      toast.error("You can't change your own role");
      return;
    }
    const newRole = user.role === "admin" ? "user" : "admin";
    setUpdatingId(user._id);
    try {
      await api.patch(`/admin/users/${user._id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)),
      );
      toast.success(
        `${user.name} is now ${newRole === "admin" ? "an Admin" : "a User"}`,
      );
    } catch {
      toast.error("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-gray-400 text-sm mt-1">
          {users.length} registered users
        </p>
      </div>

      <div className="relative mb-6 max-w-sm">
        {/* <Search size={16} className="input-icon-left text-gray-500" /> */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9 text-sm"
          placeholder="Search by name or email..."
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">No users found.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["User", "Email", "Role", "Actions"].map((h) => (
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
              {filtered.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-brand-400 text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-white">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.role === "admin"
                          ? "bg-brand-500/20 text-brand-300"
                          : "bg-surface-2 text-gray-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRole(user)}
                      disabled={
                        updatingId === user._id || user._id === currentUser?._id
                      }
                      title={
                        user.role === "admin" ? "Revoke admin" : "Make admin"
                      }
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        user.role === "admin"
                          ? "text-red-400 hover:bg-red-400/10"
                          : "text-green-400 hover:bg-green-400/10"
                      }`}
                    >
                      {updatingId === user._id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : user.role === "admin" ? (
                        <>
                          <ShieldOff size={13} /> Revoke Admin
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={13} /> Make Admin
                        </>
                      )}
                    </button>
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
