'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { formatBDT, ORDER_STATUS_LABELS, statusColor } from '@/lib/format';

const FILTERS = ['', 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = () => {
    setLoading(true);
    api.get('/orders/admin/all', { params: { status, search, page } })
      .then((r) => { setOrders(r.data.items); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, page]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Orders</h1>
      <p className="mb-6 text-sm text-slate-500">Manage and fulfill customer orders</p>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input className="input pl-9" placeholder="Search order #, name, phone, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f || 'all'}
                onClick={() => { setStatus(f); setPage(1); }}
                className={`badge ${status === f ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {f ? ORDER_STATUS_LABELS[f] : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o._id} className="cursor-pointer hover:bg-slate-50" onClick={() => (window.location.href = `/admin/orders/${o._id}`)}>
                    <td className="px-4 py-3"><Link href={`/admin/orders/${o._id}`} className="font-medium text-brand-600 hover:underline">{o.orderNumber}</Link></td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{o.customer?.name}</p>
                      <p className="text-xs text-slate-400">{o.customer?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{o.items?.length}</td>
                    <td className="px-4 py-3 font-medium">{formatBDT(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-slate-600">{o.paymentMethod}</span>
                      <span className={`ml-1 badge ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{o.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${statusColor(o.status)}`}>{ORDER_STATUS_LABELS[o.status]}</span></td>
                    <td className="px-4 py-3 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No orders found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 p-4">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 rounded-md text-sm ${n === page ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 hover:bg-brand-50'}`}>{n}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
