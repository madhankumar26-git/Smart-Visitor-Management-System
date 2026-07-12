export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        surface: '#FFFFFF',
        background: '#F8FAFC',
        sidebar: '#1E3A8A',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
