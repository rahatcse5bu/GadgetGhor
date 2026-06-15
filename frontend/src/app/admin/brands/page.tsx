'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Save, Tags } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { Brand } from '@/lib/types';
import ImageUploader from '@/components/admin/ImageUploader';

const emptyForm = { name: '', country: '', description: '', logo: '', featured: false };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const load = () => {
    setLoading(true);
    api.get('/brands').then((r) => setBrands(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditId(null); setForm({ ...emptyForm }); setOpen(true); };
  const openEdit = (b: Brand) => {
    setEditId(b._id);
    setForm({ name: b.name, country: b.country || '', description: b.description || '', logo: b.logo || '', featured: !!b.featured });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Brand name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/brands/${editId}`, form);
        toast.success('Brand updated');
      } else {
        await api.post('/brands', form);
        toast.success('Brand created');
      }
      setOpen(false);
      load();
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete brand "${name}"?`)) return;
    try {
      await api.delete(`/brands/${id}`);
      toast.success('Brand deleted');
      setBrands((b) => b.filter((x) => x._id !== id));
    } catch (err) { toast.error(apiError(err)); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Brands</h1>
          <p className="text-sm text-slate-500">{brands.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Add brand</button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : brands.length === 0 ? (
        <div className="card grid place-items-center py-20 text-center">
          <Tags size={40} className="text-slate-300" />
          <p className="mt-3 text-slate-500">No brands yet.</p>
          <button onClick={openCreate} className="btn-primary mt-4"><Plus size={18} /> Add brand</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <div key={b._id} className="card flex items-center gap-4 p-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-50">
                {b.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={b.logo} alt={b.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-lg font-bold text-brand-600">{b.name[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-slate-800">
                  {b.name}
                  {b.featured && <span className="badge bg-accent-100 text-accent-600">Featured</span>}
                </p>
                <p className="truncate text-xs text-slate-500">{b.country || '—'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(b)} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-brand-50 hover:text-brand-600"><Pencil size={16} /></button>
                <button onClick={() => del(b._id, b.name)} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* create / edit modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{editId ? 'Edit brand' : 'Add brand'}</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Name *</label>
                  <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Anker" />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input className="input" value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="e.g. China" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div>
                <label className="label">Logo</label>
                <ImageUploader images={form.logo ? [form.logo] : []} onChange={(urls) => set('logo', urls[urls.length - 1] || '')} />
              </div>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Featured brand</span>
                <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary px-6">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> {editId ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
