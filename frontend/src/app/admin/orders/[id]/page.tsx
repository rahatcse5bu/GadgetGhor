'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save, MapPin, Phone, Mail, User, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { formatBDT, ORDER_STATUS_LABELS, statusColor } from '@/lib/format';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [carrier, setCarrier] = useState('');
  const [code, setCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const load = () => {
    api.get(`/orders/admin/${id}`).then((r) => {
      const o = r.data;
      setOrder(o);
      setStatus(o.status); setCarrier(o.trackingCarrier || '');
      setCode(o.trackingCode || ''); setPaymentStatus(o.paymentStatus);
    }).catch(() => toast.error('Could not load order')).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/orders/admin/${id}/status`, {
        status, note, trackingCarrier: carrier, trackingCode: code, paymentStatus,
      });
      toast.success('Order updated — customer notified by email');
      setNote('');
      load();
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="grid place-items-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>;
  if (!order) return <p className="text-slate-500">Order not found.</p>;

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`badge ${statusColor(order.status)} text-sm`}>{ORDER_STATUS_LABELS[order.status]}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* left: items + customer */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Items</h2>
            <div className="divide-y divide-slate-100">
              {order.items.map((it: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image || '/placeholder.svg'} alt="" className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{it.name} {it.kind === 'bundle' && <Package size={12} className="ml-1 inline text-brand-500" />}</p>
                    <p className="text-xs text-slate-400">{formatBDT(it.price)} × {it.quantity}</p>
                  </div>
                  <p className="font-medium">{formatBDT(it.price * it.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatBDT(order.shippingFee)}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold"><span>Total</span><span className="text-brand-700">{formatBDT(order.total)}</span></div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Customer &amp; delivery</h2>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 text-slate-600"><User size={15} className="text-slate-400" /> {order.customer.name}</p>
              <p className="flex items-center gap-2 text-slate-600"><Phone size={15} className="text-slate-400" /> {order.customer.phone}</p>
              <p className="flex items-center gap-2 text-slate-600"><Mail size={15} className="text-slate-400" /> {order.customer.email}</p>
              <p className="flex items-start gap-2 text-slate-600 sm:col-span-2">
                <MapPin size={15} className="mt-0.5 text-slate-400" />
                {order.shippingAddress.address}, {order.shippingAddress.area} {order.shippingAddress.city} {order.shippingAddress.postcode}
              </p>
            </div>
            {order.customerNote && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <strong>Note:</strong> {order.customerNote}
              </p>
            )}
          </div>

          {/* history */}
          <div className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Status history</h2>
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
        </div>

        {/* right: update panel */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Update order</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Status</label>
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Payment status</label>
                <select className="input" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Carrier</label>
                  <input className="input" placeholder="Pathao, Sundarban…" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
                </div>
                <div>
                  <label className="label">Tracking #</label>
                  <input className="input" value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Note to customer (optional)</label>
                <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Added to the email & tracking page" />
              </div>
              <button onClick={save} disabled={saving} className="btn-primary w-full py-3">
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save &amp; notify</>}
              </button>
              <p className="text-center text-xs text-slate-400">An email update is sent to the customer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
