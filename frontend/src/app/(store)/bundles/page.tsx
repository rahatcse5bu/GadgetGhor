'use client';
import { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { Bundle } from '@/lib/types';
import BundleCard from '@/components/BundleCard';

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bundles').then((r) => setBundles(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-x py-8">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-8 text-white">
        <span className="badge bg-white/15 text-white"><Package size={13} className="mr-1" /> Bundle deals</span>
        <h1 className="mt-3 text-3xl font-bold">Buy together &amp; save more</h1>
        <p className="mt-1 max-w-lg text-brand-50/90">
          Hand-picked combos at a lower combined price than buying separately.
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-24 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : bundles.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b) => (
            <BundleCard key={b._id} bundle={b} />
          ))}
        </div>
      ) : (
        <p className="py-24 text-center text-slate-500">No bundles available right now.</p>
      )}
    </div>
  );
}
