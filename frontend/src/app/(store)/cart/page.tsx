'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatBDT } from '@/lib/format';
import { api } from '@/lib/api';

export default function CartPage() {
  const { lines, setQty, remove, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);
  const [threshold, setThreshold] = useState(0);
  // Fallback bundle contents for cart lines added before contents were stored.
  const [bundleContents, setBundleContents] = useState<Record<string, { name: string; image: string; price: number; quantity: number }[]>>({});
  useEffect(() => {
    setMounted(true);
    api.get('/settings').then((r) => setThreshold(r.data.freeShippingThreshold || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    lines
      .filter((l) => l.kind === 'bundle' && !(l.bundleItems && l.bundleItems.length) && !bundleContents[l.id])
      .forEach((l) => {
        api.get(`/bundles/slug/${l.slug}`).then((r) => {
          const items = (r.data.items || []).map((it: any) => ({
            name: it.product?.name || '', image: it.product?.images?.[0] || '',
            price: it.product?.price || 0, quantity: it.quantity || 1,
          }));
          setBundleContents((m) => ({ ...m, [l.id]: items }));
        }).catch(() => {});
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return <div className="container-x py-24" />;

  const sub = subtotal();
  const freeShip = threshold > 0 && sub >= threshold;

  if (lines.length === 0) {
    return (
      <div className="container-x grid place-items-center py-24 text-center">
        <ShoppingBag size={56} className="text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-800">Your cart is empty</h1>
        <p className="mt-1 text-slate-500">Browse our gadgets and find something you love.</p>
        <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Your cart ({lines.length})</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card divide-y divide-slate-100">
            {lines.map((l) => (
              <div key={`${l.kind}-${l.id}-${l.variant || ''}`} className="flex gap-4 p-4">
                <Link href={l.kind === 'bundle' ? `/bundle/${l.slug}` : `/product/${l.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image || '/placeholder.svg'} alt={l.name} className="h-20 w-20 rounded-lg object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <Link
                      href={l.kind === 'bundle' ? `/bundle/${l.slug}` : `/product/${l.slug}`}
                      className="text-sm font-medium text-slate-800 hover:text-brand-600"
                    >
                      {l.name}
                      {l.kind === 'bundle' && (
                        <span className="badge ml-2 bg-brand-50 text-brand-600"><Package size={11} className="mr-0.5" /> Bundle</span>
                      )}
                    </Link>
                    <button onClick={() => remove(l.kind, l.id, l.variant)} className="text-slate-400 hover:text-red-500" aria-label="Remove">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {l.variant && <p className="text-xs text-slate-400">Option: {l.variant}</p>}
                  <p className="text-sm text-slate-500">{formatBDT(l.price)}</p>

                  {l.kind === 'bundle' && (() => {
                    const items = l.bundleItems?.length ? l.bundleItems : bundleContents[l.id] || [];
                    if (!items.length) return null;
                    return (
                      <div className="mt-2 rounded-lg bg-slate-50 p-2.5">
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          Includes {items.reduce((n, b) => n + b.quantity, 0)} items:
                        </p>
                        <ul className="space-y-1">
                          {items.map((b, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={b.image || '/placeholder.svg'} alt="" className="h-6 w-6 rounded object-cover" />
                              <span className="flex-1 truncate">{b.name} × {b.quantity}</span>
                              <span className="text-slate-400">{formatBDT(b.price)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-slate-300">
                      <button onClick={() => setQty(l.kind, l.id, l.quantity - 1, l.variant)} className="grid h-9 w-9 place-items-center text-slate-600 hover:bg-slate-50">
                        <Minus size={14} />
                      </button>
                      <span className="w-9 text-center text-sm font-medium">{l.quantity}</span>
                      <button onClick={() => setQty(l.kind, l.id, l.quantity + 1, l.variant)} className="grid h-9 w-9 place-items-center text-slate-600 hover:bg-slate-50">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">{formatBDT(l.price * l.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
            ← Continue shopping
          </Link>
        </div>

        {/* summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Order summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{formatBDT(sub)}</span></div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="font-medium">{freeShip ? 'Free' : 'Calculated at checkout'}</span>
              </div>
            </div>
            {threshold > 0 && !freeShip && (
              <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                Add {formatBDT(threshold - sub)} more for <strong>free delivery</strong>.
              </p>
            )}
            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="text-lg font-bold text-slate-900">{formatBDT(sub)}</span>
            </div>
            <Link href="/checkout" className="btn-accent mt-5 w-full py-3">
              Checkout <ArrowRight size={18} />
            </Link>
            <p className="mt-3 text-center text-xs text-slate-400">Cash on delivery available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
