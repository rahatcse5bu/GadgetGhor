'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { Category } from '@/lib/types';
import ImageUploader from './ImageUploader';

interface Props {
  productId?: string; // edit mode if present
}

const empty = {
  name: '', description: '', brand: '', category: '',
  price: '', compareAtPrice: '', cost: '', stock: '', sku: '',
  images: [] as string[],
  specs: [] as { key: string; value: string }[],
  tags: '' as string,
  featured: false, isActive: true,
};

export default function ProductForm({ productId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ ...empty });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!productId) return;
    api.get(`/products/${productId}`).then((r) => {
      const p = r.data;
      setForm({
        name: p.name || '', description: p.description || '', brand: p.brand || '',
        category: p.category || '', price: String(p.price ?? ''),
        compareAtPrice: String(p.compareAtPrice ?? ''), cost: String(p.cost ?? ''),
        stock: String(p.stock ?? ''), sku: p.sku || '',
        images: p.images || [], specs: p.specs || [],
        tags: (p.tags || []).join(', '), featured: !!p.featured, isActive: p.isActive !== false,
      });
    }).catch(() => toast.error('Could not load product')).finally(() => setLoading(false));
  }, [productId]);

  const addSpec = () => set('specs', [...form.specs, { key: '', value: '' }]);
  const updateSpec = (i: number, key: string, value: string) =>
    set('specs', form.specs.map((s, idx) => (idx === i ? { key, value } : s)));
  const removeSpec = (i: number) => set('specs', form.specs.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      brand: form.brand,
      category: form.category || 'accessories',
      price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice) || 0,
      cost: Number(form.cost) || 0,
      stock: Number(form.stock) || 0,
      sku: form.sku,
      images: form.images,
      specs: form.specs.filter((s) => s.key),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
      isActive: form.isActive,
    };
    try {
      if (productId) {
        await api.patch(`/products/${productId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (err) {
      toast.error(apiError(err));
      setSaving(false);
    }
  };

  if (loading) return <div className="grid place-items-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Basic info</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Product name *</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Brand</label>
                <input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Images</h2>
          <ImageUploader images={form.images} onChange={(urls) => set('images', urls)} />
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Specifications</h2>
            <button type="button" onClick={addSpec} className="btn-ghost text-sm"><Plus size={15} /> Add spec</button>
          </div>
          <div className="space-y-2">
            {form.specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className="input" placeholder="Label (e.g. Battery)" value={s.key} onChange={(e) => updateSpec(i, e.target.value, s.value)} />
                <input className="input" placeholder="Value (e.g. 30h)" value={s.value} onChange={(e) => updateSpec(i, s.key, e.target.value)} />
                <button type="button" onClick={() => removeSpec(i)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
            {form.specs.length === 0 && <p className="text-sm text-slate-400">No specs added.</p>}
          </div>
        </div>
      </div>

      {/* sidebar */}
      <div className="space-y-6">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Pricing &amp; stock</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Selling price (৳) *</label>
              <input type="number" className="input" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div>
              <label className="label">Compare-at price (৳)</label>
              <input type="number" className="input" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} />
              <p className="mt-1 text-xs text-slate-400">Shown struck-through to highlight a discount.</p>
            </div>
            <div>
              <label className="label">Import cost (৳) <span className="text-slate-400">— private</span></label>
              <input type="number" className="input" value={form.cost} onChange={(e) => set('cost', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Stock</label>
                <input type="number" className="input" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
              </div>
              <div>
                <label className="label">SKU</label>
                <input className="input" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Organization</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Tags</label>
              <input className="input" placeholder="comma, separated, tags" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
            </div>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Featured product</span>
              <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Active (visible in store)</span>
              <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
            </label>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {productId ? 'Update' : 'Create'} product</>}
        </button>
      </div>
    </form>
  );
}
