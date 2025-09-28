import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // CounterOS Design Tokens - OBLIGATORY
        navy: {
          DEFAULT: "#0B1630",
          50: "#F8F9FB",
          100: "#E6E8EC", 
          200: "#B7BCC6",
          300: "#6B7280",
          400: "#374151",
          500: "#0B1630",
          600: "#0A1328",
          700: "#08101F",
          800: "#060C17",
          900: "#04080E",
        },
        accent: {
          DEFAULT: "#1FBF72",
          50: "#F0FDF7",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC", 
          400: "#4ADE80",
          500: "#1FBF72",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        warn: {
          DEFAULT: "#FF6A3D",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF6A3D",
          600: "#EA580C",
          700: "#C2410C", 
          800: "#9A3412",
          900: "#7C2D12",
        },
        gray: {
          50: "#FFFFFF",
          100: "#F6F7F9",
          200: "#E6E8EC",
          300: "#B7BCC6",
          400: "#6B7280",
          500: "#374151",
          600: "#111827",
          700: "#0F172A",
          800: "#0B1630",
          900: "#020617",
        },
        // Maintain shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))", 
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: "hsl(var(--primary-dark))",
          light: "hsl(var(--primary-light))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: "hsl(var(--secondary-light))",
          dark: "hsl(var(--secondary-dark))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Status colors
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        info: "hsl(var(--info))",
        // Interactive states
        hover: "hsl(var(--hover))",
        active: "hsl(var(--active))",
      },
      fontSize: {
        'display': ['2.125rem', { lineHeight: '2.5rem', fontWeight: '700' }], // 34px
        'xl-custom': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 22px
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16px
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
      },
      borderRadius: {
        'xs': '0.375rem', // 6px
        'sm': '0.5rem', // 8px
        'md': '0.625rem', // 10px
        'lg': '0.875rem', // 14px
        'xl': '1.125rem', // 18px
        // Keep original for compatibility
        DEFAULT: "var(--radius)",
      },
      boxShadow: {
        'card': '0 4px 16px rgba(9, 14, 34, 0.08)',
        'focus': '0 0 0 3px rgba(31, 191, 114, 0.28)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)', 
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-subtle': 'var(--gradient-subtle)',
      },
      transitionProperty: {
        'fast': 'var(--transition-fast)',
        'smooth': 'var(--transition-smooth)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
