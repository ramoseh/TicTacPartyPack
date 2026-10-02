/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // NativeWind throws on web when the html class changes under 'media' mode.
  darkMode: 'class',
  theme: {
    extend: {
      // Keep in sync with palette in theme/pixel.ts (checked by __tests__/theme.test.ts).
      colors: {
        px: {
          ink: '#0F0F1B',
          night: '#1C1C3A',
          slate: '#2E3150',
          steel: '#565A7A',
          fog: '#A2ABB6',
          gray: '#C2C3C7',
          paper: '#F4F1E6',
          white: '#FFFFFF',
          black: '#000000',
          red: '#D62839',
          maroon: '#7A1023',
          orange: '#F77F00',
          yellow: '#FCBF49',
          blue: '#3A86FF',
          navy: '#1D4E9E',
          green: '#38B764',
        },
      },
      fontFamily: {
        pixel: ['PressStart2P_400Regular'],
        'pixel-body': ['PixelifySans_400Regular'],
      },
    },
  },
  plugins: [],
};
