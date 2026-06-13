'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  Truck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatBDT, ORDER_STATUS_LABELS, statusColor } from '@/lib/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/orders/admin/stats').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const sc = stats?.statusCounts || {};
  const pending = (sc.pending || 0) + (sc.confirmed || 0) + (sc.processing || 0);
  const inTransit = (sc.shipped || 0) + (sc.out_for_delivery || 0);

  const cards = [
    { label: 'Total revenue', value: formatBDT(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Total orders', value: stats?.totalOrders ?? '—', icon: ShoppingBag, color: 'bg-brand-50 text-brand-600' },
    { label: 'Needs action', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'In transit', value: inTransit, icon: Truck, color: 'bg-blue-50 text-blue-600' },
    { label: 'Delivered', value: sc.delivered || 0, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="text-sm text-slate-500">Store overview &amp; recent activity</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-lg ${c.color}`}>
              <c.icon size={20} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 card">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-800">Recent orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats?.recent || []).map((o: any) => (
                <tr key={o._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o._id}`} className="font-medium text-brand-600 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{o.customer?.name}</td>
                  <td className="px-5 py-3 font-medium">{formatBDT(o.total)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${statusColor(o.status)}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats?.recent || stats.recent.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
