/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#0B1120',
        surface: 'rgba(255,255,255,0.08)',
        primary: '#7C3AED',
        secondary: '#06B6D4',
        success: '#22C55E',
        danger: '#EF4444',
        subtitle: '#94A3B8',
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        glow: '0 0 24px rgba(124, 58, 237, 0.45)',
      },
      backdropBlur: { xs: '2px' },
      backgroundImage: {
        aurora:
          'radial-gradient(ellipse at top left, rgba(124,58,237,0.35), transparent 55%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.3), transparent 55%), radial-gradient(ellipse at center, rgba(124,58,237,0.08), transparent 70%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shine: 'shine 0.9s ease forwards',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};