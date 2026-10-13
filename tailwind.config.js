/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6ff',
          100: '#e8ecfe',
          200: '#d5dcfd',
          300: '#b4c0fb',
          400: '#8a97f7',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 4px 16px -2px rgb(15 23 42 / 0.06)',
        'card-hover': '0 8px 30px -6px rgb(15 23 42 / 0.12), 0 4px 12px -4px rgb(15 23 42 / 0.06)',
        elevated: '0 20px 50px -12px rgb(15 23 42 / 0.18)',
        glow: '0 0 0 1px rgb(99 102 241 / 0.08), 0 8px 24px -4px rgb(99 102 241 / 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      backgroundImage: {
        'mesh': 'radial-gradient(at 40% 20%, rgb(99 102 241 / 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(139 92 246 / 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgb(59 130 246 / 0.05) 0px, transparent 50%)',
        'hero-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #312e81 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
