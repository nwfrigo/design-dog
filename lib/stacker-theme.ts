// Stacker PDF theme constants for light/dark mode

export interface StackerTheme {
  bg: string
  text: string
  textSecondary: string
  ctaColor: string
  cardBg: string
  cardBorder: string
  imageBorder: string
  imagePlaceholderBg: string
  dividerColor: string
  logoFill: string
  chipInactiveBorder: string
  chipInactiveDot: string
  chipInactiveText: string
  chipActiveBg: string
  chipActiveBorder: string
  chipActiveText: string
  statValueColor: string
  iconColor: string
}

export const STACKER_LIGHT: StackerTheme = {
  bg: 'white',
  text: 'black',
  textSecondary: 'black',
  ctaColor: '#060015',
  cardBg: '#F9F9F9',
  cardBorder: '0.25px solid #D9D8D6',
  imageBorder: '0.33px solid #D9D8D6',
  imagePlaceholderBg: '#f5f5f5',
  dividerColor: '#B3B2B1',
  logoFill: 'black',
  chipInactiveBorder: '#B3B2B1',
  chipInactiveDot: '#D9D8D6',
  chipInactiveText: '#B3B2B1',
  chipActiveBg: 'white',
  chipActiveBorder: '0.14px solid #B3B2B1',
  chipActiveText: 'black',
  statValueColor: 'black',
  iconColor: 'black',
}

export const STACKER_DARK: StackerTheme = {
  bg: '#060015',
  text: 'white',
  textSecondary: '#89888B',
  ctaColor: 'white',
  cardBg: '#060621',
  cardBorder: '0.50px solid #0080FF',
  imageBorder: '0.65px solid #54565B',
  imagePlaceholderBg: '#1E1E1E',
  dividerColor: '#37393D',
  logoFill: 'white',
  chipInactiveBorder: '#37393D',
  chipInactiveDot: '#37393D',
  chipInactiveText: '#37393D',
  chipActiveBg: 'rgba(0,128,255,0.10)',
  chipActiveBorder: '0.28px solid #0080FF',
  chipActiveText: 'white',
  statValueColor: '#D35F0B',
  iconColor: 'white',
}

export function getStackerTheme(darkMode?: boolean): StackerTheme {
  return darkMode ? STACKER_DARK : STACKER_LIGHT
}
