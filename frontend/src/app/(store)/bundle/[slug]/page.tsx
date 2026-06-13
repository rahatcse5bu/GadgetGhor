'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, ShoppingCart, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Bundle } from '@/lib/types';
import { formatBDT } from '@/lib/format';
import { useCart } from '@/store/cart';

export default function BundleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Bundle>(`/bundles/slug/${slug}`).then((r) => setBundle(r.data)).catch(() => setBundle(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return <div className="grid place-items-center py-32 text-slate-400"><Loader2 className="animate-spin" /></div>;
  if (!bundle)
    return (
      <div className="container-x py-32 text-center">
        <p className="text-slate-500">Bundle not found.</p>
        <Link href="/bundles" className="btn-outline mt-4">Back to bundles</Link>
      </div>
    );

  const line = {
    kind: 'bundle' as const,
    id: bundle._id,
    slug: bundle.slug,
    name: bundle.name,
    image: bundle.images?.[0] || bundle.items?.[0]?.product?.images?.[0] || '',
    price: bundle.bundlePrice,
  };

  const addToCart = () => { add(line, 1); toast.success('Bundle added to cart'); };
  const buyNow = () => { add(line, 1); router.push('/checkout'); };

  return (
    <div className="container-x py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card relative aspect-[4/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bundle.images?.[0] || bundle.items?.[0]?.product?.images?.[0] || '/placeholder.svg'}
            alt={bundle.name}
            className="h-full w-full object-cover"
          />
          <span className="badge absolute left-3 top-3 bg-brand-600 text-white"><Package size={13} className="mr-1" /> Bundle</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{bundle.name}</h1>
          <p className="mt-3 leading-relaxed text-slate-600">{bundle.description}</p>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-bold text-brand-700">{formatBDT(bundle.bundlePrice)}</span>
            {bundle.regularPrice > bundle.bundlePrice && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatBDT(bundle.regularPrice)}</span>
                <span className="badge bg-accent-100 text-accent-600">Save {formatBDT(bundle.savings)}</span>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={addToCart} className="btn-outline flex-1 py-3 sm:flex-none">
              <ShoppingCart size={18} /> Add to cart
            </button>
            <button onClick={buyNow} className="btn-accent flex-1 py-3 sm:flex-none">Buy now</button>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 font-semibold text-slate-800">What&apos;s included</h3>
            <ul className="space-y-3">
              {bundle.items?.map((it, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.product?.images?.[0]} alt="" className="h-14 w-14 rounded-md object-cover" />
                  <div className="flex-1">
                    <Link href={`/product/${it.product?.slug}`} className="text-sm font-medium text-slate-800 hover:text-brand-600">
                      {it.product?.name}
                    </Link>
                    <p className="text-xs text-slate-500">Qty {it.quantity} · {formatBDT(it.product?.price || 0)} each</p>
                  </div>
                  <Check size={18} className="text-green-500" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
