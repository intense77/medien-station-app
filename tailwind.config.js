/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./public/index.html",
    "./public/apps/**/*.html",
    "./public/js/**/*.js",
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