/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'glass-light': 'rgba(255, 255, 255, 0.14)',
        'glass-dark': 'rgba(10, 10, 12, 0.55)',
        'glass-border-light': 'rgba(255, 255, 255, 0.45)',
        'glass-border-dark': 'rgba(255, 255, 255, 0.12)'
      },
      boxShadow: {
        'glass-sm': '0 10px 30px rgba(15, 23, 42, 0.18)',
        'glass-md': '0 20px 45px rgba(15, 23, 42, 0.22)',
        'glass-lg': '0 35px 65px rgba(15, 23, 42, 0.3)'
      },
      backdropBlur: {
        xs: '6px'
      },
      backdropSaturate: {
        175: '1.75'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
