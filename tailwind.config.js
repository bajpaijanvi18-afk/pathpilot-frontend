export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',
        primary: {
          DEFAULT: '#4F46E5',
          2: '#6366F1',
          soft: 'rgb(var(--primary-soft) / <alpha-value>)'
        },
        navy: '#14234B'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 4px 12px rgba(15, 23, 42, 0.04)',
        pop: '0 16px 40px rgba(15, 23, 42, 0.14)'
      }
    }
  }
}
