import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

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
				// Rust - Warm Accent Color (for CTAs and highlights)
				rust: {
					'50': '#FDF6F3',
					'100': '#FBEAE3',
					'200': '#F6D5C8',
					'300': '#F0B8A1',
					'400': '#E68E6C',
					'500': '#C75B39',  // Main rust
					'600': '#B5482D',  // Slightly darker
					'700': '#9A3D26',
					'800': '#7F331F',
					'900': '#682A1A',
					'950': '#3A1409',
					DEFAULT: '#C75B39'  // Default rust color
				},
				// Premium Forest Green - Primary Brand Color
				forest: {
					'50': '#E8F5ED',
					'100': '#D1EBD9',
					'200': '#A3D7B3',
					'300': '#75C38D',
					'400': '#47AF67',
					'500': '#0D4C3B',  // Main brand color
					'600': '#0B3F31',
					'700': '#093228',
					'800': '#07251E',
					'900': '#0A3A2A',  // Deep forest (richer)
					'950': '#041E16'
				},
				// Refined Gold - Accent Color (replacing amber)
				gold: {
					'50': '#FDFBF7',
					'100': '#FAF6ED',
					'200': '#F5EDD9',
					'300': '#EBD9B3',
					'400': '#DFC18A',
					'500': '#C9A961',  // Main gold
					'600': '#D4AF37',  // Bright gold (highlights)
					'700': '#B8964E',
					'800': '#997D41',
					'900': '#7A6434',
					'950': '#5C4B27'
				},
				// Keep amber for backwards compatibility (maps to gold)
				amber: {
					'50': '#FDFBF7',
					'100': '#FAF6ED',
					'200': '#F5EDD9',
					'300': '#EBD9B3',
					'400': '#DFC18A',
					'500': '#C9A961',
					'600': '#D4AF37',
					'700': '#B8964E',
					'800': '#997D41',
					'900': '#7A6434'
				},
				// Premium Neutrals
				charcoal: {
					'50': '#F8F9FA',
					'100': '#E9ECEF',
					'200': '#DEE2E6',
					'300': '#CED4DA',
					'400': '#ADB5BD',
					'500': '#6C757D',
					'600': '#495057',
					'700': '#343A40',
					'800': '#212529',
					'900': '#1A1A1A',  // True charcoal
					'950': '#0D0D0D',
					DEFAULT: '#1A1A1A'  // Default to true charcoal (900)
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
				// Cream/Cloud backgrounds
				cream: '#FDFBF7',
				cloud: '#F8F9FA',
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
				// Refined animation system
				'fade-in': 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-fast': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-down': 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-left': 'slideLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-right': 'slideRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-out': 'scaleOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'shimmer': 'shimmer 2s linear infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
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
				bounceSubtle: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' },
				},
				glow: {
					'0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(201, 169, 97, 0.5)' },
					'50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(201, 169, 97, 0.8)' },
				},
			},
			fontFamily: {
				// Premium Heading - Elegant serif with character
				heading: [
					'"Cormorant Garamond"',
					'"Playfair Display"',
					'Georgia',
					'Cambria',
					'serif'
				],
				// Modern Subheading - Clean geometric sans
				subheading: [
					'"Plus Jakarta Sans"',
					'"Space Grotesk"',
					'Inter',
					'system-ui',
					'sans-serif'
				],
				// Body - Highly readable modern sans
				body: [
					'"Plus Jakarta Sans"',
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'sans-serif'
				],
				// Code - Developer-friendly monospace
				mono: [
					'"JetBrains Mono"',
					'"IBM Plex Mono"',
					'"Fira Code"',
					'"Courier New"',
					'monospace'
				]
			},
			fontSize: {
				// Formalized type scale
				'display': ['4.5rem', { lineHeight: '5rem', fontWeight: '900' }],  // 72px
				'h1': ['3rem', { lineHeight: '3.5rem', fontWeight: '900' }],       // 48px
				'h2': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],   // 36px
				'h3': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],   // 28px
				'h4': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],   // 20px
				'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }], // 18px
				'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],     // 16px
				'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
				'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.05em' }], // 12px
			},
			boxShadow: {
				// Premium elevation system
				'elevation-xs': '0 1px 2px rgba(10, 58, 42, 0.05)',
				'elevation-sm': '0 2px 8px rgba(10, 58, 42, 0.08)',
				'elevation-md': '0 4px 16px rgba(10, 58, 42, 0.10)',
				'elevation-lg': '0 8px 24px rgba(10, 58, 42, 0.12)',
				'elevation-xl': '0 16px 32px rgba(10, 58, 42, 0.16)',
				'elevation-2xl': '0 24px 48px rgba(10, 58, 42, 0.20)',
				// Specialty shadows
				'glass': '0 8px 32px 0 rgba(10, 58, 42, 0.12)',
				'inner-glow': 'inset 0 2px 4px rgba(201, 169, 97, 0.1)',
				'premium': '0 20px 40px -12px rgba(10, 58, 42, 0.25)',
				'premium-lg': '0 32px 64px -12px rgba(10, 58, 42, 0.3)',
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
				// Formalized radius scale for premium feel
				'none': '0',
				'sm': '0.5rem',     // 8px - inputs, small cards
				'md': '1rem',       // 16px - cards, buttons
				'lg': '1.5rem',     // 24px - large cards, modals
				'xl': '2rem',       // 32px - hero sections, feature cards
				'2xl': '2.5rem',    // 40px - extra large features
				'3xl': '3rem',      // 48px - signature large radius
				'full': '9999px',   // pills, avatars
				// shadcn compatibility
				DEFAULT: '1rem'
			},
			borderWidth: {
				'0': '0',
				'1': '1px',
				'2': '2px',
				'3': '3px',
				'4': '4px',
				'6': '6px',
				'8': '8px',
				DEFAULT: '1px'
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
	plugins: [tailwindcssAnimate],
};

export default config;
