import { create } from 'zustand';
import { api } from '../lib/api';
import type { User } from '../lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; password?: string }) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('agc_token'),
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/api/login', { email, password });
      localStorage.setItem('agc_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  register: async (body) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/api/register', body);
      localStorage.setItem('agc_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem('agc_token');
    set({ user: null, token: null });
  },

  loadProfile: async () => {
    const token = localStorage.getItem('agc_token');
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const { data } = await api.get('/api/profile');
      set({ user: data, token, initialized: true });
    } catch {
      localStorage.removeItem('agc_token');
      set({ user: null, token: null, initialized: true });
    }
  },

  updateProfile: async (body) => {
    const { data } = await api.put('/api/profile', body);
    set({ user: data });
  },
}));

// Listen for forced logout from the api interceptor (401 events).
if (typeof window !== 'undefined') {
  window.addEventListener('agc:logout', () => {
    useAuth.getState().logout();
  });
}