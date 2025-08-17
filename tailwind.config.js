/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--white)',
        },
        secondary: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-secondary)',
        },
        muted: {
          DEFAULT: 'var(--bg-tertiary)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--bg-accent)',
          foreground: 'var(--text-secondary)',
        },
        destructive: {
          DEFAULT: 'var(--error-bg)',
          foreground: 'var(--error-text)',
        },
        border: 'var(--border-primary)',
        input: 'var(--border-secondary)',
        ring: 'var(--focus-ring)',

        // Original colors kept for compatibility if needed
        'black': '#000000',
        'white': '#ffffff',
        'gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        'blue': {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        'red': {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}; 