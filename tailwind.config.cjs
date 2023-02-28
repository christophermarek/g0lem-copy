/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'grid-cols-3',
    'outline-yellow-300',
    'hover:outline-purple-600',
    'hover:scale-x-95',
    'hover:scale-y-95',
    'sm:hidden',
    'sm:flex-column',
    'sm:flex-row',
    'md:flex-row',
    'md:w-1/2',
    'w-full',
  ],
};
