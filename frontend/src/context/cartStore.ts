import { create } from 'zustand';
import { api, apiErrorMessage } from '../lib/api';
import type { CartItem, CartResponse } from '../lib/types';

interface CartState {
  items: CartItem[];
  total: number;
  drawerOpen: boolean;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  setDrawer: (open: boolean) => void;
  count: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  drawerOpen: false,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get<CartResponse>('/api/cart');
      set({ items: data.items, total: data.total, loading: false });
    } catch {
      set({ items: [], total: 0, loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    try {
      await api.post('/api/cart', { productId, quantity });
      await get().fetchCart();
      get().setDrawer(true);
      toast('Added to cart', 'success');
    } catch (e) {
      toast(apiErrorMessage(e), 'error');
    }
  },

  updateQuantity: async (id, quantity) => {
    try {
      const { data } = await api.put<CartResponse>(`/api/cart/${id}`, { quantity });
      set({ items: data.items, total: data.total });
    } catch (e) {
      toast(apiErrorMessage(e), 'error');
    }
  },

  removeItem: async (id) => {
    try {
      const { data } = await api.delete<CartResponse>(`/api/cart/${id}`);
      set({ items: data.items, total: data.total });
      toast('Removed from cart', 'info');
    } catch (e) {
      toast(apiErrorMessage(e), 'error');
    }
  },

  clearCart: () => set({ items: [], total: 0 }),
  setDrawer: (open) => set({ drawerOpen: open }),
  count: () => get().items.reduce((s, i) => s + i.quantity, 0),
}));

// A lightweight event-based toast bus so stores can surface messages without importing a hook.
function toast(msg: string, type: 'success' | 'error' | 'info') {
  window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg, type } }));
}