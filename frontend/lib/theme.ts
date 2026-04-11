// Flexoki — https://stephango.com/flexoki
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
  red300: "#E8705F",
  orange600: "#BC5215",
  orange400: "#DA702C",
  orange300: "#EC8B49",
  yellow600: "#AD8301",
  yellow400: "#D0A215",
  yellow300: "#DFB431",
  green600: "#66800B",
  green400: "#879A39",
  green300: "#A0AF54",
  cyan600: "#24837B",
  cyan400: "#3AA99F",
  cyan300: "#5ABDAC",
  blue600: "#205EA6",
  blue400: "#4385BE",
  blue300: "#66A0C8",
  purple600: "#5E409D",
  purple400: "#8B7EC8",
  purple300: "#A699D0",
  magenta600: "#A02F6F",
  magenta400: "#CE5D97",
  magenta300: "#E47DA8",
} as const;

export const colors = {
  bg: palette.paper,
  card: palette.paper,
  bgRaised: palette.base50,
  bgSunk: palette.base100,
  ui: palette.base100,
  uiHover: palette.base150,
  uiActive: palette.base200,
  border: palette.base150,
  borderStrong: palette.base200,
  black: palette.black,
  white: "#FFFFFF",

  fg: palette.black,
  fgMuted: palette.base700,
  fgFaint: palette.base500,
  fgDim: palette.base400,

  primary: palette.purple400,
  primaryDeep: palette.purple600,
  primarySoft: palette.purple300,
  onPrimary: palette.paper,

  success: palette.green400,
  warning: palette.yellow400,
  danger: palette.red400,
  info: palette.blue400,

  red: palette.red300,
  orange: palette.orange400,
  yellow: palette.yellow400,
  green: palette.green400,
  cyan: palette.cyan400,
  blue: palette.blue400,
  purple: palette.purple400,
  magenta: palette.magenta400,
} as const;

// Soft tints derived from accent colors (10% alpha hex suffix).
// Use for icon backdrops, subtle fills — never for text.
export const tint = {
  red: palette.red400 + "1f",
  orange: palette.orange400 + "1f",
  yellow: palette.yellow400 + "24",
  green: palette.green400 + "24",
  cyan: palette.cyan400 + "22",
  blue: palette.blue400 + "1f",
  purple: palette.purple400 + "22",
  magenta: palette.magenta400 + "1f",
} as const;

const accentTints: Record<string, string> = {
  [colors.red]: tint.red,
  [colors.orange]: tint.orange,
  [colors.yellow]: tint.yellow,
  [colors.green]: tint.green,
  [colors.cyan]: tint.cyan,
  [colors.blue]: tint.blue,
  [colors.purple]: tint.purple,
  [colors.magenta]: tint.magenta,
};

export const tintFor = (accent: string): string => {
  return accentTints[accent] ?? palette.base100;
};

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
  huge: 56,
} as const;

export const fonts = {
  heading: "Merriweather_700Bold",
  headingItalic: "Merriweather_400Regular_Italic",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemibold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
} as const;

// Typography — small sizes get a touch more letter-spacing and mixed case.
// No all-caps. Small text leans on italic + color rather than tracking.
export const type = {
  display: {
    fontFamily: fonts.heading,
    fontSize: 40,
    lineHeight: 52,
    color: colors.fg,
  },
  h1: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 40,
    color: colors.fg,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 32,
    color: colors.fg,
  },
  h3: {
    fontFamily: fonts.heading,
    fontSize: 19,
    lineHeight: 26,
    color: colors.fg,
  },
  lede: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.fgMuted,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.fg,
  },
  bodyMuted: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.fgMuted,
  },
  label: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.fg,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.fgMuted,
  },
  metaItalic: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 16,
    fontStyle: "italic" as const,
    color: colors.fgFaint,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.fgMuted,
  },
  tiny: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.fgMuted,
  },
} as const;
