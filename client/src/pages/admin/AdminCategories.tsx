import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', image: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = () => api.get('/categories').then(r => setCategories(r.data.categories)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm({ name: '', slug: '', image: '' }); setEditId(null); setModal(true); };
  const openEdit = (c: any) => { setForm({ name: c.name, slug: c.slug, image: c.image || '' }); setEditId(c._id); setModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/categories/${editId}`, form);
      else await api.post('/categories', form);
      toast.success(editId ? 'Updated' : 'Created');
      setModal(false); fetch();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate category?')) return;
    await api.delete(`/categories/${id}`); toast.success('Deactivated'); fetch();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button onClick={openAdd} className="btn-primary gap-2"><Plus size={16} /> Add Category</button>
      </div>

      {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c._id} className="glass rounded-2xl p-5 group relative">
              {c.image && <img src={c.image} alt={c.name} className="w-full h-24 object-cover rounded-xl mb-3" />}
              <p className="font-semibold text-white">{c.name}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{c.slug}</p>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-1.5 glass rounded-lg"><Pencil size={12} className="text-gray-400" /></button>
                <button onClick={() => handleDelete(c._id)} className="p-1.5 glass rounded-lg"><Trash2 size={12} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="bg-surface-1 rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{editId ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {[['Name', 'name'], ['Slug', 'slug'], ['Image URL', 'image']].map(([label, key]) => (
                <div key={key}>
                  <label className="text-sm text-gray-400 mb-1 block">{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required={key !== 'image'} placeholder={label} className="input-base" />
                </div>
              ))}
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 justify-center">Save</button>
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
