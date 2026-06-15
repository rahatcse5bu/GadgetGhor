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
import { resolveVideo } from '@/components/ProductVideo';
import { Play } from 'lucide-react';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const add = useCart((s) => s.add);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [variantLabel, setVariantLabel] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get<Product>(`/products/slug/${slug}`)
      .then((r) => {
        setProduct(r.data);
        setQty(1);
        // default to the first in-stock variant (or the first variant)
        if (r.data.hasVariants && r.data.variants?.length) {
          const firstInStock = r.data.variants.find((v) => (v.stock ?? 0) > 0);
          setVariantLabel((firstInStock || r.data.variants[0]).label);
        } else {
          setVariantLabel('');
        }
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

  // Reset the gallery's active media whenever the product or selected variant
  // changes — show the first image (video, if any, sits first in the strip).
  useEffect(() => {
    if (!product) return;
    const v =
      product.hasVariants && product.variants
        ? product.variants.find((x) => x.label === variantLabel)
        : undefined;
    const dVideo = v?.video || product.video;
    setActive(dVideo ? 1 : 0);
  }, [product, variantLabel]);

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

  const hasVariants = !!product.hasVariants && (product.variants?.length || 0) > 0;
  const selectedVariant = hasVariants
    ? product.variants!.find((v) => v.label === variantLabel)
    : undefined;

  // Effective price / stock / media take the selected variant into account.
  const effPrice = selectedVariant?.price ? selectedVariant.price : product.price;
  const effStock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock;
  // Variant media overrides the product's when the variant provides any.
  const displayImages =
    selectedVariant?.images?.length
      ? selectedVariant.images
      : selectedVariant?.image
        ? [selectedVariant.image]
        : product.images || [];
  const displayVideo = selectedVariant?.video || product.video || '';
  const effImage = displayImages[0] || '';

  const off = discountPercent(effPrice, product.compareAtPrice);
  const out = effStock <= 0;

  const cartLine = {
    kind: 'product' as const,
    id: product._id,
    slug: product.slug,
    name: product.name,
    image: effImage,
    price: effPrice,
    maxStock: effStock,
    variant: selectedVariant?.label || '',
  };

  const addToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast.error(`Please choose a ${product.variantLabel || 'variant'}`);
      return;
    }
    add(cartLine, qty);
    toast.success('Added to cart');
  };
  const buyNow = () => {
    if (hasVariants && !selectedVariant) {
      toast.error(`Please choose a ${product.variantLabel || 'variant'}`);
      return;
    }
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
          {(() => {
            // Unified media list: video first (if any), then images.
            // Uses the selected variant's media when it provides any.
            const media = [
              ...(displayVideo
                ? [{ kind: 'video' as const, src: displayVideo, thumb: displayImages[0] || '' }]
                : []),
              ...displayImages.map((img) => ({ kind: 'image' as const, src: img, thumb: img })),
            ];
            const current = media[active] || media[0];
            const vid = current?.kind === 'video' ? resolveVideo(current.src) : null;

            return (
              <>
                <div className="card relative aspect-square overflow-hidden bg-black">
                  {current?.kind === 'video' && vid ? (
                    vid.type === 'file' ? (
                      <video
                        src={vid.src}
                        poster={product.images?.[0]}
                        controls
                        autoPlay
                        playsInline
                        className="h-full w-full bg-black object-contain"
                      />
                    ) : (
                      <iframe
                        src={vid.src + (vid.src.includes('?') ? '&' : '?') + 'autoplay=1'}
                        title="Product video"
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={current?.src || '/placeholder.svg'}
                      alt={product.name}
                      className="h-full w-full bg-white object-cover"
                    />
                  )}
                  {off > 0 && (
                    <span className="badge absolute left-3 top-3 z-10 bg-accent-500 text-white">-{off}%</span>
                  )}
                </div>

                {media.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {media.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                          i === active ? 'border-brand-500' : 'border-transparent'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.thumb || '/placeholder.svg'}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {m.kind === 'video' && (
                          <span className="absolute inset-0 grid place-items-center bg-black/35">
                            <Play size={20} className="fill-white text-white" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* info */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-500">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
          <div className="mt-2">
            <Stars rating={product.rating} count={product.numReviews} size={16} />
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatBDT(effPrice)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatBDT(product.compareAtPrice)}</span>
                <span className="badge bg-accent-100 text-accent-600">Save {off}%</span>
              </>
            )}
          </div>

          {/* variant selector */}
          {hasVariants && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-slate-700">
                {product.variantLabel || 'Variant'}:{' '}
                <span className="text-slate-500">{selectedVariant?.label || 'Select an option'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants!.map((v) => {
                  const vOut = (v.stock ?? 0) <= 0;
                  const selected = v.label === variantLabel;
                  return (
                    <button
                      key={v.label}
                      onClick={() => setVariantLabel(v.label)}
                      disabled={vOut}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        selected
                          ? 'border-brand-500 bg-brand-50 font-medium text-brand-700'
                          : 'border-slate-300 text-slate-700 hover:border-brand-400'
                      } ${vOut ? 'cursor-not-allowed text-slate-400 line-through opacity-60' : ''}`}
                    >
                      {(v.images?.[0] || v.image) && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={v.images?.[0] || v.image} alt="" className="h-6 w-6 rounded object-cover" />
                      )}
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-3 text-sm">
            {out ? (
              <span className="font-medium text-red-600">Out of stock</span>
            ) : effStock <= 5 ? (
              <span className="font-medium text-amber-600">Only {effStock} left — order soon!</span>
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
              <button onClick={() => setQty((q) => Math.min(effStock, q + 1))} className="grid h-11 w-11 place-items-center text-slate-600 hover:bg-slate-50">
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
