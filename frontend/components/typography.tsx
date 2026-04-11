import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { type, colors, fonts } from "@/lib/theme";

type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "lede"
  | "body"
  | "bodyMuted"
  | "label"
  | "meta"
  | "metaItalic"
  | "tiny";

type Props = TextProps & {
  variant?: Variant;
  color?: TextStyle["color"];
  serif?: boolean;
  italic?: boolean;
};

const variantStyle: Record<Variant, TextStyle> = {
  display: type.display,
  h1: type.h1,
  h2: type.h2,
  h3: type.h3,
  lede: type.lede,
  body: type.body,
  bodyMuted: type.bodyMuted,
  label: type.label,
  meta: type.meta,
  metaItalic: type.metaItalic,
  tiny: type.tiny,
};

export function Typography({
  variant = "body",
  color,
  serif,
  italic,
  style,
  ...rest
}: Props) {
  const base = variantStyle[variant];
  const flatStyle = StyleSheet.flatten(style) as TextStyle | undefined;
  const overrideSize = flatStyle?.fontSize;
  const autoLineHeight =
    overrideSize != null && overrideSize !== base.fontSize && flatStyle?.lineHeight == null
      ? Math.round(overrideSize * 1.4)
      : undefined;
  const serifOverride = serif
    ? { fontFamily: italic ? fonts.headingItalic : fonts.heading }
    : null;
  return (
    <Text
      {...rest}
      style={[
        base,
        italic && !serif && { fontStyle: "italic" },
        serifOverride,
        color != null && { color },
        style,
        autoLineHeight != null && { lineHeight: autoLineHeight },
      ]}
    />
  );
}

export const Display = (p: Omit<Props, "variant">) => (
  <Typography variant="display" {...p} />
);
export const Heading = ({
  level = 1,
  ...rest
}: Omit<Props, "variant"> & { level?: 1 | 2 | 3 }) => (
  <Typography variant={`h${level}` as Variant} {...rest} />
);
export const Lede = (p: Omit<Props, "variant">) => (
  <Typography variant="lede" {...p} />
);
export const Body = (p: Omit<Props, "variant">) => (
  <Typography variant="body" {...p} />
);
export const Muted = (p: Omit<Props, "variant">) => (
  <Typography variant="bodyMuted" {...p} />
);
export const Label = (p: Omit<Props, "variant">) => (
  <Typography variant="label" {...p} />
);
export const Meta = (p: Omit<Props, "variant">) => (
  <Typography variant="meta" {...p} />
);
export const MetaIt = (p: Omit<Props, "variant">) => (
  <Typography variant="metaItalic" {...p} />
);
export const Tiny = (p: Omit<Props, "variant">) => (
  <Typography variant="tiny" {...p} />
);

// Legacy helper: keep name for existing call sites.
// No longer all-caps — now a softer italic micro-label in the accent color.
export const Eyebrow = ({ color: c, ...rest }: Omit<Props, "variant">) => (
  <Typography
    variant="metaItalic"
    color={c ?? colors.primary}
    {...rest}
  />
);
