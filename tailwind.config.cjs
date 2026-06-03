const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
    "./data/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
      heading: ["var(--font-heading)", ...defaultTheme.fontFamily.sans],
      mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono]
    },
    extend: {
      colors: {
        background: "var(--surface-bg)",
        surface: "var(--surface-card)",
        muted: "var(--surface-muted)",
        text: {
          DEFAULT: "var(--text-default)",
          strong: "var(--text-strong)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)"
        },
        border: {
          DEFAULT: "var(--border-soft)",
          strong: "var(--border-strong)"
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          strong: "var(--accent-primary-strong)",
          secondary: "var(--accent-secondary)",
          tertiary: "var(--accent-tertiary)"
        },
        status: {
          info: "var(--status-info)",
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          danger: "var(--status-danger)"
        }
      },
      spacing: {
        px: "1px",
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)"
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)"
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)"
      }
    }
  },
  plugins: []
};
