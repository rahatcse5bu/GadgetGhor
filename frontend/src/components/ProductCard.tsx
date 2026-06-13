'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '@/lib/types';
import { formatBDT, discountPercent } from '@/lib/format';
import { useCart } from '@/store/cart';
import Stars from './Stars';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const off = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    add(
      {
        kind: 'product',
        id: product._id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        maxStock: product.stock,
      },
      1,
    );
    toast.success('Added to cart');
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:shadow-cardhover"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {off > 0 && (
          <span className="badge absolute left-2 top-2 bg-accent-500 text-white">
            -{off}%
          </span>
        )}
        {outOfStock && (
          <span className="badge absolute right-2 top-2 bg-slate-800 text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
          {product.brand}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium text-slate-800 group-hover:text-brand-700">
          {product.name}
        </h3>
        <div className="mt-1.5">
          <Stars rating={product.rating} count={product.numReviews} />
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-base font-bold text-slate-900">
              {formatBDT(product.price)}
            </p>
            {off > 0 && (
              <p className="text-xs text-slate-400 line-through">
                {formatBDT(product.compareAtPrice)}
              </p>
            )}
          </div>
          <button
            onClick={quickAdd}
            disabled={outOfStock}
            className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 transition hover:bg-brand-500 hover:text-white disabled:opacity-40"
            aria-label="Add to cart"
          >
            <ShoppingCart size={17} />
          </button>
        </div>
      </div>
    </Link>
  );
}
