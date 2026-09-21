/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vedic: {
          obsidian: '#080C16',
          dark: '#0A0F1D',
          navy: '#0F172A',
          charcoal: '#1E293B',
          card: '#161F36',
          gold: '#D4AF37',
          lightgold: '#F3E5AB',
          saffron: '#FF6F00',
          amber: '#F59E0B',
          cream: '#FCFAF5',
          sand: '#F7F3E9',
          border: '#E2D9C8',
          ruby: '#9E1B32',
          emerald: '#0F5257',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(212, 175, 55, 0.25)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 25px rgba(212, 175, 55, 0.4)',
        'elevated': '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        heartBeat: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        float: 'float 4s ease-in-out infinite',
        heartBeat: 'heartBeat 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }
    },
  },
  plugins: [],
}
