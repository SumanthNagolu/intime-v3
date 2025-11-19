import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // InTime Brand Colors: "Professional Forest" Identity
        forest: {
          50: '#E8F5ED',
          100: '#C2E6D0',
          200: '#9DD6B3',
          300: '#79C796',
          400: '#54B779',
          500: '#0D4C3B',   // PRIMARY BRAND COLOR
          600: '#0B3F31',
          700: '#093228',
          800: '#07251E',
          900: '#041E16',
        },
        amber: {
          50: '#FEF3E2',
          100: '#FDE8C5',
          200: '#FBDCA8',
          300: '#F9D18B',
          400: '#F7C56E',
          500: '#F5A623',   // SECONDARY BRAND COLOR
          600: '#D68F1A',
          700: '#B37815',
          800: '#906110',
          900: '#6D4A0C',
        },
        slate: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#2D3E50',   // NEUTRAL BRAND COLOR
          600: '#253444',
          700: '#1D2A38',
          800: '#15202C',
          900: '#1A2332',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        subheading: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'elevation-sm': '0 2px 8px rgba(13, 76, 59, 0.08)',
        'elevation-md': '0 4px 12px rgba(13, 76, 59, 0.1)',
        'elevation-lg': '0 8px 24px rgba(13, 76, 59, 0.15)',
        'elevation-xl': '0 16px 32px rgba(13, 76, 59, 0.2)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
