import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastItem {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ msg: string; type: 'success' | 'error' | 'info' }>).detail;
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, ...detail }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    };
    window.addEventListener('agc:toast', handler as EventListener);
    return () => window.removeEventListener('agc:toast', handler as EventListener);
  }, []);

  const colors = {
    success: 'border-success/50 text-green-200',
    error: 'border-danger/60 text-red-200',
    info: 'border-secondary/50 text-cyan-100',
  };

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[90] flex w-72 flex-col gap-2 sm:right-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={`glass rounded-xl border px-4 py-3 text-sm font-medium ${colors[t.type]}`}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}