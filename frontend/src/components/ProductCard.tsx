import { Link } from 'react-router-dom';
import type { Product } from '../lib/types';
import { discountPct, fmtINR } from '../lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const out = product.stock === 0;
  const d = discountPct(product);

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
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-110 ${out ? 'opacity-40 grayscale' : ''}`}
        />
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