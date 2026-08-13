import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiTruck, FiShield, FiRefreshCw, FiStar, FiHeart } from 'react-icons/fi';
import { api, apiErrorMessage } from '../lib/api';
import type { Product } from '../lib/types';
import { discountPct, fmtINR } from '../lib/types';
import { useCart } from '../context/cartStore';
import { useAuth } from '../context/authStore';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState<null | { ok: boolean; msg: string }>(null);
  const [showOffers, setShowOffers] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  // review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const addItem = useCart((s) => s.addItem);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    setLoading(true);
    setImgIdx(0);
    api.get(`/api/product/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="animate-pulse rounded-sm bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="aspect-square bg-slate-200" />
            <div className="space-y-3">
              <div className="h-5 w-2/3 bg-slate-200" />
              <div className="h-4 w-1/2 bg-slate-200" />
              <div className="h-10 w-40 bg-slate-200" />
              <div className="h-24 bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const out = product.stock === 0;
  const d = discountPct(product);
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const offers = product.offers || [];
  const deliveryBy = new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const checkPin = () => {
    const valid = /^\d{6}$/.test(pin.trim());
    setPinResult(valid ? { ok: true, msg: `Delivery by ${deliveryBy} | Free` } : { ok: false, msg: 'Please enter a valid 6-digit pincode' });
  };

  const addToCart = () => {
    if (!user) return navigate(`/login?redirect=/product/${product._id}`);
    addItem(product._id, qty);
  };

  const buyNow = () => {
    if (!user) return navigate(`/login?redirect=/checkout`);
    addItem(product._id, qty);
    setTimeout(() => navigate('/checkout'), 350);
  };

  const submitReview = async () => {
    setReviewing(true);
    try {
      await api.post(`/api/product/${product._id}/review`, { rating: reviewRating, title: reviewTitle, comment: reviewComment });
      const r = await api.get(`/api/product/${id}`);
      setProduct(r.data);
      setReviewTitle('');
      setReviewComment('');
      window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: 'Thanks for your review!', type: 'success' } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: apiErrorMessage(e), type: 'error' } }));
    } finally {
      setReviewing(false);
    }
  };

  // rating distribution bars
  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const count = (product.reviews || []).filter((r) => Math.round(r.rating) === star).length;
    return { star, count, pct: (product.reviews?.length || 0) ? (count / product.reviews.length) * 100 : 0 };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* breadcrumb */}
      <nav className="mb-3 text-xs text-slate-400">
        Home › {product.category} › <span className="text-slate-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-sm bg-white shadow-sm lg:grid-cols-[380px_1fr]">
        {/* LEFT: image gallery (large & prominent) */}
        <div className="border-b border-slate-100 p-6 lg:border-r lg:border-b-0">
          <div className="relative mx-auto flex aspect-square max-w-xs items-center justify-center">
            <img src={gallery[imgIdx]} alt={product.name} className="h-full w-full object-contain" />
            <button
              onClick={() => setWishlisted((v) => !v)}
              className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-red-500"
              aria-label="Wishlist"
            >
              <FiHeart className={`text-lg ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`h-16 w-16 overflow-hidden rounded-sm border-2 bg-white p-1 ${i === imgIdx ? 'border-[#2874f0]' : 'border-slate-200'}`}
              >
                <img src={g} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
          {out && <p className="mt-4 rounded-sm bg-slate-100 py-2 text-center text-sm font-semibold text-slate-600">Currently Unavailable</p>}
        </div>

        {/* RIGHT: info */}
        <div className="p-6">
          <h1 className="text-lg font-medium text-slate-800">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{product.brand}</span> · {product.seller}
          </p>

          {/* rating row */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 rounded-sm bg-[#388e3c] px-2 py-0.5 font-bold text-white">
              {product.rating ? product.rating.toFixed(1) : '4.0'} <FiStar className="h-3.5 w-3.5 fill-white" />
            </span>
            <span className="font-semibold text-slate-700">{product.numReviews} Ratings</span>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-500">
              <span className="mr-3 text-[#388e3c]">No Exchange Available</span>
              <span className="text-[#2874f0]">Be the first to Review this product</span>
            </span>
          </div>

          {/* price */}
          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-semibold text-slate-800">{fmtINR(product.price)}</span>
            {d > 0 && (
              <>
                <span className="pb-1 text-base text-slate-500 line-through">{fmtINR(product.mrp)}</span>
                <span className="pb-1 text-base font-semibold text-[#388e3c]">{d}% off</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Inclusive of all taxes</p>

          {/* offers */}
          {!!offers.length && (
            <div className="mt-4 rounded-sm border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#2874f0]">Available offers</p>
                <button onClick={() => setShowOffers((v) => !v)} className="text-xs font-semibold text-[#2874f0]">
                  {showOffers ? 'Hide' : 'View all'}
                </button>
              </div>
              <ul className="mt-2 flex flex-col gap-1.5 text-xs text-slate-600">
                {(showOffers ? offers : offers.slice(0, 2)).map((o, i) => (
                  <li key={i}>
                    <span className="mr-1.5 text-[#2874f0]">■</span>{o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* delivery */}
          <div className="mt-4 rounded-sm border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-xs">
              <FiTruck className="text-xl text-[#2874f0]" />
              <span className="font-semibold text-[#388e3c]">Free Delivery</span>
              <span className="text-slate-500">Today by 10pm - Order within 9hrs 40mins</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinResult(null); }}
                placeholder="Enter Delivery Pincode"
                className="w-44 rounded-sm border border-slate-300 px-2 py-1.5 text-xs uppercase outline-none focus:border-[#2874f0]"
              />
              <button onClick={checkPin} className="text-xs font-semibold text-[#2874f0] hover:underline">Check</button>
            </div>
            {pinResult && (
              <p className={`mt-1.5 text-xs ${pinResult.ok ? 'text-[#388e3c]' : 'text-red-600'}`}>{pinResult.msg}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><FiShield className="text-[#2874f0]" /> 2 Year Warranty</span>
              <span className="flex items-center gap-1"><FiRefreshCw className="text-[#2874f0]" /> 7 Day Return Policy</span>
            </div>
          </div>

          {/* qty + buttons */}
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 border border-slate-300 px-3 py-2 text-sm">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={out} className="font-bold text-slate-600 disabled:opacity-40" aria-label="decrease quantity">−</button>
                <span className="w-6 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={out} className="font-bold text-slate-600 disabled:opacity-40" aria-label="increase quantity">+</button>
              </div>
              <p className="text-sm text-slate-600">
                Total: <span className="text-lg font-bold text-slate-800">{fmtINR(product.price * qty)}</span>
                {qty > 1 && <span className="ml-1 text-xs text-slate-500">({qty} × {fmtINR(product.price)})</span>}
              </p>
              <button
                onClick={addToCart}
                disabled={out}
                className="flex-1 rounded-sm bg-[#ff9f00] px-8 py-3.5 text-sm font-bold uppercase text-slate-900 shadow hover:bg-[#f09200] disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                onClick={buyNow}
                disabled={out}
                className="flex-1 rounded-sm bg-[#fb641b] px-8 py-3.5 text-sm font-bold uppercase text-white shadow hover:bg-[#e85c16] disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
            {out && <p className="mt-2 text-sm font-semibold text-red-600">This product is currently out of stock.</p>}
          </div>

          {/* seller */}
          <div className="mt-4 text-xs text-slate-500">
            Seller: <span className="font-semibold text-slate-700">{product.seller}</span> · 4.4 (2,780 ratings)
          </div>
        </div>
      </div>

      {/* Ratings & Reviews */}
      <div className="mt-4 rounded-sm bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-slate-700">Ratings & Reviews</p>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
          {/* rating summary */}
          <div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-semibold text-slate-800">{product.rating ? product.rating.toFixed(1) : '4.0'}</span>
              <div className="pb-1">
                <span className="flex items-center gap-1 text-sm font-bold text-slate-700">{product.rating ? product.rating.toFixed(1) : '4.0'} <FiStar className="h-4 w-4 fill-[#388e3c] text-[#388e3c]" /></span>
                <span className="text-xs text-slate-500">{product.numReviews} Ratings</span>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              {ratingDist.map((r) => (
                <div key={r.star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-slate-600">{r.star}★</span>
                  <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[#388e3c]" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-slate-400">{r.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-sm border border-slate-200 p-4">
              <p className="mb-3 text-sm font-bold text-slate-700">Rate this product</p>
              {user ? (
                <>
                  <div className="mb-2 flex gap-1 text-xl">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} onClick={() => setReviewRating(i)} className="text-yellow-400">
                        <FiStar className={i <= reviewRating ? 'fill-yellow-400' : ''} />
                      </button>
                    ))}
                  </div>
                  <input
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Review title"
                    className="mb-2 w-full rounded-sm border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#2874f0]"
                  />
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={2}
                    placeholder="Your review…"
                    className="mb-2 w-full resize-none rounded-sm border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#2874f0]"
                  />
                  <button
                    onClick={submitReview}
                    disabled={reviewing}
                    className="w-full rounded-sm bg-[#2874f0] py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {reviewing ? 'Submitting…' : 'Submit Review'}
                  </button>
                </>
              ) : (
                <button onClick={() => navigate(`/login?redirect=/product/${product._id}`)} className="w-full rounded-sm bg-[#2874f0] py-2 text-sm font-semibold text-white">
                  Login to review
                </button>
              )}
            </div>
          </div>

          {/* review list */}
          <div className="flex flex-col gap-4">
            {(product.reviews || []).length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No reviews yet. Be the first to review this product!</p>
            ) : (
              [...(product.reviews || [])].reverse().map((r, i) => (
                <div key={i} className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2874f0] text-xs font-bold text-white">
                      {(r.user?.name || r.name || 'U').charAt(0).toUpperCase()}
                    </span>
                    <p className="text-sm font-semibold text-slate-700">{r.user?.name || r.name || 'Anonymous'}</p>
                    <span className="ml-auto flex items-center gap-1 rounded-sm bg-[#388e3c] px-1.5 py-0.5 text-xs font-bold text-white">
                      {r.rating} <FiStar className="h-3 w-3 fill-white" />
                    </span>
                  </div>
                  {r.title && <p className="mt-2 text-sm font-bold text-slate-800">{r.title}</p>}
                  <p className="mt-0.5 text-sm text-slate-600">{r.comment || 'No comment.'}</p>
                  {r.createdAt && <p className="mt-1 text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}