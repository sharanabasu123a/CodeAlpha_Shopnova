import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../lib/types';
import { useAuth } from '../context/authStore';

export default function RequireAuth({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const user = useAuth((s) => s.user);
  const initialized = useAuth((s) => s.initialized);
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
    } else if (admin && user.role !== 'admin') {
      navigate('/', { replace: true });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: "You don't have access to this page.", type: 'error' } }));
      }, 50);
    }
  }, [user, initialized, admin]);

  if (!initialized || !user || (admin && user.role !== 'admin')) return null;
  return <>{children}</>;
}

// Helper for guards that need the user object in render
export function useGuardUser(): User | null {
  const user = useAuth((s) => s.user);
  return useMemo(() => user, [user]);
}