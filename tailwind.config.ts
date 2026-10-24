/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f8f3e7',
        cream: '#fbf6ea',
        ink: '#2c2a26',
        softink: '#676158',
        blush: '#fbe9e3',
        sage: '#e8f0e5',
        sky: '#e6eff5',
        lilac: '#f0e9f7',
        butter: '#f6edc8',
        thread: '#d9d0bd',
      },
      fontFamily: {
        hand: ['Caveat', 'cursive'],
        body: ['Nunito', 'sans-serif'],
        note: ['Lora', 'serif'],
      },
      boxShadow: {
        paper: '2px 3px 0 rgba(44,42,38,0.10)',
        lift: '4px 6px 0 rgba(44,42,38,0.12)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-in': {
          from: { opacity: '0', transform: 'scale(0.985)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0.35', transform: 'rotate(0deg) scale(0.96)' },
          '50%': { opacity: '1', transform: 'rotate(8deg) scale(1.04)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 450ms ease both',
        'soft-in': 'soft-in 220ms ease both',
        'toast-in': 'toast-in 250ms ease both',
        sparkle: 'sparkle 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
