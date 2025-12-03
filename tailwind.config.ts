import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        'primary': ['var(--font-league-spartan)', 'sans-serif'],
        'secondary': ['var(--font-urbanist)', 'sans-serif'],
        'main': ['var(--font-league-spartan)', 'sans-serif'],
        'secundary': ['var(--font-urbanist)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config