'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatBDT } from '@/lib/format';

export default function CartPage() {
  const { lines, setQty, remove, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="container-x py-24" />;

  const sub = subtotal();
  const freeShip = sub >= 5000;

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
              <div key={`${l.kind}-${l.id}`} className="flex gap-4 p-4">
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
                    <button onClick={() => remove(l.kind, l.id)} className="text-slate-400 hover:text-red-500" aria-label="Remove">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">{formatBDT(l.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-slate-300">
                      <button onClick={() => setQty(l.kind, l.id, l.quantity - 1)} className="grid h-9 w-9 place-items-center text-slate-600 hover:bg-slate-50">
                        <Minus size={14} />
                      </button>
                      <span className="w-9 text-center text-sm font-medium">{l.quantity}</span>
                      <button onClick={() => setQty(l.kind, l.id, l.quantity + 1)} className="grid h-9 w-9 place-items-center text-slate-600 hover:bg-slate-50">
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
            {!freeShip && (
              <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                Add {formatBDT(5000 - sub)} more for <strong>free delivery</strong>.
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
