/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        elida: {
          beige: '#F5E6D3',
          peach: '#FFE4D6',
          lavender: '#E6E6FA',
          cream: '#FDFBF7',
          sand: '#E8DFD8',
          warm: '#FFE8D6',
          accent: '#B76E79',
          gold: '#D4AF37'
        }
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'lato': ['Lato', 'sans-serif']
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    }
  },
  plugins: []
}