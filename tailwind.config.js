/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        paper: "#f8fafc",
        brand: {
          50:"#eff6ff",
          100:"#dbeafe",
          200:"#bfdbfe",
          500:"#2563eb",
          600:"#1d4ed8",
          700:"#1e3a5f",
          800:"#152a45",
          900:"#0f1e33",
        },
        accent: "#06b6d4",
        success: "#059669",
        warn: "#d97706",
      },
      fontFamily: { 
        sans: ["Plus Jakarta Sans","Inter","system-ui","sans-serif"], 
        mono: ["JetBrains Mono","SF Mono","monospace"] 
      },
      boxShadow: {
        'xs':'0 1px 2px rgba(15,23,42,0.06)',
        'soft':'0 4px 24px rgba(15,23,42,0.06)',
        'card':'0 1px 3px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.04)',
      },
      borderRadius: {
        'xl':'1rem',
        '2xl':'1.25rem',
      }
    },
  },
  plugins: [],
}
