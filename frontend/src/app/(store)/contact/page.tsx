'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || form.message.length < 5) {
      toast.error('Please fill in your name, email and message');
      return;
    }
    setSending(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-slate-800">Contact us</h1>
        <p className="mt-2 text-slate-500">Questions about an order or a product? We&apos;re here to help.</p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-8 lg:grid-cols-5">
        {/* info */}
        <div className="space-y-4 lg:col-span-2">
          {[
            { icon: Phone, t: 'Call / WhatsApp', s: '+880 1700-000000' },
            { icon: Mail, t: 'Email', s: 'support@gadgetghor.com' },
            { icon: MapPin, t: 'Address', s: 'Dhaka, Bangladesh' },
            { icon: Clock, t: 'Hours', s: 'Sat–Thu, 10am – 8pm' },
          ].map((c) => (
            <div key={c.t} className="card flex items-center gap-4 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <c.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{c.t}</p>
                <p className="text-sm text-slate-500">{c.s}</p>
              </div>
            </div>
          ))}
        </div>

        {/* form */}
        <form onSubmit={submit} className="card p-6 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email *</label>
              <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Subject</label>
              <input className="input" value={form.subject} onChange={(e) => set('subject', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Message *</label>
              <textarea className="input" rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={sending} className="btn-primary mt-5 w-full py-3">
            {sending ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Send message</>}
          </button>
        </form>
      </div>
    </div>
  );
}
