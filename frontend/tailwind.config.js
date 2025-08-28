/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bfe0ff",
          300: "#95cdff",
          400: "#63b3ff",
          500: "#3b9aff",
          600: "#2177e6",
          700: "#195ec0",
          800: "#164f9e",
          900: "#143f7e"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2,12,27,0.06)"
      },
      borderRadius: {
        xxl: "1.25rem"
      }
    }
  },
  plugins: []
}
