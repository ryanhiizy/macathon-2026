// Flexoki light mode — https://stephango.com/flexoki
// Light mode uses the 600-weight accents; dark would use 400.
// Rule: NEVER invent colors. Only use values from the Flexoki palette below.

export const palette = {
  paper: "#FFFCF0",
  base50: "#F2F0E5",
  base100: "#E6E4D9",
  base150: "#DAD8CE",
  base200: "#CECDC3",
  base300: "#B7B5AC",
  base400: "#9F9D96",
  base500: "#878580",
  base600: "#6F6E69",
  base700: "#575653",
  base800: "#403E3C",
  base850: "#343331",
  base900: "#282726",
  base950: "#1C1B1A",
  black: "#100F0F",

  red600: "#AF3029",
  red400: "#D14D41",
  orange600: "#BC5215",
  orange400: "#DA702C",
  yellow600: "#AD8301",
  yellow400: "#D0A215",
  green600: "#66800B",
  green400: "#879A39",
  cyan600: "#24837B",
  cyan400: "#3AA99F",
  blue600: "#205EA6",
  blue400: "#4385BE",
  purple600: "#5E409D",
  purple400: "#8B7EC8",
  magenta600: "#A02F6F",
  magenta400: "#CE5D97",
} as const;

// Semantic tokens for light mode. Reference these in components, not palette.
// Swap the right-hand side to retheme for dark mode later.
export const colors = {
  // Backgrounds
  bg: palette.paper,
  bgRaised: palette.base50,
  card: palette.paper,
  ui: palette.base100,
  uiHover: palette.base150,
  uiActive: palette.base200,
  border: palette.base150,
  borderStrong: palette.base200,

  // Foregrounds
  fg: palette.black,
  fgMuted: palette.base700,
  fgFaint: palette.base500,
  fgDim: palette.base400,

  // Accents — primary is orange (Flexoki orange600 in light mode)
  primary: palette.orange600,
  primarySoft: palette.orange400,
  onPrimary: palette.paper,

  success: palette.green600,
  warning: palette.yellow600,
  danger: palette.red600,
  info: palette.blue600,

  // Named accents (for icons, circles, chips, etc.)
  red: palette.red600,
  orange: palette.orange600,
  yellow: palette.yellow600,
  green: palette.green600,
  cyan: palette.cyan600,
  blue: palette.blue600,
  purple: palette.purple600,
  magenta: palette.magenta600,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const fonts = {
  heading: "Merriweather_700Bold",
  headingItalic: "Merriweather_400Regular_Italic",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemibold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
} as const;

export const type = {
  display: { fontFamily: fonts.heading, fontSize: 40, lineHeight: 56, color: colors.fg },
  h1: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 42, color: colors.fg },
  h2: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 34, color: colors.fg },
  h3: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 30, color: colors.fg },
  eyebrow: { fontFamily: fonts.bodySemibold, fontSize: 12, letterSpacing: 1.4, color: colors.primary },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.fg },
  bodyMuted: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.fgMuted },
  label: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.fg },
  caption: { fontFamily: fonts.body, fontSize: 13, color: colors.fgMuted },
} as const;
