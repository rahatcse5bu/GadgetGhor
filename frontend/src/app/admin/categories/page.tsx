'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Save, FolderTree, CornerDownRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { Category } from '@/lib/types';
import ImageUploader from '@/components/admin/ImageUploader';

interface ParentNode extends Category {
  children: Category[];
}

const emptyForm = { name: '', parent: '', description: '', image: '' };

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<ParentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSlug, setEditSlug] = useState<string>('');
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const load = () => {
    setLoading(true);
    api.get('/categories/tree').then((r) => setTree(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = (parentSlug = '') => {
    setEditId(null); setEditSlug('');
    setForm({ ...emptyForm, parent: parentSlug });
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditId(c._id); setEditSlug(c.slug);
    setForm({ name: c.name, parent: c.parent || '', description: c.description || '', image: c.image || '' });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      parent: form.parent || null,
      description: form.description.trim(),
      image: form.image.trim(),
    };
    try {
      if (editId) { await api.patch(`/categories/${editId}`, payload); toast.success('Category updated'); }
      else { await api.post('/categories', payload); toast.success('Category created'); }
      setOpen(false);
      load();
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  };

  const del = async (c: Category, childCount = 0) => {
    if (childCount > 0) {
      if (!confirm(`"${c.name}" has ${childCount} sub-categor${childCount === 1 ? 'y' : 'ies'}. Delete it anyway? (sub-categories are kept but become orphaned)`)) return;
    } else if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      toast.success('Category deleted');
      load();
    } catch (err) { toast.error(apiError(err)); }
  };

  // parent options = top-level categories, excluding the one being edited
  const parentOptions = tree.filter((p) => p.slug !== editSlug);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-sm text-slate-500">{tree.length} top-level · {tree.reduce((n, p) => n + p.children.length, 0)} sub-categories</p>
        </div>
        <button onClick={() => openCreate()} className="btn-primary"><Plus size={18} /> Add category</button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : tree.length === 0 ? (
        <div className="card grid place-items-center py-20 text-center">
          <FolderTree size={40} className="text-slate-300" />
          <p className="mt-3 text-slate-500">No categories yet.</p>
          <button onClick={() => openCreate()} className="btn-primary mt-4"><Plus size={18} /> Add category</button>
        </div>
      ) : (
        <div className="space-y-3">
          {tree.map((p) => (
            <div key={p._id} className="card overflow-hidden">
              {/* parent row */}
              <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image || '/placeholder.svg'} alt="" className="h-11 w-11 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{p.name}</p>
                  <p className="truncate text-xs text-slate-400">/{p.slug}</p>
                </div>
                <button onClick={() => openCreate(p.slug)} className="btn-ghost text-xs"><Plus size={14} /> Sub-category</button>
                <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-brand-50 hover:text-brand-600"><Pencil size={16} /></button>
                <button onClick={() => del(p, p.children.length)} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>

              {/* children */}
              {p.children.length > 0 ? (
                <ul className="divide-y divide-slate-50">
                  {p.children.map((c) => (
                    <li key={c._id} className="flex items-center gap-3 py-2.5 pl-6 pr-4">
                      <CornerDownRight size={15} className="text-slate-300" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.image || '/placeholder.svg'} alt="" className="h-8 w-8 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-700">{c.name}</p>
                        <p className="truncate text-xs text-slate-400">/{c.slug}</p>
                      </div>
                      <button onClick={() => openEdit(c)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-brand-50 hover:text-brand-600"><Pencil size={15} /></button>
                      <button onClick={() => del(c)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 py-2.5 text-xs text-slate-400">No sub-categories.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* create / edit modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editId ? 'Edit category' : form.parent ? 'Add sub-category' : 'Add category'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Earbuds" />
              </div>
              <div>
                <label className="label">Parent category</label>
                <select className="input" value={form.parent} onChange={(e) => set('parent', e.target.value)}>
                  <option value="">— Top-level category —</option>
                  {parentOptions.map((p) => <option key={p._id} value={p.slug}>{p.name}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-400">Choose a parent to make this a sub-category.</p>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div>
                <label className="label">Image</label>
                <ImageUploader images={form.image ? [form.image] : []} onChange={(urls) => set('image', urls[urls.length - 1] || '')} />
              </div>
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
