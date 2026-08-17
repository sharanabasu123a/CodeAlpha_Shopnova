import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiFilter } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { api } from '../lib/api';
import type { PagedProducts, ProductFilters } from '../lib/types';
import { usePreferences } from '../context/preferencesStore';

const PAGE_SIZE = 16;
const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'popularity', label: 'Popularity' },
  { id: 'price_asc', label: 'Price -- Low to High' },
  { id: 'price_desc', label: 'Price -- High to Low' },
  { id: 'newest', label: 'Newest First' },
];
const RATINGS = [4, 3, 2];
const DISCOUNTS = [10, 20, 30, 40];

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const { showImages, toggleShowImages } = usePreferences();
  const search = params.get('search') || '';
  const category = params.get('category') || 'All';
  const page = parseInt(params.get('page') || '1', 10);
  const brand = params.get('brand') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const minRating = params.get('minRating') || '';
  const discount = params.get('discount') || '';
  const sort = params.get('sort') || 'relevance';

  const [data, setData] = useState<PagedProducts | null>(null);
  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // fetch filter facets whenever search/category changes
  useEffect(() => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (category !== 'All') q.set('category', category);
    api.get(`/api/products/filters?${q.toString()}`).then((r) => setFilters(r.data)).catch(() => {});
  }, [search, category]);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (category !== 'All') q.set('category', category);
    if (brand) q.set('brand', brand);
    if (minPrice) q.set('minPrice', minPrice);
    if (maxPrice) q.set('maxPrice', maxPrice);
    if (minRating) q.set('minRating', minRating);
    if (discount) q.set('discount', discount);
    if (sort !== 'relevance') q.set('sort', sort);
    q.set('page', String(page));
    q.set('limit', String(PAGE_SIZE));
    api.get(`/api/products?${q.toString()}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [search, category, brand, minPrice, maxPrice, minRating, discount, sort, page]);

  // merge pagination + new filter params
  const setFilter = (patch: Record<string, string>) => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    if (category !== 'All') next.set('category', category);
    if (sort !== 'relevance') next.set('sort', sort);
    Object.entries(patch).forEach(([k, v]) => {
      if (v && v !== 'All') next.set(k, v);
    });
    next.set('page', '1');
    setParams(next);
    setShowFilters(false);
  };

  const toggleBrand = (name: string) => {
    const list = brand ? brand.split(',') : [];
    const next = list.includes(name) ? list.filter((b) => b !== name) : [...list, name];
    setFilter({ brand: next.join(',') });
  };

  const pages = useMemo(
    () => (data ? Array.from({ length: data.totalPages }, (_, i) => i + 1) : []),
    [data]
  );

  const pmin = filters?.priceBounds?.min ?? 0;
  const pmax = filters?.priceBounds?.max ?? 100000;

  const FilterSidebar = (
    <div className="rounded-sm bg-white p-4 text-slate-800 shadow-sm">
      <p className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-bold text-[#2874f0]">
        <FiFilter /> Filters
      </p>

      {/* Display Options */}
      <div className="mb-4 border-b border-slate-100 pb-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Display Options</p>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showImages}
            onChange={toggleShowImages}
            className="h-4 w-4 accent-[#2874f0]"
          />
          Show Product Images
        </label>
      </div>

      {/* Category */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Category</p>
        <div className="flex flex-col gap-1.5">
          {['All', 'Electronics', 'Fashion', 'Shoes', 'Watches', 'Gaming'].map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={category === c}
                onChange={() => setFilter({ category: c })}
                className="h-4 w-4 accent-[#2874f0]"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Price</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            placeholder={String(pmin)}
            onChange={(e) => setFilter({ minPrice: e.target.value })}
            className="w-full rounded-sm border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-[#2874f0]"
          />
          <span className="text-slate-400">to</span>
          <input
            type="number"
            value={maxPrice}
            placeholder={String(pmax)}
            onChange={(e) => setFilter({ maxPrice: e.target.value })}
            className="w-full rounded-sm border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-[#2874f0]"
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          ₹{pmin.toLocaleString('en-IN')} – ₹{pmax.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Brand */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Brand</p>
        <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto pr-1">
          {(filters?.brands || []).map((b) => (
            <label key={b.name} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={brand.split(',').includes(b.name)}
                onChange={() => toggleBrand(b.name)}
                className="h-4 w-4 accent-[#2874f0]"
              />
              {b.name}
              <span className="ml-auto text-xs text-slate-400">({b.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Customer Ratings</p>
        <div className="flex flex-col gap-1.5">
          {RATINGS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={minRating === String(r)}
                onChange={() => setFilter({ minRating: minRating === String(r) ? '' : String(r) })}
                className="h-4 w-4 accent-[#2874f0]"
              />
              {r}★ & above
            </label>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Discount</p>
        <div className="flex flex-col gap-1.5">
          {DISCOUNTS.map((d) => (
            <label key={d} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={discount === String(d)}
                onChange={() => setFilter({ discount: discount === String(d) ? '' : String(d) })}
                className="h-4 w-4 accent-[#2874f0]"
              />
              {d}% or more
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* breadcrumb */}
      <p className="mb-3 text-xs text-slate-400">
        <span className="hover:text-[#2874f0]">Home</span> ›{' '}
        {category !== 'All' && <><span className="hover:text-[#2874f0]">{category}</span> › </>}
        <span className="text-slate-600">
          {data ? `${data.totalCount} items` : '…'} {search && `for "${search}"`}
        </span>
      </p>

      <div className="flex gap-4">
        {/* sidebar desktop */}
        <aside className="hidden w-60 shrink-0 lg:block">{FilterSidebar}</aside>

        {/* main */}
        <div className="min-w-0 flex-1">
          {/* toolbar */}
          <div className="mb-3 flex items-center justify-between gap-2 bg-white px-3 py-2 shadow-sm">
            <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-sm border border-slate-300 px-3 py-1.5 text-sm font-semibold lg:hidden">
              <FiFilter /> Filters
            </button>
            <div className="relative ml-auto flex items-center gap-1 text-sm">
              <span className="hidden text-slate-500 sm:inline">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setFilter({ sort: e.target.value })}
                className="cursor-pointer appearance-none rounded-sm bg-transparent px-6 py-1.5 text-sm font-semibold text-[#2874f0] outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none -ml-5 text-[#2874f0]" />
            </div>
          </div>

          {/* mobile filter panel */}
          {showFilters && (
            <div className="mb-3 lg:hidden">
              {FilterSidebar}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-[3/4] animate-pulse bg-slate-200" />)}
            </div>
          ) : data && data.products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="rounded-sm bg-white py-20 text-center text-slate-500 shadow-sm">
              <p className="mb-1 text-lg font-semibold text-slate-700">No products found</p>
              <p className="text-sm">Try removing filters or searching something else.</p>
              <button
                onClick={() => setParams(new URLSearchParams())}
                className="mt-4 rounded-sm bg-[#2874f0] px-6 py-2 text-sm font-semibold text-white"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => setFilter({ page: String(page - 1) })}
                className="rounded-sm border border-slate-300 px-3 py-1.5 font-semibold text-[#2874f0] disabled:opacity-40"
              >
                Previous
              </button>
              {pages.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter({ page: String(p) })}
                  className={`h-8 w-8 rounded-sm font-semibold ${p === page ? 'bg-[#2874f0] text-white' : 'border border-slate-300 text-[#2874f0]'}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= (data.totalPages || 1)}
                onClick={() => setFilter({ page: String(page + 1) })}
                className="rounded-sm border border-slate-300 px-3 py-1.5 font-semibold text-[#2874f0] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}