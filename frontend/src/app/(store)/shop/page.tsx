'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Product, Category, Paginated } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

function ShopInner() {
  const params = useSearchParams();
  const router = useRouter();

  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);

  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get<Paginated<Product>>('/products', {
        params: { category, search, sort, page, limit: 12 },
      })
      .then((r) => setData(r.data))
      .catch(() => setData({ items: [], total: 0, page: 1, pages: 1 }))
      .finally(() => setLoading(false));
  }, [category, search, sort, page]);

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== 'page') p.delete('page');
    router.push(`/shop?${p.toString()}`);
  };

  const activeCat = categories.find((c) => c.slug === category);

  return (
    <div className="container-x py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {search
            ? `Results for “${search}”`
            : activeCat
              ? activeCat.name
              : 'All products'}
        </h1>
        <p className="text-sm text-slate-500">
          {data ? `${data.total} product${data.total === 1 ? '' : 's'}` : '…'}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* sidebar */}
        <aside className="lg:w-56 lg:shrink-0">
          <div className="card p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <SlidersHorizontal size={16} /> Categories
            </p>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => setParam('category', '')}
                  className={`block w-full rounded-md px-2 py-1.5 text-left ${
                    !category ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All products
                </button>
              </li>
              {categories.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => setParam('category', c.slug)}
                    className={`block w-full rounded-md px-2 py-1.5 text-left ${
                      category === c.slug ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-end">
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="input max-w-[200px]"
            >
              <option value="newest">Newest</option>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {loading ? (
            <div className="grid place-items-center py-24 text-slate-400">
              <Loader2 className="animate-spin" />
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {data.items.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {data.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setParam('page', String(n))}
                      className={`h-9 w-9 rounded-lg text-sm font-medium ${
                        n === data.page ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 hover:bg-brand-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card grid place-items-center py-24 text-center">
              <p className="text-slate-500">No products found.</p>
              <button onClick={() => router.push('/shop')} className="btn-outline mt-4">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-slate-400">Loading…</div>}>
      <ShopInner />
    </Suspense>
  );
}
