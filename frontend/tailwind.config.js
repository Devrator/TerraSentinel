/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07090e',
          900: '#0d1117',
          850: '#131823',
          800: '#161d2d',
          700: '#222d42',
          600: '#334155',
        },
        risk: {
          low: '#10b981',      // emerald-500
          moderate: '#f59e0b', // amber-500
          high: '#f97316',     // orange-500
          critical: '#ef4444', // rose-500
        },
        hazard: {
          fire: '#f97316',
          flood: '#06b6d4',
          pollution: '#a855f7',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
