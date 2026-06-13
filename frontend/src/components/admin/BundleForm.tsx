'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Search, Plus, Minus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { Product } from '@/lib/types';
import { formatBDT } from '@/lib/format';
import ImageUploader from './ImageUploader';

interface PickedItem {
  product: Product;
  quantity: number;
}

export default function BundleForm({ bundleId }: { bundleId?: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [bundlePrice, setBundlePrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [items, setItems] = useState<PickedItem[]>([]);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(!!bundleId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/products/admin/all', { params: { limit: 200 } })
      .then((r) => setAllProducts(r.data.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!bundleId) return;
    api.get(`/bundles/${bundleId}`).then((r) => {
      const b = r.data;
      setName(b.name); setDescription(b.description || '');
      setImages(b.images || []); setBundlePrice(String(b.bundlePrice ?? ''));
      setIsActive(b.isActive !== false); setFeatured(!!b.featured);
      setItems((b.items || []).filter((it: any) => it.product).map((it: any) => ({ product: it.product, quantity: it.quantity })));
    }).catch(() => toast.error('Could not load bundle')).finally(() => setLoading(false));
  }, [bundleId]);

  const regularPrice = useMemo(
    () => items.reduce((sum, it) => sum + (it.product.price || 0) * it.quantity, 0),
    [items],
  );
  const savings = Math.max(0, regularPrice - (Number(bundlePrice) || 0));

  const inBundle = (id: string) => items.some((it) => it.product._id === id);
  const addProduct = (p: Product) => {
    if (inBundle(p._id)) return;
    setItems((arr) => [...arr, { product: p, quantity: 1 }]);
  };
  const setQty = (id: string, qty: number) =>
    setItems((arr) => arr.map((it) => (it.product._id === id ? { ...it, quantity: Math.max(1, qty) } : it)));
  const removeItem = (id: string) => setItems((arr) => arr.filter((it) => it.product._id !== id));

  const results = allProducts.filter(
    (p) => !inBundle(p._id) && (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bundlePrice) { toast.error('Name and bundle price are required'); return; }
    if (items.length < 1) { toast.error('Add at least one product to the bundle'); return; }
    setSaving(true);
    const payload = {
      name, description, images,
      bundlePrice: Number(bundlePrice), isActive, featured,
      items: items.map((it) => ({ product: it.product._id, quantity: it.quantity })),
    };
    try {
      if (bundleId) { await api.patch(`/bundles/${bundleId}`, payload); toast.success('Bundle updated'); }
      else { await api.post('/bundles', payload); toast.success('Bundle created'); }
      router.push('/admin/bundles');
    } catch (err) { toast.error(apiError(err)); setSaving(false); }
  };

  if (loading) return <div className="grid place-items-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Bundle details</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Bundle name *</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ultimate Charging Kit" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Bundle image</h2>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {/* product picker */}
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Add products to bundle</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input className="input pl-9" placeholder="Search products to add…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="max-h-56 space-y-1 overflow-auto rounded-lg border border-slate-100 p-2">
            {results.slice(0, 30).map((p) => (
              <button
                key={p._id} type="button" onClick={() => addProduct(p)}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-brand-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="h-9 w-9 rounded object-cover" />
                <span className="flex-1 text-sm text-slate-700">{p.name}</span>
                <span className="text-sm text-slate-500">{formatBDT(p.price)}</span>
                <Plus size={16} className="text-brand-500" />
              </button>
            ))}
            {results.length === 0 && <p className="p-2 text-sm text-slate-400">No more products to add.</p>}
          </div>
        </div>
      </div>

      {/* sidebar: selected items + pricing */}
      <div className="space-y-6">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">In this bundle ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">No products added yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.product._id} className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.product.images?.[0] || '/placeholder.svg'} alt="" className="h-10 w-10 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-700">{it.product.name}</p>
                    <p className="text-xs text-slate-400">{formatBDT(it.product.price)}</p>
                  </div>
                  <div className="flex items-center rounded-md border border-slate-200">
                    <button type="button" onClick={() => setQty(it.product._id, it.quantity - 1)} className="grid h-7 w-7 place-items-center text-slate-500"><Minus size={12} /></button>
                    <span className="w-6 text-center text-sm">{it.quantity}</span>
                    <button type="button" onClick={() => setQty(it.product._id, it.quantity + 1)} className="grid h-7 w-7 place-items-center text-slate-500"><Plus size={12} /></button>
                  </div>
                  <button type="button" onClick={() => removeItem(it.product._id)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Pricing</h2>
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-500">Items total</span>
            <span className="font-medium">{formatBDT(regularPrice)}</span>
          </div>
          <label className="label">Bundle price (৳) *</label>
          <input type="number" className="input" value={bundlePrice} onChange={(e) => setBundlePrice(e.target.value)} />
          {savings > 0 && (
            <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Customer saves <strong>{formatBDT(savings)}</strong>
            </p>
          )}
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Featured</span>
              <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Active (visible in store)</span>
              <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            </label>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {bundleId ? 'Update' : 'Create'} bundle</>}
        </button>
      </div>
    </form>
  );
}
