/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./public/apps/**/*.html",
  ],
  theme: {
    extend: {
      colors: { 
        'zone-audio': '#f43f5e', 
        'zone-video': '#0ea5e9', 
        'zone-story': '#eab308', 
        'zone-tech': '#10b981' 
      }
    },
  },
  plugins: [],
}