'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search, Package, CheckCircle2, Circle, MapPin } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { formatBDT, ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, statusColor } from '@/lib/format';

function TrackInner() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/orders/track/${orderNumber.trim()}`, {
        params: contact ? { contact } : {},
      });
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(apiError(err, 'Order not found'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get('order')) lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCancelled = order && ['cancelled', 'returned'].includes(order.status);
  const currentIdx = order ? ORDER_STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-2xl text-center">
        <Package size={40} className="mx-auto text-brand-500" />
        <h1 className="mt-3 text-2xl font-bold text-slate-800">Track your order</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your order number to see its live status.</p>
      </div>

      <form onSubmit={lookup} className="mx-auto mt-6 max-w-2xl card p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className="input"
            placeholder="Order number (e.g. GG-XXXXX)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          />
          <input
            className="input"
            placeholder="Email or phone (optional)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><Search size={16} /> Track</>}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>

      {order && (
        <div className="mx-auto mt-8 max-w-2xl space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-slate-500">Order</p>
                <p className="text-lg font-bold text-slate-800">{order.orderNumber}</p>
              </div>
              <span className={`badge ${statusColor(order.status)}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            {order.trackingCode && (
              <p className="mt-3 text-sm text-slate-600">
                Carrier: <strong>{order.trackingCarrier}</strong> · Tracking #: <strong>{order.trackingCode}</strong>
              </p>
            )}

            {/* progress timeline */}
            {!isCancelled ? (
              <ol className="mt-6 space-y-0">
                {ORDER_STATUS_FLOW.map((s, i) => {
                  const done = i <= currentIdx;
                  const isLast = i === ORDER_STATUS_FLOW.length - 1;
                  return (
                    <li key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {done ? (
                          <CheckCircle2 size={22} className="text-brand-500" />
                        ) : (
                          <Circle size={22} className="text-slate-300" />
                        )}
                        {!isLast && <div className={`h-8 w-0.5 ${i < currentIdx ? 'bg-brand-400' : 'bg-slate-200'}`} />}
                      </div>
                      <div className={`pb-6 ${done ? 'text-slate-800' : 'text-slate-400'}`}>
                        <p className="text-sm font-medium">{ORDER_STATUS_LABELS[s]}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                This order was {ORDER_STATUS_LABELS[order.status].toLowerCase()}.
              </div>
            )}
          </div>

          {/* history */}
          {order.statusHistory?.length > 0 && (
            <div className="card p-6">
              <h3 className="mb-3 font-semibold text-slate-800">Activity</h3>
              <ul className="space-y-3">
                {[...order.statusHistory].reverse().map((h: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-700">{ORDER_STATUS_LABELS[h.status] || h.status}</p>
                      {h.note && <p className="text-xs text-slate-500">{h.note}</p>}
                    </div>
                    <span className="text-xs text-slate-400">{new Date(h.at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* items + address */}
          <div className="card p-6">
            <h3 className="mb-3 font-semibold text-slate-800">Items</h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((it: any, i: number) => (
                <div key={i} className="py-2.5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image || '/placeholder.svg'} alt="" className="h-11 w-11 rounded-md object-cover" />
                    <p className="flex-1 text-sm text-slate-700">{it.name}{it.variant ? ` · ${it.variant}` : ''} × {it.quantity}</p>
                    <p className="text-sm font-medium">{formatBDT(it.price * it.quantity)}</p>
                  </div>
                  {it.kind === 'bundle' && it.bundleItems?.length > 0 && (
                    <ul className="ml-14 mt-1 space-y-0.5">
                      {it.bundleItems.map((b: any, bi: number) => (
                        <li key={bi} className="text-xs text-slate-400">• {b.name} × {b.quantity}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 font-semibold">
              <span>Total</span><span className="text-brand-700">{formatBDT(order.total)}</span>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-slate-500">
              <MapPin size={15} className="mt-0.5 shrink-0" />
              {order.shippingAddress.address}, {order.shippingAddress.area} {order.shippingAddress.city} {order.shippingAddress.postcode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-slate-400">Loading…</div>}>
      <TrackInner />
    </Suspense>
  );
}
