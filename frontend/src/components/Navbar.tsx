'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu, X, Package, Phone } from 'lucide-react';
import { useCart } from '@/store/cart';

const NAV = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=mobile-accessories', label: 'Mobile' },
  { href: '/shop?category=laptop-accessories', label: 'Laptop' },
  { href: '/shop?category=audio', label: 'Audio' },
  { href: '/bundles', label: 'Bundles' },
];

export default function Navbar() {
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : '/shop');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      {/* top strip */}
      <div className="bg-brand-700 text-center text-xs text-brand-50">
        <div className="container-x flex items-center justify-center gap-4 py-1.5">
          <span>🚚 Free delivery over ৳5,000</span>
          <span className="hidden sm:inline">· Cash on Delivery available</span>
          <Link href="/track" className="hidden items-center gap-1 hover:underline sm:flex">
            <Package size={13} /> Track order
          </Link>
        </div>
      </div>

      <div className="container-x flex items-center gap-4 py-3">
        <button
          className="lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>

        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">
            G
          </span>
          <span className="text-xl font-bold tracking-tight text-brand-800">
            Gadget<span className="text-brand-500">Ghor</span>
          </span>
        </Link>

        <form onSubmit={search} className="relative ml-2 hidden flex-1 md:block">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for chargers, earbuds, hubs…"
            className="input pl-10"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="relative ml-1 grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100"
          aria-label="Cart"
        >
          <ShoppingCart size={22} className="text-slate-700" />
          {mounted && count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-accent-500 px-1 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <form onSubmit={search} className="relative mb-3">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="input pl-10"
            />
          </form>
          <div className="flex flex-col">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/track"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50"
            >
              Track order
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50"
            >
              <Phone size={15} /> Contact us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
