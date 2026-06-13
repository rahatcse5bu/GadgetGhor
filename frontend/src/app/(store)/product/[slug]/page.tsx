'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { formatBDT, discountPercent } from '@/lib/format';
import { useCart } from '@/store/cart';
import Stars from '@/components/Stars';
import ProductCard from '@/components/ProductCard';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const add = useCart((s) => s.add);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<Product>(`/products/slug/${slug}`)
      .then((r) => {
        setProduct(r.data);
        setActiveImg(0);
        setQty(1);
        return api.get('/products', {
          params: { category: r.data.category, limit: 5 },
        });
      })
      .then((r) =>
        setRelated(r.data.items.filter((p: Product) => p.slug !== slug).slice(0, 4)),
      )
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className="grid place-items-center py-32 text-slate-400">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="container-x py-32 text-center">
        <p className="text-slate-500">Product not found.</p>
        <Link href="/shop" className="btn-outline mt-4">Back to shop</Link>
      </div>
    );

  const off = discountPercent(product.price, product.compareAtPrice);
  const out = product.stock <= 0;

  const cartLine = {
    kind: 'product' as const,
    id: product._id,
    slug: product.slug,
    name: product.name,
    image: product.images?.[0] || '',
    price: product.price,
    maxStock: product.stock,
  };

  const addToCart = () => {
    add(cartLine, qty);
    toast.success('Added to cart');
  };
  const buyNow = () => {
    add(cartLine, qty);
    router.push('/checkout');
  };

  return (
    <div className="container-x py-8">
      <nav className="mb-5 text-sm text-slate-400">
        <Link href="/" className="hover:text-brand-600">Home</Link> /{' '}
        <Link href={`/shop?category=${product.category}`} className="hover:text-brand-600 capitalize">
          {product.category.replace(/-/g, ' ')}
        </Link>{' '}
        / <span className="text-slate-600">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <div className="card relative aspect-square overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images?.[activeImg] || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {off > 0 && (
              <span className="badge absolute left-3 top-3 bg-accent-500 text-white">-{off}%</span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImg ? 'border-brand-500' : 'border-transparent'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-500">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
          <div className="mt-2">
            <Stars rating={product.rating} count={product.numReviews} size={16} />
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatBDT(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatBDT(product.compareAtPrice)}</span>
                <span className="badge bg-accent-100 text-accent-600">Save {off}%</span>
              </>
            )}
          </div>

          <p className="mt-2 text-sm">
            {out ? (
              <span className="font-medium text-red-600">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="font-medium text-amber-600">Only {product.stock} left — order soon!</span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-green-600">
                <Check size={15} /> In stock
              </span>
            )}
          </p>

          <p className="mt-4 leading-relaxed text-slate-600">{product.description}</p>

          {/* qty + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-300">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-slate-600 hover:bg-slate-50">
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="grid h-11 w-11 place-items-center text-slate-600 hover:bg-slate-50">
                <Plus size={16} />
              </button>
            </div>
            <button onClick={addToCart} disabled={out} className="btn-outline flex-1 py-3 sm:flex-none">
              <ShoppingCart size={18} /> Add to cart
            </button>
            <button onClick={buyNow} disabled={out} className="btn-accent flex-1 py-3 sm:flex-none">
              Buy now
            </button>
          </div>

          {/* trust */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
            <div className="flex flex-col items-center gap-1"><Truck size={20} className="text-brand-500" /> Fast delivery</div>
            <div className="flex flex-col items-center gap-1"><RotateCcw size={20} className="text-brand-500" /> 7-day returns</div>
            <div className="flex flex-col items-center gap-1"><ShieldCheck size={20} className="text-brand-500" /> Genuine product</div>
          </div>

          {/* specs */}
          {product.specs?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-slate-800">Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-600">{s.key}</td>
                      <td className="py-2 text-slate-700">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold text-slate-800">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
