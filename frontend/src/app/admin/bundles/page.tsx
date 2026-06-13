'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { Bundle } from '@/lib/types';
import { formatBDT } from '@/lib/format';

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/bundles/admin/all').then((r) => setBundles(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete bundle "${name}"?`)) return;
    try {
      await api.delete(`/bundles/${id}`);
      toast.success('Bundle deleted');
      setBundles((b) => b.filter((x) => x._id !== id));
    } catch (err) { toast.error(apiError(err)); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bundles</h1>
          <p className="text-sm text-slate-500">Combine products into discounted kits</p>
        </div>
        <Link href="/admin/bundles/new" className="btn-primary"><Plus size={18} /> Create bundle</Link>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : bundles.length === 0 ? (
        <div className="card grid place-items-center py-20 text-center">
          <Package size={40} className="text-slate-300" />
          <p className="mt-3 text-slate-500">No bundles yet. Create your first combo deal.</p>
          <Link href="/admin/bundles/new" className="btn-primary mt-4"><Plus size={18} /> Create bundle</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b) => (
            <div key={b._id} className="card overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.images?.[0] || b.items?.[0]?.product?.images?.[0] || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{b.name}</p>
                    <p className="text-xs text-slate-500">{b.items?.length} items</p>
                  </div>
                  <span className={`badge ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {b.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold text-brand-700">{formatBDT(b.bundlePrice)}</span>
                  {b.regularPrice > b.bundlePrice && (
                    <span className="text-xs text-slate-400 line-through">{formatBDT(b.regularPrice)}</span>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/bundles/${b._id}`} className="btn-outline flex-1 py-2 text-sm"><Pencil size={15} /> Edit</Link>
                  <button onClick={() => del(b._id, b.name)} className="grid w-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
