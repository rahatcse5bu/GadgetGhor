'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/bundles', label: 'Bundles', icon: Boxes },
  { href: '/admin/brands', label: 'Brands', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrate, logout, setAuth } = useAuth();
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);
  const [open, setOpen] = useState(false);

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  // Server-side guard: confirm the stored token is still valid AND belongs to
  // an admin. A tampered/expired token or a non-admin account is rejected here,
  // not just by hiding UI — every admin API call is also role-guarded server-side.
  useEffect(() => {
    if (!ready || isLogin) return;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('gg_token') : null;
    if (!stored) {
      router.replace('/admin/login');
      return;
    }
    let cancelled = false;
    api
      .get('/auth/me')
      .then((r) => {
        if (cancelled) return;
        if (r.data?.role !== 'admin') {
          logout();
          router.replace('/admin/login');
          return;
        }
        setAuth(stored, r.data);
        setVerified(true);
      })
      .catch(() => {
        if (cancelled) return;
        logout();
        router.replace('/admin/login');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isLogin, pathname]);

  if (isLogin) return <>{children}</>;

  if (!ready || !verified || !user || user.role !== 'admin') {
    return <div className="grid min-h-screen place-items-center text-slate-400">Verifying access…</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-brand-800 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white font-bold text-brand-700">G</span>
            <span className="font-bold">GadgetGhor</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="mt-2 space-y-1 px-3">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-brand-600 text-white' : 'text-brand-100 hover:bg-brand-700'
                }`}
              >
                <n.icon size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full space-y-1 p-3">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-100 hover:bg-brand-700">
            <ExternalLink size={18} /> View store
          </Link>
          <button
            onClick={() => { logout(); router.replace('/admin/login'); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-100 hover:bg-brand-700"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* main */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-slate-500">Hi, {user.name}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {user.name?.[0]?.toUpperCase()}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
