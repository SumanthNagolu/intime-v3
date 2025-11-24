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
				// Academy Design System Colors (Exact Match)
				charcoal: '#1c1917',
				ivory: '#fafaf9',
				rust: '#ea580c',
				forest: '#4d7c0f',
				clay: '#78350f',
				stone: {
					'50': '#fafaf9',
					'100': '#f5f5f4',
					'200': '#e7e5e4',
					'300': '#d6d3d1',
					'400': '#a8a29e',
					'500': '#78716c',
					'600': '#57534e',
					'700': '#44403c',
					'800': '#292524',
					'900': '#1c1917',
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
				midnight: {
					'50': '#f6f7f9',
					'100': '#eceef2',
					'200': '#d5d9e2',
					'300': '#b0b8c9',
					'400': '#8591ab',
					'500': '#667191',
					'600': '#515a77',
					'700': '#424961',
					'800': '#393f52',
					'900': '#0f1419',
					'950': '#080a0d',
				},
				electric: {
					'500': '#3b82f6',
					'600': '#2563eb',
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
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-mesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
			},
			backdropBlur: {
				'xs': '2px',
			},
			animation: {
				// Academy Animations (Exact Match)
				'fade-in': 'fadeIn 0.7s ease-out',
				'slide-up': 'slideUp 0.7s ease-out',
				'scale-in': 'scaleIn 0.3s ease-out',
				'shimmer': 'shimmer 2s linear infinite',
				'confetti': 'confetti 1s ease-out forwards',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				// Academy Keyframes (Exact Match)
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' },
				},
				confetti: {
					'0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
					'100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
				},
			},
			fontFamily: {
				// Academy Font System (Exact Match)
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				serif: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
				// Legacy fonts (keeping for backwards compatibility)
				heading: [
					'"Playfair Display"',
					'Georgia',
					'serif'
				],
				subheading: [
					'"Space Grotesk"',
					'Inter',
					'sans-serif'
				],
				body: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'sans-serif'
				],
			},
			boxShadow: {
				'elevation-sm': '0 2px 8px rgba(13, 76, 59, 0.08)',
				'elevation-md': '0 4px 12px rgba(13, 76, 59, 0.1)',
				'elevation-lg': '0 8px 24px rgba(13, 76, 59, 0.15)',
				'elevation-xl': '0 16px 32px rgba(13, 76, 59, 0.2)',
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem'
			},
			borderRadius: {
				lg: '0.75rem',
				md: '0.5rem',
				sm: '0.25rem'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
