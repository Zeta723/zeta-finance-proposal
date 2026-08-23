import type { Config } from 'tailwindcss'

// Tailwind 設定：把 Zeta 品牌色註冊成可複用的 design tokens
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        zeta: {
          navy: '#19324A',
          gold: '#D3AF37',
          cream: '#E8DCCB',
          ivory: '#F8F5EF',
          white: '#FFFFFF',
          text: '#333333',
          bg: '#F3F4F6',
          danger: '#B54A4A',
          positive: '#4F7965'
        }
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', 'sans-serif']
      },
      borderRadius: {
        card: '18px'
      },
      boxShadow: {
        soft: '0 8px 24px rgba(25, 50, 74, 0.08)',
        goldline: 'inset 0 -2px 0 0 #D3AF37'
      }
    }
  },
  plugins: []
} satisfies Config
