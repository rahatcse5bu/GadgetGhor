'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, ShieldCheck, Truck, Package, Wallet, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/store/cart';
import { api, apiError } from '@/lib/api';
import { formatBDT } from '@/lib/format';
import { Settings } from '@/lib/types';

const METHODS = [
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay the delivery charge now, the rest on delivery' },
  { id: 'bkash', label: 'bKash', desc: 'Pay the full amount now' },
  { id: 'nagad', label: 'Nagad', desc: 'Pay the full amount now' },
];
const COD_CHANNELS = ['bkash', 'nagad', 'rocket'] as const;

// 64 districts of Bangladesh (Dhaka gets the inside-Dhaka delivery rate).
const DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria',
  'Chandpur', 'Chapainawabganj', 'Chattogram', 'Chuadanga', "Cox's Bazar", 'Cumilla',
  'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj',
  'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah', 'Joypurhat',
  'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur',
  'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar',
  'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi',
  'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh',
  'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur',
  'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet',
  'Tangail', 'Thakurgaon',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', area: '', city: '', postcode: '',
    paymentMethod: 'cod', customerNote: '',
    // payment proof
    codChannel: 'bkash', paymentNumber: '', transactionId: '',
  });

  useEffect(() => {
    setMounted(true);
    api.get('/settings').then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const sub = subtotal();
  const dhakaFee = settings?.dhakaDeliveryFee ?? 60;
  const outsideFee = settings?.outsideDeliveryFee ?? 120;
  const threshold = settings?.freeShippingThreshold ?? 0;
  const shipping =
    threshold > 0 && sub >= threshold
      ? 0
      : !form.city
        ? 0
        : /dhaka/i.test(form.city)
          ? dhakaFee
          : outsideFee;
  const total = sub + shipping;

  const isOnline = form.paymentMethod === 'bkash' || form.paymentMethod === 'nagad';
  // Wallet the money is sent to (merchant). Online = the method; COD = chosen channel.
  const activeChannel = isOnline ? form.paymentMethod : form.codChannel;
  const merchantNumber =
    activeChannel === 'bkash' ? settings?.bkashNumber
    : activeChannel === 'nagad' ? settings?.nagadNumber
    : activeChannel === 'rocket' ? settings?.rocketNumber
    : '';

  // How much to pay now vs. on delivery.
  const codAdvance = shipping; // delivery charge paid up front for COD
  const payNow = isOnline ? total : codAdvance;
  const dueOnDelivery = isOnline ? 0 : sub;
  const needsProof = isOnline || (form.paymentMethod === 'cod' && codAdvance > 0);

  if (mounted && lines.length === 0) {
    return (
      <div className="container-x grid place-items-center py-24 text-center">
        <h1 className="text-xl font-bold text-slate-800">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-5">Shop products</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.address || !form.city) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (needsProof && (!form.paymentNumber.trim() || !form.transactionId.trim())) {
      toast.error('Please enter the wallet number you paid from and the Transaction ID');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: {
          address: form.address, area: form.area,
          city: form.city, postcode: form.postcode,
        },
        items: lines.map((l) => ({ kind: l.kind, id: l.id, quantity: l.quantity, variant: l.variant })),
        paymentMethod: form.paymentMethod,
        paymentChannel: isOnline ? form.paymentMethod : form.codChannel,
        paymentNumber: needsProof ? form.paymentNumber : '',
        transactionId: needsProof ? form.transactionId : '',
        customerNote: form.customerNote,
      });
      clear();
      router.push(`/thank-you?order=${data.orderNumber}`);
    } catch (err) {
      toast.error(apiError(err, 'Could not place order'));
      setSubmitting(false);
    }
  };

  const channelLabel = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Checkout</h1>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        {/* form */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Contact details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name *</label>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01XXXXXXXXX" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email *</label>
                <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
                <p className="mt-1 text-xs text-slate-400">We&apos;ll email your order confirmation &amp; tracking link here.</p>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Street address *</label>
                <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="House, road, block" />
              </div>
              <div>
                <label className="label">Area / Thana</label>
                <input className="input" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. Dhanmondi" />
              </div>
              <div>
                <label className="label">City / District *</label>
                <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)}>
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-400">Dhaka district gets the inside-Dhaka delivery rate.</p>
              </div>
              <div>
                <label className="label">Postcode</label>
                <input className="input" value={form.postcode} onChange={(e) => set('postcode', e.target.value)} placeholder="e.g. 1209" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Order note (optional)</label>
                <textarea className="input" rows={2} value={form.customerNote} onChange={(e) => set('customerNote', e.target.value)} placeholder="Landmark, delivery instructions…" />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Payment method</h2>
            <div className="space-y-3">
              {METHODS.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition ${
                    form.paymentMethod === p.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio" name="payment" value={p.id}
                    checked={form.paymentMethod === p.id}
                    onChange={(e) => set('paymentMethod', e.target.value)}
                    className="accent-brand-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* COD advance: choose which wallet to pay the delivery charge from */}
            {form.paymentMethod === 'cod' && codAdvance > 0 && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3.5">
                <p className="flex items-center gap-1.5 text-sm font-medium text-amber-800">
                  <Info size={15} /> Pay the delivery charge ({formatBDT(codAdvance)}) in advance to confirm your order.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {COD_CHANNELS.map((c) => (
                    <button
                      key={c} type="button" onClick={() => set('codChannel', c)}
                      className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
                        form.codChannel === c ? 'border-brand-500 bg-white font-medium text-brand-700' : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* payment proof (online full, or COD advance) */}
            {needsProof && (
              <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
                  <Wallet size={16} />
                  Send {formatBDT(payNow)} via {channelLabel(activeChannel)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  to <strong className="text-slate-900">{merchantNumber || '— number not set —'}</strong>
                  {settings?.paymentInstructions ? ` · ${settings.paymentInstructions}` : ''}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Your {channelLabel(activeChannel)} number *</label>
                    <input className="input" value={form.paymentNumber} onChange={(e) => set('paymentNumber', e.target.value)} placeholder="01XXXXXXXXX" />
                  </div>
                  <div>
                    <label className="label">Transaction ID *</label>
                    <input className="input" value={form.transactionId} onChange={(e) => set('transactionId', e.target.value)} placeholder="e.g. 9F3KD2A1B7" />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-5">
            <h2 className="mb-4 font-semibold text-slate-800">Your order</h2>
            <div className="max-h-64 space-y-3 overflow-auto">
              {mounted && lines.map((l) => (
                <div key={`${l.kind}-${l.id}-${l.variant || ''}`} className="flex gap-3">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.image || '/placeholder.svg'} alt={l.name} className="h-14 w-14 rounded-md object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">{l.quantity}</span>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-2 text-slate-700">
                      {l.name}
                      {l.kind === 'bundle' && <Package size={11} className="ml-1 inline text-brand-500" />}
                    </p>
                    {l.variant && <p className="text-xs text-slate-400">{l.variant}</p>}
                    {l.kind === 'bundle' && l.bundleItems && l.bundleItems.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {l.bundleItems.map((b, i) => (
                          <li key={i} className="text-xs text-slate-400">• {b.name} × {b.quantity}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-800">{formatBDT(l.price * l.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{formatBDT(sub)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Delivery {form.city ? (/dhaka/i.test(form.city) ? '(inside Dhaka)' : '(outside Dhaka)') : ''}</span><span className="font-medium">{!form.city ? '—' : shipping === 0 ? 'Free' : formatBDT(shipping)}</span></div>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="text-xl font-bold text-brand-700">{formatBDT(total)}</span>
            </div>

            {/* pay-now / due breakdown */}
            <div className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Pay now {form.paymentMethod === 'cod' ? '(delivery charge)' : ''}</span>
                <span className="font-semibold text-green-700">{formatBDT(payNow)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due on delivery</span>
                <span className="font-semibold text-amber-700">{formatBDT(dueOnDelivery)}</span>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-accent mt-5 w-full py-3.5 text-base">
              {submitting ? <Loader2 className="animate-spin" /> : <><Lock size={16} /> Place order</>}
            </button>

            <div className="mt-4 space-y-1.5 text-xs text-slate-500">
              <p className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> Secure &amp; encrypted checkout</p>
              <p className="flex items-center gap-1.5"><Truck size={14} className="text-brand-500" /> Delivery in 1–3 business days</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
