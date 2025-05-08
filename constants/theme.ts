export const COLORS = {
    primary: '#4b61dc',
    primaryLight: '#dde3fb',
    primaryDark: '#354aa0',
    
    accent: '#dc4b4b',
    accentLight: '#ffeded',
    accentDark: '#aa3535',
    
    success: '#4bdc7d',
    successLight: '#e3fff0',
    successDark: '#35aa5e',
    
    warning: '#ffc107',
    warningLight: '#fff8e1',
    warningDark: '#ff8f00',
    
    info: '#00bcd4',
    infoLight: '#e0f7fa',
    infoDark: '#0097a7',
    
    background: '#ffffff',
    surface: '#f5f5f5',
    
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    
    border: '#E2E8F0',
    divider: '#e0e0e0',
    
    offline: '#dc4b4b',
    online: '#4bdc7d',
    pending: '#ffc107',
  };
  
  export const FONTS = {
    regular: 'Inter',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  };
  
  export const FONT_SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  };
  
  export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  export const BORDER_RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 1000,
  };
  
  export const SHADOWS = {
    light: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 5.46,
      elevation: 9,
    },
  };
  
  export const networkStatusColors = {
    PENDING: COLORS.warning,
    SENT: COLORS.success,
    FAILED: COLORS.accent,
  };