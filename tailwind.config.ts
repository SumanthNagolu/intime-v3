import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			forest: {
  				'50': '#E8F5ED',
  				'100': '#C2E6D0',
  				'200': '#9DD6B3',
  				'300': '#79C796',
  				'400': '#54B779',
  				'500': '#0D4C3B',
  				'600': '#0B3F31',
  				'700': '#093228',
  				'800': '#07251E',
  				'900': '#041E16'
  			},
  			amber: {
  				'50': '#FEF3E2',
  				'100': '#FDE8C5',
  				'200': '#FBDCA8',
  				'300': '#F9D18B',
  				'400': '#F7C56E',
  				'500': '#F5A623',
  				'600': '#D68F1A',
  				'700': '#B37815',
  				'800': '#906110',
  				'900': '#6D4A0C'
  			},
  			slate: {
  				'50': '#F8F9FA',
  				'100': '#E9ECEF',
  				'200': '#DEE2E6',
  				'300': '#CED4DA',
  				'400': '#ADB5BD',
  				'500': '#2D3E50',
  				'600': '#253444',
  				'700': '#1D2A38',
  				'800': '#15202C',
  				'900': '#1A2332'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			heading: [
  				'Playfair Display"',
  				'Georgia',
  				'serif'
  			],
  			subheading: [
  				'Space Grotesk"',
  				'Inter',
  				'sans-serif'
  			],
  			body: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			],
  			mono: [
  				'IBM Plex Mono"',
  				'Courier New"',
  				'monospace'
  			]
  		},
  		boxShadow: {
  			'elevation-sm': '0 2px 8px rgba(13, 76, 59, 0.08)',
  			'elevation-md': '0 4px 12px rgba(13, 76, 59, 0.1)',
  			'elevation-lg': '0 8px 24px rgba(13, 76, 59, 0.15)',
  			'elevation-xl': '0 16px 32px rgba(13, 76, 59, 0.2)'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
