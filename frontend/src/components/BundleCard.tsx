'use client';
import Link from 'next/link';
import { Package, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bundle } from '@/lib/types';
import { formatBDT } from '@/lib/format';
import { useCart } from '@/store/cart';

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  const add = useCart((s) => s.add);

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(
      {
        kind: 'bundle',
        id: bundle._id,
        slug: bundle.slug,
        name: bundle.name,
        image: bundle.images?.[0] || bundle.items?.[0]?.product?.images?.[0] || '',
        price: bundle.bundlePrice,
      },
      1,
    );
    toast.success('Bundle added to cart');
  };

  return (
    <Link
      href={`/bundle/${bundle.slug}`}
      className="card group flex flex-col overflow-hidden ring-1 ring-brand-100 transition hover:shadow-cardhover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bundle.images?.[0] || bundle.items?.[0]?.product?.images?.[0] || '/placeholder.svg'}
          alt={bundle.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="badge absolute left-2 top-2 bg-brand-600 text-white">
          <Package size={12} className="mr-1" /> Bundle
        </span>
        {bundle.savings > 0 && (
          <span className="badge absolute right-2 top-2 bg-accent-500 text-white">
            Save {formatBDT(bundle.savings)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-slate-800 group-hover:text-brand-700">
          {bundle.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {bundle.items?.length} items included
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-lg font-bold text-brand-700">
              {formatBDT(bundle.bundlePrice)}
            </p>
            {bundle.regularPrice > bundle.bundlePrice && (
              <p className="text-xs text-slate-400 line-through">
                {formatBDT(bundle.regularPrice)}
              </p>
            )}
          </div>
          <button onClick={quickAdd} className="btn-primary px-3 py-2 text-sm">
            <ShoppingCart size={16} /> Add
          </button>
        </div>
      </div>
    </Link>
  );
}
