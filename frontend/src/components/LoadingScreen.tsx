import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base">
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        className="relative mb-6 flex h-24 w-24 items-center justify-center"
      >
        <div className="glass flex h-20 w-16 items-center justify-center rounded-2xl">
          <motion.div
            animate={{ rotate: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="h-1.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary"
          />
        </div>
        <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-secondary/80 blur-[2px]" />
        <div className="absolute -left-2 -bottom-2 h-3 w-3 rounded-full bg-primary/80 blur-[2px]" />
      </motion.div>
      <p className="mb-3 font-display text-sm font-semibold tracking-widest text-subtitle uppercase">
        Loading Shop Nova
      </p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}