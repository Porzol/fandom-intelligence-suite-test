module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1A1A1A",
        text: "#FFEFDF",
        accent: "#D3AC7E",
        dark: {
          100: "#2A2A2A",
          200: "#3A3A3A",
          300: "#4A4A4A",
        },
        light: {
          100: "#FFEFDF",
          200: "#F5E5D5",
          300: "#EBDBC5",
        },
        status: {
          normal: "#4ADE80",
          caution: "#FACC15",
          risk: "#F87171",
        }
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
}
