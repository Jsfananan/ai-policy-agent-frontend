module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      colors: {
        circuitryBlue: '#3C9EE7',
        candleGold: '#F4B860',
        cardBackground: '#F2D6CB',
        navy: '#1B2D45',
        olive: '#7A7869'
      }
    },
  },
  plugins: [],
}