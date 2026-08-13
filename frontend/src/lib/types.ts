export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface ProductReview {
  user: { _id: string; name: string };
  name?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  description: string;
  category: string;
  stock: number;
  image: string;
  gallery?: string[];
  rating: number;
  numReviews: number;
  highlights?: string[];
  specs?: { label: string; value: string }[];
  seller?: string;
  offers?: string[];
  reviews: ProductReview[];
  createdAt?: string;
}

export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  brand?: string;
  price: number;
  mrp?: number;
  image: string;
  category: string;
  stock: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

export interface Order {
  _id: string;
  orderId?: string;
  products: { productId: string; name: string; image: string; quantity: number; price: number }[];
  address: { line1: string; city: string; state: string; pincode: string; phone: string };
  paymentMethod: 'COD' | 'UPI' | 'Card';
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PagedProducts {
  products: Product[];
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  sort?: string;
}

export type Category = { name: string; icon: string; count: number };

export interface ProductFilters {
  brands: { name: string; count: number }[];
  priceBounds: { min: number; max: number };
}

// Flipkart-style helpers
export function discountPct(p: { price: number; mrp?: number }): number {
  if (!p.mrp || p.mrp <= 0 || p.mrp <= p.price) return 0;
  return Math.round(((p.mrp - p.price) / p.mrp) * 100);
}

export const fmtINR = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;