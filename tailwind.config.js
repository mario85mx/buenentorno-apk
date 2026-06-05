/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#18052E',
        secondary: '#2D1B45',
        accent: '#E2354D',
        'light-gray': '#E5E7EB',
        'med-gray': '#9CA3AF',
        'dark-gray': '#374151',
        danger: '#FF1F1F',
        success: '#83A96A',
        warning: '#C59D2D',
      },
      fontFamily: {
        montserrat: ['Montserrat_400Regular'],
        'montserrat-bold': ['Montserrat_700Bold'],
        nunito: ['NunitoSans_400Regular'],
        'nunito-semibold': ['NunitoSans_600SemiBold'],
        heading: ['Montserrat_700Bold'],
        body: ['NunitoSans_400Regular'],
        'body-semibold': ['NunitoSans_600SemiBold'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        title: ['24px', { lineHeight: '32px', fontWeight: '700' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
