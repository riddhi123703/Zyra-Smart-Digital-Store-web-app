import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, Save } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, setAuth, accessToken } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', form);
      setAuth(data.user, accessToken!);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>
        <div className="glass rounded-3xl p-8">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-brand-500/20 flex items-center justify-center overflow-hidden">
              {form.avatar ? (
                <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-brand-400" />
              )}
            </div>
            <div>
              <p className="font-semibold text-white text-lg">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${user?.role === 'admin' ? 'bg-brand-500/20 text-brand-300' : 'bg-surface-2 text-gray-400'}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-base" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Avatar URL</label>
              <input value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} className="input-base" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input value={user?.email} disabled className="input-base opacity-50 cursor-not-allowed" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
