'use client';
import { useEffect, useState } from 'react';
import { Loader2, Save, Truck, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    dhakaDeliveryFee: '', outsideDeliveryFee: '', freeShippingThreshold: '',
    bkashNumber: '', nagadNumber: '', rocketNumber: '', paymentInstructions: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/settings').then((r) => {
      const s = r.data;
      setForm({
        dhakaDeliveryFee: String(s.dhakaDeliveryFee ?? ''),
        outsideDeliveryFee: String(s.outsideDeliveryFee ?? ''),
        freeShippingThreshold: String(s.freeShippingThreshold ?? 0),
        bkashNumber: s.bkashNumber || '', nagadNumber: s.nagadNumber || '',
        rocketNumber: s.rocketNumber || '', paymentInstructions: s.paymentInstructions || '',
      });
    }).catch(() => toast.error('Could not load settings')).finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/settings', {
        dhakaDeliveryFee: Number(form.dhakaDeliveryFee) || 0,
        outsideDeliveryFee: Number(form.outsideDeliveryFee) || 0,
        freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
        bkashNumber: form.bkashNumber.trim(),
        nagadNumber: form.nagadNumber.trim(),
        rocketNumber: form.rocketNumber.trim(),
        paymentInstructions: form.paymentInstructions.trim(),
      });
      toast.success('Settings saved');
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="grid place-items-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      <p className="mb-6 text-sm text-slate-500">Delivery charges &amp; payment wallet numbers</p>

      <form onSubmit={save} className="space-y-6">
        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
            <Truck size={18} className="text-brand-500" /> Delivery charges
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Inside Dhaka (৳)</label>
              <input type="number" className="input" value={form.dhakaDeliveryFee} onChange={(e) => set('dhakaDeliveryFee', e.target.value)} />
            </div>
            <div>
              <label className="label">Outside Dhaka (৳)</label>
              <input type="number" className="input" value={form.outsideDeliveryFee} onChange={(e) => set('outsideDeliveryFee', e.target.value)} />
            </div>
            <div>
              <label className="label">Free shipping over (৳)</label>
              <input type="number" className="input" value={form.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold', e.target.value)} />
              <p className="mt-1 text-xs text-slate-400">0 = always charge delivery</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
            <Wallet size={18} className="text-brand-500" /> Payment wallet numbers
          </h2>
          <p className="mb-4 text-sm text-slate-500">Shown to customers at checkout so they know where to send money.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">bKash number</label>
              <input className="input" placeholder="01XXXXXXXXX" value={form.bkashNumber} onChange={(e) => set('bkashNumber', e.target.value)} />
            </div>
            <div>
              <label className="label">Nagad number</label>
              <input className="input" placeholder="01XXXXXXXXX" value={form.nagadNumber} onChange={(e) => set('nagadNumber', e.target.value)} />
            </div>
            <div>
              <label className="label">Rocket number</label>
              <input className="input" placeholder="01XXXXXXXXX" value={form.rocketNumber} onChange={(e) => set('rocketNumber', e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Payment instructions (optional)</label>
            <textarea className="input" rows={2} placeholder='e.g. "Use Send Money, then enter the Transaction ID below."' value={form.paymentInstructions} onChange={(e) => set('paymentInstructions', e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary px-6 py-3">
          {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save settings</>}
        </button>
      </form>
    </div>
  );
}
