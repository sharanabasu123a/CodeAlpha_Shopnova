import { Link } from 'react-router-dom';
import type { Product } from '../lib/types';
import { discountPct, fmtINR } from '../lib/types';
import { usePreferences } from '../context/preferencesStore';

export default function ProductCard({ product }: { product: Product }) {
  const out = product.stock === 0;
  const d = discountPct(product);
  const { showImages } = usePreferences();

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative flex flex-col overflow-hidden rounded-sm bg-white text-slate-800 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-lg"
    >
      {out && (
        <span className="absolute top-2 right-2 z-10 rounded-sm bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-white">
          OUT OF STOCK
        </span>
      )}

      {/* image */}
      <div className="relative flex aspect-[5/6] items-center justify-center overflow-hidden bg-white p-3">
        {showImages ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-110 ${out ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 select-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-60">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Image Hidden</span>
          </div>
        )}
      </div>

      {/* info — just name + price */}
      <div className="flex flex-1 flex-col gap-0.5 border-t border-slate-100 px-3 py-2.5 text-left">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-tight text-slate-800">
          {product.name}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[15px] font-bold">{fmtINR(product.price)}</span>
          {d > 0 && <span className="text-xs text-slate-500 line-through">{fmtINR(product.mrp)}</span>}
          {d > 0 && <span className="text-[12px] font-semibold text-[#388e3c]">{d}% off</span>}
        </div>
      </div>
    </Link>
  );
}