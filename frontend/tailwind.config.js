/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.js",
    "./src/**/*.{js,jsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mint: {
          50: "#F3FBF7",
          100: "#E4F6EC",
          200: "#C8EBD8",
          300: "#A7DEC2",
          400: "#78C8A0",
          500: "#4FAE7D",
          600: "#3F8F68",
          700: "#357257",
          800: "#305B49",
          900: "#294B3F"
        },
        cream: "#FFFDF8",
        ink: "#26352F"
      }
    }
  },
  plugins: []
};
