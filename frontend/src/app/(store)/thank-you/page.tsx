'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Mail, ArrowRight, Copy, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatBDT } from '@/lib/format';

function ThankYouInner() {
  const params = useSearchParams();
  const orderNumber = params.get('order') || '';
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderNumber) {
      api.get(`/orders/track/${orderNumber}`).then((r) => setOrder(r.data)).catch(() => {});
    }
  }, [orderNumber]);

  const copy = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('Order number copied');
  };

  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Thank you for your order! 🎉</h1>
        <p className="mt-2 text-slate-500">
          We&apos;ve received your order and sent a confirmation to your email.
        </p>

        {orderNumber && (
          <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-5 py-3">
            <span className="text-sm text-slate-500">Order number</span>
            <span className="text-lg font-bold tracking-wide text-brand-700">{orderNumber}</span>
            <button onClick={copy} className="text-brand-500 hover:text-brand-700" aria-label="Copy"><Copy size={16} /></button>
          </div>
        )}
      </div>

      {order && (
        <div className="card mx-auto mt-8 max-w-2xl p-6 text-left">
          <h2 className="mb-4 font-semibold text-slate-800">Order summary</h2>
          <div className="divide-y divide-slate-100">
            {order.items.map((it: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image || '/placeholder.svg'} alt="" className="h-12 w-12 rounded-md object-cover" />
                <div className="flex-1 text-sm">
                  <p className="text-slate-700">{it.name} {it.kind === 'bundle' && <Package size={11} className="inline text-brand-500" />}</p>
                  <p className="text-xs text-slate-400">{it.variant ? `${it.variant} · ` : ''}Qty {it.quantity}</p>
                  {it.kind === 'bundle' && it.bundleItems?.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {it.bundleItems.map((b: any, bi: number) => (
                        <li key={bi} className="text-xs text-slate-400">• {b.name} × {b.quantity}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-sm font-medium">{formatBDT(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatBDT(order.shippingFee)}</span></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900"><span>Total</span><span>{formatBDT(order.total)}</span></div>
            {!!order.amountPaid && (
              <div className="flex justify-between text-green-700"><span>Paid in advance</span><span>{formatBDT(order.amountPaid)}</span></div>
            )}
            {!!order.dueAmount && (
              <div className="flex justify-between font-semibold text-amber-700"><span>Due on delivery</span><span>{formatBDT(order.dueAmount)}</span></div>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Payment: <strong className="text-slate-700 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</strong> ·
            Delivering to <strong className="text-slate-700">{order.shippingAddress.city}</strong>
          </p>
        </div>
      )}

      {/* next steps */}
      <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, t: 'Confirmation sent', s: 'Check your email inbox' },
          { icon: Package, t: 'We pack it', s: 'Processing within 24h' },
          { icon: Truck, t: 'On its way', s: 'Delivered in 1–3 days' },
        ].map((s) => (
          <div key={s.t} className="card p-4 text-center">
            <s.icon className="mx-auto text-brand-500" size={24} />
            <p className="mt-2 text-sm font-semibold text-slate-800">{s.t}</p>
            <p className="text-xs text-slate-500">{s.s}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-2xl flex-col justify-center gap-3 sm:flex-row">
        <Link href={`/track?order=${orderNumber}`} className="btn-primary">
          Track my order <ArrowRight size={18} />
        </Link>
        <Link href="/shop" className="btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-slate-400">Loading…</div>}>
      <ThankYouInner />
    </Suspense>
  );
}
