/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E8202A', 'red-dark': '#B91C1C', 'red-glow': '#FF3B46',
          yellow: '#F5C518',
          black: '#050505', deep: '#0A0A0C', dark: '#121216', card: '#1A1A20',
          'card-hover': '#22222A', border: '#2D2D38', 'border-light': '#3D3D48',
          muted: '#7A7A8C', text: '#F0F0F5', 'text-dim': '#A0A0B0',
        },
        status: {
          pending: '#F59E0B', started: '#3B82F6', finished: '#10B981',
          new: '#E8202A', used: '#F5C518', repair: '#6366F1',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-red': 'pulseRed 2s infinite',
      },
      keyframes: {
        slideUp: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pulseRed: { '0%,100%': { boxShadow: '0 0 0 0 rgba(232,32,42,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(232,32,42,0)' } },
      },
      screens: { xs: '375px' },
      spacing: { safe: 'env(safe-area-inset-bottom)' },
    },
  },
  plugins: [],
}
