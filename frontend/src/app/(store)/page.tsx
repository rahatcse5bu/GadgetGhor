'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  Headphones,
  ArrowRight,
  Package,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Product, Bundle, Category } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import BundleCard from '@/components/BundleCard';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newest, setNewest] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/products', { params: { featured: 'true', limit: 8 } })
      .then((r) => setFeatured(r.data.items)).catch(() => {});
    api.get('/products', { params: { sort: 'newest', limit: 8 } })
      .then((r) => setNewest(r.data.items)).catch(() => {});
    api.get('/bundles').then((r) => setBundles(r.data.slice(0, 3))).catch(() => {});
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="container-x grid items-center gap-8 py-14 md:grid-cols-2 md:py-20">
          <div className="animate-fade-up">
            <span className="badge bg-white/15 text-brand-50">
              Imported from China · Delivered across Bangladesh
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Premium gadgets &amp;<br />accessories, fair prices.
            </h1>
            <p className="mt-4 max-w-md text-brand-50/90">
              Chargers, power banks, earbuds, hubs and more — genuine products,
              fast delivery and cash on delivery anywhere in Bangladesh.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="btn bg-white px-6 py-3 text-brand-700 hover:bg-brand-50">
                Shop now <ArrowRight size={18} />
              </Link>
              <Link href="/bundles" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
                <Package size={18} /> Bundle deals
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=900&q=70"
              alt="Gadgets"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {[
            { icon: BadgeCheck, t: '100% Genuine', s: 'Authentic imported stock' },
            { icon: Truck, t: 'Fast Delivery', s: 'Nationwide in 1–3 days' },
            { icon: ShieldCheck, t: '7-Day Returns', s: 'Easy & hassle-free' },
            { icon: Headphones, t: 'Real Support', s: 'Chat, call or email' },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <f.icon size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.t}</p>
                <p className="text-xs text-slate-500">{f.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-x py-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/shop?category=${c.slug}`}
              className="card group overflow-hidden text-center"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <p className="px-2 py-3 text-sm font-medium text-slate-700 group-hover:text-brand-700">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="container-x py-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Featured products</h2>
            <Link href="/shop?sort=featured" className="text-sm font-medium text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* BUNDLES */}
      {bundles.length > 0 && (
        <section className="bg-brand-50/60 py-12">
          <div className="container-x">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Bundle &amp; save</h2>
                <p className="text-sm text-slate-500">Curated kits at a lower combined price.</p>
              </div>
              <Link href="/bundles" className="text-sm font-medium text-brand-600 hover:underline">
                All bundles →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bundles.map((b) => (
                <BundleCard key={b._id} bundle={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEWEST */}
      {newest.length > 0 && (
        <section className="container-x py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">New arrivals</h2>
            <Link href="/shop?sort=newest" className="text-sm font-medium text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {newest.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-x pb-16">
        <div className="rounded-2xl bg-brand-800 px-8 py-10 text-center text-white sm:px-16">
          <h2 className="text-2xl font-bold sm:text-3xl">Need it delivered today?</h2>
          <p className="mx-auto mt-2 max-w-lg text-brand-100">
            Order now and pay on delivery. Free shipping on orders over ৳5,000.
          </p>
          <Link href="/shop" className="btn mt-6 bg-accent-500 px-8 py-3 text-white hover:bg-accent-600">
            Start shopping <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
