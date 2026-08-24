module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          green: {
            50: '#E8F5E9',   // Lightest mint background
            100: '#C8E6C9',  // Soft pastel green border
            200: '#A5D6A7',  // Medium pastel green for highlights
            500: '#4CAF50',  // Muted primary green
            700: '#2E7D32',  // Dark clinical green for text
          }
        }
      }
    },
  },
  plugins: [],
}
