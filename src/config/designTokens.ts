export const designTokens = {
  colors: {
    primary: "#f97316", // Saffron Accent
    primaryHover: "#ea580c",
    primaryLight: "rgba(249, 115, 22, 0.1)",
    
    // Backgrounds
    bgLight: "#FDFCF7", // Warm Bookish Cream
    bgWhite: "#FFFFFF",
    bgDark: "#0B0F19", // Charcoal Dark
    bgDarkCard: "#0E1322",
    
    // Borders & Divider
    borderLight: "#E2E8F0",
    borderDark: "#1E293B",
    
    // Typography
    textLightPrimary: "#111111",
    textLightSecondary: "#475569",
    textDarkPrimary: "#F1F5F9",
    textDarkSecondary: "#94A3B8"
  },
  
  spacing: {
    touchTargetMin: "44px",
    headerHeightMobile: "52px",
    headerHeightDesktop: "72px",
    safeAreaBottom: "env(safe-area-inset-bottom)"
  },
  
  radius: {
    card: "12px",
    pill: "9999px",
    button: "8px"
  },
  
  shadows: {
    nav: "0 2px 15px -3px rgba(0,0,0,0.05)",
    drawer: "0 20px 25px -5px rgba(0,0,0,0.1)",
    card: "0 4px 6px -1px rgba(0,0,0,0.05)"
  },
  
  zIndex: {
    header: 40,
    bottomNav: 45,
    overlay: 50,
    drawer: 60,
    toast: 70
  },
  
  animations: {
    transitionDefault: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transitionFast: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    easingGentle: "cubic-bezier(0.4, 0, 0.2, 1)"
  }
};
