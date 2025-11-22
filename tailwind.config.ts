import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        'main': ['"League Spartan"', 'sans-serif'],
        'secundary': ['Urbanist', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config