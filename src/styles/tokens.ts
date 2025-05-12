
/**
 * Design tokens for the application
 * This centralizes all design values for consistent usage across the app
 */

export const tokens = {
  colors: {
    // Primary brand colors
    primary: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6", // Primary color
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    
    // Semantic status colors
    status: {
      success: {
        background: "#f0fdf4",
        text: "#166534",
        border: "#86efac",
      },
      warning: {
        background: "#fefce8",
        text: "#854d0e",
        border: "#fde047",
      },
      danger: {
        background: "#fef2f2",
        text: "#b91c1c",
        border: "#fca5a5",
      },
      info: {
        background: "#eff6ff",
        text: "#1e40af",
        border: "#93c5fd",
      },
      neutral: {
        background: "#f3f4f6",
        text: "#4b5563",
        border: "#d1d5db",
      },
    },
    
    // Neutral colors for text, backgrounds, etc.
    neutral: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
  
  // Spacing values (in pixels)
  spacing: {
    0: "0px",
    1: "0.25rem",  // 4px
    2: "0.5rem",   // 8px
    3: "0.75rem",  // 12px
    4: "1rem",     // 16px
    5: "1.25rem",  // 20px
    6: "1.5rem",   // 24px
    8: "2rem",     // 32px
    10: "2.5rem",  // 40px
    12: "3rem",    // 48px
    16: "4rem",    // 64px
    20: "5rem",    // 80px
    24: "6rem",    // 96px
  },
  
  // Font sizes
  fontSizes: {
    xs: "0.75rem",      // 12px
    sm: "0.875rem",     // 14px
    md: "1rem",         // 16px
    lg: "1.125rem",     // 18px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.25rem",   // 36px
  },
  
  // Font weights
  fontWeights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  
  // Radius values
  radius: {
    sm: "0.125rem",   // 2px
    md: "0.25rem",    // 4px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    full: "9999px",   // Fully rounded
  },
  
  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  
  // Z-index values
  zIndex: {
    0: "0",
    10: "10",
    20: "20",
    30: "30",
    40: "40",
    50: "50",
    auto: "auto",
  },
  
  // Transitions
  transitions: {
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
  },
};
