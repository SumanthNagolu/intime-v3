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
				// Forest Green - Primary Brand Color (InTime Original)
				forest: {
					'50': '#E8F5F1',
					'100': '#D1EBE3',
					'200': '#A3D7C7',
					'300': '#75C3AB',
					'400': '#47AF8F',
					'500': '#0D4C3B',  // Primary forest
					'600': '#0A3A2A',  // Dark forest
					'700': '#082D21',
					'800': '#062018',
					'900': '#04130F',
					'950': '#020908'
				},
				// Hublot Black - Secondary Brand Color
				hublot: {
					'50': '#F5F5F5',
					'100': '#E5E5E5',
					'200': '#CCCCCC',
					'300': '#999999',
					'400': '#666666',
					'500': '#333333',
					'600': '#1A1A1A',
					'700': '#0D0D0D',
					'800': '#080808',
					'900': '#000000',
					'950': '#000000'
				},
				// Gold - Premium Accent Color (InTime Original)
				gold: {
					'50': '#FBF9F3',
					'100': '#F7F3E7',
					'200': '#EFE7CF',
					'300': '#E3D5AF',
					'400': '#D4AF37',  // Classic gold
					'500': '#C9A961',  // Primary gold
					'600': '#B8964E',
					'700': '#9A7B3F',
					'800': '#7C6030',
					'900': '#5E4521',
					'950': '#3A2912'
				},
				// Keep amber for backwards compatibility (maps to gold)
				amber: {
					'50': '#FBF9F3',
					'100': '#F7F3E7',
					'200': '#EFE7CF',
					'300': '#E3D5AF',
					'400': '#D4AF37',
					'500': '#C9A961',
					'600': '#B8964E',
					'700': '#9A7B3F',
					'800': '#7C6030',
					'900': '#5E4521'
				},
				// Premium Neutrals (refined)
				charcoal: {
					'50': '#FAFAFA',
					'100': '#F5F5F5',
					'200': '#E5E5E5',
					'300': '#D4D4D4',
					'400': '#A3A3A3',
					'500': '#737373',
					'600': '#525252',
					'700': '#404040',
					'800': '#262626',
					'900': '#171717',
					'950': '#0A0A0A'
				},
				slate: {
					'50': '#F8F9FA',
					'100': '#F1F3F5',
					'200': '#E9ECEF',
					'300': '#CED4DA',
					'400': '#ADB5BD',
					'500': '#2D3E50',  // Main slate
					'600': '#253444',
					'700': '#1D2A38',
					'800': '#15202C',
					'900': '#0D1620'
				},
				// Premium backgrounds (keep cream as requested)
				cream: '#FDFBF7',
				cloud: '#F8F8F8',
				ivory: '#FFFCF5',
				// Semantic colors (refined)
				success: {
					'50': '#ECFDF5',
					'500': '#0A8754',
					'600': '#047857',
					'700': '#065F46'
				},
				warning: {
					'50': '#FFF7ED',
					'500': '#D97706',
					'600': '#C2410C',
					'700': '#9A3412'
				},
				error: {
					'50': '#FEF2F2',
					'500': '#DC2626',
					'600': '#B91C1C',
					'700': '#991B1B'
				},
				info: {
					'50': '#F0F9FF',
					'500': '#0369A1',
					'600': '#0284C7',
					'700': '#0369A1'
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
				// Hublot-style animation system (slower, more deliberate)
				'fade-in': 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-fast': 'fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-up': 'slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-down': 'slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-left': 'slideLeft 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-right': 'slideRight 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-out': 'scaleOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'shimmer': 'shimmer 2.5s linear infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'lift': 'lift 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'glow': 'glow 2s ease-in-out infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideLeft: {
					'0%': { transform: 'translateX(10px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				slideRight: {
					'0%': { transform: 'translateX(-10px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				scaleOut: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' },
				},
				lift: {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(-2px)' },
				},
				glow: {
					'0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(201, 169, 97, 0.5)' },
					'50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(201, 169, 97, 0.8)' },
				},
			},
			fontFamily: {
				heading: [
					'Raleway',
					'Helvetica Neue',
					'Helvetica',
					'Arial',
					'sans-serif'
				],
				subheading: [
					'Raleway',
					'Inter',
					'system-ui',
					'sans-serif'
				],
				body: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'sans-serif'
				],
				mono: [
					'"JetBrains Mono"',
					'"Fira Code"',
					'"Courier New"',
					'monospace'
				]
			},
			fontSize: {
				// Hublot-style type scale with wider letter spacing
				'display': ['4.5rem', { lineHeight: '5rem', fontWeight: '700', letterSpacing: '0.02em' }],
				'h1': ['3rem', { lineHeight: '3.5rem', fontWeight: '700', letterSpacing: '0.02em' }],
				'h2': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700', letterSpacing: '0.02em' }],
				'h3': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600', letterSpacing: '0.02em' }],
				'h4': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '0.01em' }],
				'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
				'body': ['1rem', { lineHeight: '1.625rem', fontWeight: '400' }],
				'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
				'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.05em' }],
				'nav': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500', letterSpacing: '0.03em' }],
			},
			boxShadow: {
				// Premium elevation system
				'elevation-xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
				'elevation-sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
				'elevation-md': '0 4px 16px rgba(0, 0, 0, 0.10)',
				'elevation-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
				'elevation-xl': '0 16px 32px rgba(0, 0, 0, 0.16)',
				'elevation-2xl': '0 24px 48px rgba(0, 0, 0, 0.20)',
				// Specialty shadows
				'glass': '0 8px 32px 0 rgba(13, 76, 59, 0.12)',
				'inner-glow': 'inset 0 2px 4px rgba(201, 169, 97, 0.1)',
				'premium': '0 20px 40px -12px rgba(13, 76, 59, 0.25)',
				'premium-lg': '0 32px 64px -12px rgba(13, 76, 59, 0.3)',
				'gold-glow': '0 4px 12px rgba(201, 169, 97, 0.3)',
				'gold-glow-lg': '0 6px 16px rgba(201, 169, 97, 0.4)',
			},
			spacing: {
				// Formalized 8px grid spacing scale
				'xs': '0.25rem',    // 4px
				'sm': '0.5rem',     // 8px
				'md': '1rem',       // 16px
				'lg': '1.5rem',     // 24px
				'xl': '2rem',       // 32px
				'2xl': '3rem',      // 48px
				'3xl': '4rem',      // 64px
				'4xl': '6rem',      // 96px
				'5xl': '8rem',      // 128px
				// Keep existing custom values for compatibility
				'18': '4.5rem',
				'22': '5.5rem'
			},
			borderRadius: {
				// Hublot-style sharp/subtle radius scale
				'none': '0',
				'xs': '2px',
				'sm': '4px',        // Primary radius for inputs, small cards
				'md': '6px',        // Buttons
				'lg': '8px',        // Cards, modals
				'xl': '12px',       // Large cards
				'2xl': '16px',      // Feature sections
				'3xl': '24px',      // Hero elements
				'full': '9999px',   // Pills, avatars
				// shadcn compatibility - default to sharp
				DEFAULT: '4px'
			},
			maxWidth: {
				// Container widths
				'container-sm': '640px',
				'container-md': '768px',
				'container-lg': '1024px',
				'container-xl': '1280px',
				'container-2xl': '1536px',
				'prose': '65ch'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
